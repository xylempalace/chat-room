const textbox = document.getElementById("textbox");
const log = document.getElementById("chatLog");

textbox.addEventListener("input", sendMessage);

function sendMessage(message) {
    log.textContent = "\n"+message.target.value;
}