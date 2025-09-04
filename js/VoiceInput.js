// Simple voice input using MediaRecorder -> send to /api/stt -> paste transcript
(function(){
  let mediaRecorder = null;
  let chunks = [];
  let recording = false;
  let currentMime = 'audio/ogg;codecs=opus';

  async function start() {
    try {
      const constraints = { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Prefer OGG_OPUS for Google STT
      if (!MediaRecorder.isTypeSupported(currentMime)) {
        if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) currentMime = 'audio/ogg;codecs=opus';
        else throw new Error('Twoja przeglądarka nie wspiera audio/ogg;codecs=opus');
      }
      mediaRecorder = new MediaRecorder(stream, { mimeType: currentMime });
      chunks = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      mediaRecorder.onstop = onStop;
      mediaRecorder.start();
      recording = true;
      updateUI();
    } catch (e) {
      alert('Brak dostępu do mikrofonu lub błąd: ' + (e?.message || e));
    }
  }

  async function stop() {
    try {
      if (mediaRecorder && recording) mediaRecorder.stop();
      recording = false;
      updateUI();
    } catch (e) {
      console.error(e);
    }
  }

  function updateUI() {
    const btn = document.getElementById('MicBtn');
    if (!btn) return;
    btn.innerHTML = recording ? '<i class="fas fa-stop"></i>' : '<i class="fas fa-microphone"></i>';
    btn.classList.toggle('btn-danger', recording);
    btn.classList.toggle('btn-dark', !recording);
  }

  async function onStop() {
    try {
      const blob = new Blob(chunks, { type: currentMime });
      const base64 = await blobToBase64(blob);
      const headers = { 'Content-Type': 'application/json' };
      try { if (typeof API_Key !== 'undefined' && API_Key) headers['x-google-api-key'] = API_Key; } catch (e) {}
      const res = await fetch('/api/stt', {
        method: 'POST',
        headers,
        body: JSON.stringify({ audioBase64: base64, contentType: currentMime, languageCode: 'pl-PL' })
      });
      if (!res.ok) throw new Error('STT API error: ' + res.status);
      const data = await res.json();
      const t = data.transcript || '';
      if (t) {
        const ta = document.getElementById('txtMsg');
        if (ta) {
          ta.value = (ta.value ? ta.value + ' ' : '') + t;
          ta.dispatchEvent(new Event('input'));
        }
      }
    } catch (e) {
      alert('Błąd rozpoznawania mowy: ' + (e?.message || e));
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result; // data:...;base64,XXXX
        const base64 = String(dataUrl).split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Wire button
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('MicBtn');
    if (btn) {
      btn.addEventListener('click', function(){
        if (!recording) start(); else stop();
      });
    }
    updateUI();
  });
})();

