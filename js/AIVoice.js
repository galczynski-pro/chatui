var GEMINI_API_KEY = API_Key; // Not used here; kept for consistency

function Send(prompt, code) { // Client-side Text-to-Speech using Web Speech API
    try {
        if (!('speechSynthesis' in window)) {
            alert('Speech Synthesis not supported in this browser.');
        } else {
            const utter = new SpeechSynthesisUtterance(String(prompt));
            utter.lang = 'en-US';
            window.speechSynthesis.speak(utter);
        }
    } finally {
        $('#Ask').html("Generate  <i class='far fa-paper-plane'></i>");
        $('#Ask').prop('disabled', false);
        $('#down').hide(); // No server-side MP3; hide download
    }
}

