const file = document.querySelector("#file");
const vid = document.querySelector("video");
const txtSpeed = document.querySelector("#txtSpeed");
const speed = document.querySelector("#speed");
var socket;
var programPlayed = false;
var programPaused = false;
var programSeeked = false;
var lastState;

function init() {
    file.addEventListener("change", fileSelected);
    vid.addEventListener("seeked", videoSeeked);
    vid.addEventListener("play", videoPlayed);
    vid.addEventListener("pause", videoPaused);
    speed.addEventListener("input", changeSpeed);
    initSocket();
}

function initSocket() {
    console.log("Connecting");
    socket = new WebSocket(socketHost);
    socket.addEventListener("open", () => {
        socket.send(JSON.stringify({
            "action": "join",
            "roomID": prompt("Enter room id", "r1"),
            "name": "webclient_" + Math.round(new Date() / 1000)
        }));
    });
    socket.addEventListener("close", () => {
        setTimeout(initSocket, 500);
    });
    socket.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data["action"]) {
            const action = data["action"].toString();
            if (action == "change") {
                updateVideo(data)
            }
        } else {
            console.log(data["result"] + ": " + data["message"]);
        }
    });
}

function updateVideo(newState) {
    if (newState["paused"] !== undefined) {
        const newPaused = newState["paused"];
        if (newPaused === true) {
            programPaused = true;
            vid.pause();
        } else if (newPaused === false) {
            programPlayed = true;
            vid.play();
        }
    }
    if (newState["timeStamp"] !== undefined) {
        const newTime = parseFloat(newState["timeStamp"]);
        if (isFinite(newTime) && newTime >= 0) {
            programSeeked = true;
            vid.currentTime = newTime;
        }
    }
    if (newState["playSpeed"] !== undefined) {
        const newSpeed = parseFloat(newState["playSpeed"]);
        if (isFinite(newSpeed) && newSpeed >= 0) {
            vid.playbackRate = newSpeed;
        }
    }
    lastState = newState;
}

function videoSeeked() {
    if (programSeeked) {
        programSeeked = false;
    } else {
        lastState = undefined;
        if (socket.readyState == WebSocket.OPEN) {
            socket.send(JSON.stringify({
                "timeStamp": vid.currentTime,
                "action": "change"
            }));
        }
    }
}

function videoPlayed() {
    if (programPlayed) {
        programPlayed = false;
    } else {
        lastState = undefined;
        socket.send(JSON.stringify({
            "paused": false,
            "action": "change"
        }));
    }
}

function videoPaused() {
    if (programPaused) {
        programPaused = false;
    } else {
        lastState = undefined;
        socket.send(JSON.stringify({
            "paused": true,
            "action": "change"
        }));
    }
}

function changeSpeed() {
    txtSpeed.innerText = speed.nodeValue;
}

function fileSelected() {
    vid.src = URL.createObjectURL(file.files[0]);
    vid.oncanplay = () => {
        updateVideo(lastState);
        vid.oncanplay = undefined;
    };
}

init();