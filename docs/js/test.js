const input = document.getElementById("chatInput");
const log = document.getElementById("values");
let connected = true;
let typingUsername = "";
let message = "";
let username = "<User>";

//input.addEventListener("focusin", () => {typing = true});
input.addEventListener("input", updateValue);
input.addEventListener("keyup", updateValue);

function updateValue(e) {
	if (e.key=="Enter") {
        sendMessage(message);
		input.value = "";
    }
    message = e.target.value;
}

function sendMessage(msg) {
    log.textContent += username+" "+msg+"\n";
}

function recieveMessage(msg) {
	log.textContent += msg+"\n";
}

function updateUser(e) {
	if (e.key=="Enter") {
        setUser();
    }
    message = e.target.value;
}

function setUser() {
	username = "<"+">";
	connected = true;
}