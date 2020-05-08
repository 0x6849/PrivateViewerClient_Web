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
const btnFullscreen = document.querySelector("#btnFullscreen");
const timePercentLabel = document.querySelector("#timePercent");
var socket;
var lastState;
var roomName = prompt("Enter room id", "r1");
var hostname;

function init() {
    for (var i = 0; i < vids.length; i++) {
        vids[i].volume = 0;
    }
    if (typeof socketHost == "undefined") {
        var template = localStorage.getItem("hostname");
        if (!template) {
            template = "wss://hostname:port";
        }
        while (!hostname) {
            hostname = prompt("Server URL", template);
        }
        localStorage.setItem("hostname", hostname);
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
    document.body.addEventListener("keydown", keyDown);
    btnFullscreen.addEventListener("click", gotoFullscreen);
    updateSlider();
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
    if (newState["paused"] !== undefined) {
        const newPaused = newState["paused"];
        if (newPaused === true) {
            for (var i = 0; i < vids.length; i++) {
                vids[i].pause();
            }
            btnPause.classList.remove("btn-secondary");
            btnPause.classList.add("btn-primary");
            btnPlay.classList.add("btn-secondary");
            btnPlay.classList.remove("btn-success");
            if (vid.currentTime == 0) {
                btnStop.classList.add("btn-danger");
            } else {
                btnStop.classList.remove("btn-danger");
            }
        } else if (newPaused === false) {
            for (var i = 0; i < vids.length; i++) {
                vids[i].play();
            }
            btnPause.classList.add("btn-secondary");
            btnPause.classList.remove("btn-primary");
            btnPlay.classList.remove("btn-secondary");
            btnPlay.classList.add("btn-success");
            btnStop.classList.remove("btn-danger");
        }
    }
    if (newState["playSpeed"] !== undefined) {
        const newSpeed = parseFloat(newState["playSpeed"]);
        if (isFinite(newSpeed) && newSpeed >= 0) {
            for (var i = 0; i < vids.length; i++) {
                vids[i].playbackRate = newSpeed;
                inputSpeed();
            }
        }
    }
    lastState = newState;
}

init();