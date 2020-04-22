const vids = document.querySelectorAll("video");
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
const resetSpeed = document.querySelector("#resetSpeed");
var socket;
var lastState;
var roomName = prompt("Enter room id", "r1");
var hostname;

function init() {
    for (var i = 0; i < vids.length; i++) {
        vids[i].volume = 0;
    }
    if (!socketHost) {
        hostname = prompt("Server URL", "wss://hostname:port");
    } else {
        hostname = socketHost;
    }
    speed.addEventListener("change", changeSpeed);
    speed.addEventListener("input", inputSpeed);
    volume.addEventListener("input", changeVolume);
    vidProgress.addEventListener("change", videoSeeked);
    btnPlay.addEventListener("click", videoPlayed);
    btnPause.addEventListener("click", videoPaused);
    btnStop.addEventListener("click", videoStopped);
    vid.addEventListener("timeupdate", updateSlider);
    vid.addEventListener("ratechange", updateSpeedSlider);
    resetSpeed.addEventListener("click", resetToOne);
    changeVolume();
    initSocket();
}

function initSocket() {
    console.log("Connecting");
    socket = new WebSocket(hostname);
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
            for (var i = 0; i < vids.length; i++) {
                vids[i].pause();
            }
        } else if (newPaused === false) {
            for (var i = 0; i < vids.length; i++) {
                vids[i].play();
            }
        }
    }
    if (newState["timeStamp"] !== undefined) {
        const newTime = parseFloat(newState["timeStamp"]);
        if (isFinite(newTime) && newTime >= 0) {
            if (Math.abs(newTime - vid.currentTime) > 1) {
                for (var i = 0; i < vids.length; i++) {
                    vids[i].currentTime = newTime;
                }
            }
        }
    }
    if (newState["playSpeed"] !== undefined) {
        const newSpeed = parseFloat(newState["playSpeed"]);
        if (isFinite(newSpeed) && newSpeed >= 0) {
            for (var i = 0; i < vids.length; i++) {
                vids[i].playbackRate = newSpeed;
            }
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
    vidProgress.value = vid.currentTime / vid.duration * 100;
    timestampLabel.innerText = timestampToString(vid.currentTime);
}

function updateSpeedSlider() {
    speed.value = vid.playbackRate;
    txtSpeed.innerText = parseFloat(speed.value).toFixed(1)
}

function changeSpeed() {
    txtSpeed.innerText = parseFloat(speed.value).toFixed(1);
    lastState = undefined;
    socket.send(JSON.stringify({
        "playSpeed": speed.value,
        "action": "change"
    }));
}

function inputSpeed() {
    txtSpeed.innerText = parseFloat(speed.value).toFixed(1);
}

function changeVolume() {
    txtVol.innerText = parseFloat(volume.value).toFixed(2);
    vid.volume = parseFloat(volume.value);
}

function resetToOne() {
    speed.value = 1;
    changeSpeed();
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