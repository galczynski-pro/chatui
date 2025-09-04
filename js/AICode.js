var GEMINI_API_KEY = API_Key; // Provide your Google AI Studio API Key

async function Send(prompt, code) { // Generate code via Gemini API
    try {
        const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(GEMINI_API_KEY);
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: String(prompt) }]}
                ]
            })
        });
        if (!res.ok) throw new Error('Gemini API error: ' + res.status + ' ' + res.statusText);
        const data = await res.json();
        let s = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) || '';
        // Try to extract code if wrapped in triple backticks
        const m = s.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
        if (m && m[1]) s = m[1];
        var highlight = Prism.highlight(s, Prism.languages.javascript, "javascript"); //Highlight Code Syntax
        $('#cod').html(highlight); //Add Code to page
        $('#Ask').html("Generate  <i class='far fa-paper-plane'></i>");
        $('#Ask').prop('disabled', false);
        $('#hdn_csv').val(s);
    } catch (err) {
        console.error(err);
        $('#cod').text('Error: ' + (err && err.message ? err.message : 'Unexpected error'));
        $('#Ask').html("Generate  <i class='far fa-paper-plane'></i>");
        $('#Ask').prop('disabled', false);
    }
}

  $(function () {
  $('#export').click(function(){//Export Chat in CSV format
  downloadCSV("geminiExport.csv",$('#hdn_csv').val());
  });
  })
    function downloadCSV(filename, content) {
  // It works on all HTML5 Ready browsers as it uses the download attribute of the <a> element:
  const element = document.createElement('a');

  //A blob is a data type that can store binary data
  // "type" is a MIME type
  // It can have a different value, based on a file you want to save
  const blob = new Blob([content], { type: 'plain/text' });

  //createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  const fileUrl = URL.createObjectURL(blob);

  //setAttribute() Sets the value of an attribute on the specified element.
  element.setAttribute('href', fileUrl); //file location
  element.setAttribute('download', filename); // file name
  element.style.display = 'none';

  //use appendChild() method to move an element from one element to another
  document.body.appendChild(element);
  element.click();
  //The removeChild() method of the Node interface removes a child node from the DOM and returns the removed node
  document.body.removeChild(element);
};
    
   function downloadFile(filename, content) {
  // It works on all HTML5 Ready browsers as it uses the download attribute of the <a> element:
  const element = document.createElement('a');

  //A blob is a data type that can store binary data
  // "type" is a MIME type
  // It can have a different value, based on a file you want to save
  const blob = new Blob([content], { type: 'plain/text' });

  //createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  const fileUrl = URL.createObjectURL(blob);

  //setAttribute() Sets the value of an attribute on the specified element.
  element.setAttribute('href', fileUrl); //file location
  element.setAttribute('download', filename); // file name
  element.style.display = 'none';

  //use appendChild() method to move an element from one element to another
  document.body.appendChild(element);
  element.click();

  //The removeChild() method of the Node interface removes a child node from the DOM and returns the removed node
  document.body.removeChild(element);
};
//Clear chat
     $(document).ready(function(){
    $('#clear').click(function(){//Clear Chat
    let text = "Do you want to clear chat?";
  if (confirm(text) == true) {
 var theDiv = document.getElementById("mssg");
theDiv.innerHTML="";
  }
});
 $('#export').click(function(){
 var cnt=$("#cod").text();
 downloadFile("BocikCode.txt",cnt);
 });
});
function copyText(){
		  const code = document.getElementById("cod");
		  const range = document.createRange();
		  range.selectNode(code);
		  window.getSelection().removeAllRanges();
		  window.getSelection().addRange(range);
		  document.execCommand("copy");
		  window.getSelection().removeAllRanges();
		    $(".msgg").show().delay(5000).fadeOut();
		}
   
    function downloadFile(filename, content) {
  const element = document.createElement('a');

  //A blob is a data type that can store binary data
  // "type" is a MIME type
  // It can have a different value, based on a file you want to save
  const blob = new Blob([content], { type: 'plain/text' });

  //createObjectURL() static method creates a DOMString containing a URL representing the object given in the parameter.
  const fileUrl = URL.createObjectURL(blob);

  //setAttribute() Sets the value of an attribute on the specified element.
  element.setAttribute('href', fileUrl); //file location
  element.setAttribute('download', filename); // file name
  element.style.display = 'none';

  //use appendChild() method to move an element from one element to another
  document.body.appendChild(element);
  element.click();

  //The removeChild() method of the Node interface removes a child node from the DOM and returns the removed node
  document.body.removeChild(element);
};
