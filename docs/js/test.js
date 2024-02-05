const input = document.querySelector("input");
const log = document.getElementById("values");
let message = "";

//input.addEventListener("focusin", () => {typing = true});
input.addEventListener("input", updateValue);
input.addEventListener("keyup", sendMessage);

function updateValue(e) {
    message = e.target.value;
}

function sendMessage(e) {
    if (e.key=="Enter") {
        log.textContent += message+"\n";
        input.value = "";
    }
}