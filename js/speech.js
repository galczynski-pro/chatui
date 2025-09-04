var bTextToSpeechSupported = false;
var oSpeechSynthesisUtterance = null;
var oVoices = null;
window.voiceEnabled = false; // controlled from navbar toggle

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
function SpeakIfEnabled(s) { // auto play only when enabled
    if (window.voiceEnabled) {
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

