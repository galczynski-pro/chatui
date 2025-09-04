var bTextToSpeechSupported = false;
var oSpeechSynthesisUtterance = null;
var oVoices = null;
window.voiceEnabled = false; // controlled from navbar toggle
window.useCloudTTS = true;   // prefer Google Cloud TTS in chat

function OnLoad() {
    if ('speechSynthesis' in window) {
        bTextToSpeechSupported = true;
        speechSynthesis.onvoiceschanged = function () {
            oVoices = window.speechSynthesis.getVoices();
        };
    }
}
function TextToSpeech(s) { // manual play, always speak if supported
    if (!bTextToSpeechSupported) return;
    oSpeechSynthesisUtterance = new SpeechSynthesisUtterance();
    if (oVoices && oVoices.length) {
        oSpeechSynthesisUtterance.voice = oVoices[0];
    }
    oSpeechSynthesisUtterance.lang = "pl-PL"; // default to Polish
    oSpeechSynthesisUtterance.text = s;
    window.speechSynthesis.speak(oSpeechSynthesisUtterance);
}
async function SpeakIfEnabled(s) { // auto play only when enabled
    if (!window.voiceEnabled) return;
    try {
        if (window.useCloudTTS) {
            // Call backend Google TTS and play returned MP3
            const headers = { 'Content-Type': 'application/json' };
            try { if (typeof API_Key !== 'undefined' && API_Key) headers['x-google-api-key'] = API_Key; } catch (e) {}
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers,
                body: JSON.stringify({ text: String(s), voiceName: 'pl-PL-Wavenet-D', speakingRate: 1.0 })
            });
            if (!res.ok) throw new Error('TTS API error: ' + res.status);
            const data = await res.json();
            if (!data.audioContent) throw new Error('Brak audioContent');
            const byteCharacters = atob(data.audioContent);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.play();
        } else {
            TextToSpeech(s);
        }
    } catch (e) {
        // fallback to Web Speech API
        TextToSpeech(s);
    }
}
// Click-to-play remains available
$(document).ready(function(){
  $(document).on("click", ".play", function(e){
    var id = $(this).attr("vall");
    TextToSpeech(id);
  });
});
