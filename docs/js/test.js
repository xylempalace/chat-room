const chatInput = document.getElementById("chatInput");
const chatSend = document.getElementById("chatSend");
const usernameInput = document.getElementById("usernameInput");
const usernameSend = document.getElementById("usernameSend");
const log = document.getElementById("values");
let connected = false;
let typingUsername = "";
let message = "";
let username = "<User>";

chatInput.addEventListener("input", updateValue);
chatInput.addEventListener("keyup", updateValue);

usernameInput.addEventListener("input", updateUser);
usernameInput.addEventListener("keyup", updateUser);

setDisabled(chatInput, !connected);
setDisabled(chatSend, !connected);
setDisabled(usernameInput, connected);
setDisabled(usernameSend, connected);

document.addEventListener("readystatechange", (e) => {
	if (e.target.readyState === "complete") {
		updateInputAttributes();
	}
});

function updateValue(e) {
	if (e.key=="Enter") {
        sendMessage();
    }
    message = e.target.value;
}

function clearMessage() {
	chatInput.value = "";
	message = "";
}

function sendMessage() {
	if (message.length > 0) {
		log.textContent += username+" "+message+"\n";
		clearMessage();
	}
}

function printMessage(msg) {
	log.textContent += msg+"\n";
}

function recieveMessage(msg) {
	log.textContent += msg+"\n";
}

function updateUser(e) {
	if (e.key=="Enter") {
        setUser();
    }
    typingUsername = e.target.value;
}

function setUser() {
	if (!connected) {
		username = "<"+usernameInput.value+">";
		recieveMessage("Username set to "+username);
		connected = true;
		setDisabled(chatInput, !connected);
		setDisabled(chatSend, !connected);
		setDisabled(usernameInput, connected);
		setDisabled(usernameSend, connected);
	}
}

function setDisabled(element, state) {
	if (state) {
		element.setAttribute("disabled", true);
	} else {
		element.removeAttribute("disabled");
	}
}