var GEMINI_API_KEY = API_Key; // not used here

async function Send(prompt, code) { // Uses backend /api/tts (Google Cloud TTS)
    try {
        const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-google-api-key': API_Key // authorize backend to use Google API key
            },
            body: JSON.stringify({
                text: String(prompt),
                voiceName: 'pl-PL-Wavenet-D', // męski, niski
                speakingRate: 1.0
            })
        });
        if (!res.ok) throw new Error('TTS API error: ' + res.status);
        const data = await res.json();
        if (!data.audioContent) throw new Error('Brak audioContent');
        const byteCharacters = atob(data.audioContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        const a = document.getElementById('down');
        a.href = url;
        a.download = 'bocik.mp3';
        $('#down').show();
        // Autoodtwarzanie
        const audio = new Audio(url);
        audio.play();
    } catch (err) {
        alert((err && err.message) ? err.message : 'Błąd generowania głosu');
        $('#down').hide();
    } finally {
        $('#Ask').html("Generate  <i class='far fa-paper-plane'></i>");
        $('#Ask').prop('disabled', false);
    }
}
