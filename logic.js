const file = document.querySelector("#file");
const vid = document.querySelector("video");
const txtSpeed = document.querySelector("#txtSpeed");
const speed = document.querySelector("#speed");
const btnPlay = document.querySelector("#btnPlay");
const btnPause = document.querySelector("#btnPause");
const btnStop = document.querySelector("#btnStop");
const timestampLabel = document.querySelector("#timestamp");
const vidProgress = document.querySelector("#vidProgress");
const txtVol = document.querySelector("#txtVol");
const volume = document.querySelector("#volume");
var socket;
var lastState;
var roomName = prompt("Enter room id", "r1");

function init() {
    file.addEventListener("change", fileSelected);
    speed.addEventListener("change", changeSpeed);
    speed.addEventListener("input", inputSpeed);
    volume.addEventListener("input", changeVolume);
    vidProgress.addEventListener("change", videoSeeked);
    btnPlay.addEventListener("click", videoPlayed);
    btnPause.addEventListener("click", videoPaused);
    btnStop.addEventListener("click", videoStopped);
    video.addEventListener("timeupdate", updateSlider);
    initSocket();
}

function initSocket() {
    console.log("Connecting");
    socket = new WebSocket(socketHost);
    socket.addEventListener("open", () => {
        socket.send(JSON.stringify({
            "action": "join",
            "roomID": roomName,
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

function videoSeeked(e) {
    lastState = undefined;
    if (socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            "timeStamp": parseFloat(vidProgress.value) / 100.0 * vid.duration,
            "action": "change"
        }));
    }
}

function videoPlayed(e) {
    lastState = undefined;
    socket.send(JSON.stringify({
        "paused": false,
        "action": "change"
    }));
}

function videoPaused(e) {
    lastState = undefined;
    socket.send(JSON.stringify({
        "paused": true,
        "action": "change"
    }));
}

function videoStopped(e) {
    lastState = undefined;
    socket.send(JSON.stringify({
        "paused": true,
        "timeStamp": 0,
        "action": "change"
    }));
}

function updateSlider(e) {
    //vidProgress.value = vid.currentTime / vid.duration * 100;
    timestampLabel.innerText = timestampToString(vid.currentTime);
}

function changeSpeed() {
    txtSpeed.innerText = parseFloat(speed.value).toFixed(1);
    lastState = undefined;
    socket.send(JSON.stringify({
        "playSpeed": speed.value,
        "timeStamp": 0,
        "action": "change"
    }));
}

function inputSpeed() {
    txtSpeed.innerText = parseFloat(speed.value).toFixed(1);
}

function changeVolume() {
    txtVol.innerText = parseFloat(volume.value).toFixed(2);
}

function fileSelected() {
    vid.src = URL.createObjectURL(file.files[0]);
    vid.oncanplay = () => {
        if (lastState) {
            updateVideo(lastState);
        }
        vid.oncanplay = undefined;
    };
}

function timestampToString(time) {
    var isNeg = time < 0;
    time = Math.abs(time);
    var hours = Math.floor(time / 60.0 / 60.0);
    time -= (hours * 60 * 60);
    if (hours < 10) {
        hours = "0" + hours;
    } else {
        hours = "" + hours;
    }
    var minutes = Math.floor(time / 60.0);
    time -= (minutes * 60);
    if (minutes < 10) {
        minutes = "0" + minutes;
    } else {
        minutes = "" + minutes;
    }
    var seconds = time;
    if (seconds < 10) {
        seconds = "0" + seconds;
    } else {
        seconds = "" + seconds;
    }
    seconds = seconds.substr(0, 6);
    return (isNeg ? "-" : "") + hours + ":" + minutes + ":" + seconds;
}

init();