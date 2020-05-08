function videoSeeked(e) {
    seekTo(parseFloat(vidProgress.value) / 100.0 * vid.duration);
}

function seekTo(sec) {
    lastState = undefined;
    if (socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({
            "timeStamp": sec,
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
    var progress = vid.currentTime / vid.duration * 100;
    if (!isNaN(progress)) {
        vidProgress.value = progress;
        timestampLabel.innerText = timestampToString(vid.currentTime);
        timePercentLabel.innerText = progress.toFixed(2) + "%";
        if (isFinite(vid.duration)) {
            timestampLabel.innerText += "/" + timestampToString(vid.duration);
        }
        return;
    }
    vidProgress.value = 0;
    timestampLabel.innerText = timestampToString(0);
    timePercentLabel.innerText = "--%";
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

function setVolume(vol) {
    vid.volume = vol;
    txtVol.innerText = vol.toFixed(2);
    volume.value = vol;
}

function resetToOne() {
    speed.value = 1;
    changeSpeed();
}

function gotoFullscreen() {
    vid.requestFullscreen();
}

function keyDown(e) {
    switch (e.key) {
        case "k":
        case " ":
            if (vid.paused) {
                videoPlayed();
            } else {
                videoPaused();
            }
            e.preventDefault();
            e.stopPropagation();
            break;
        case "j":
            seekTo(Math.max(0, vid.currentTime - 10));
            break;
        case "l":
            seekTo(Math.min(vid.duration, vid.currentTime + 10));
            break;
        case "Left":
            seekTo(Math.max(0, vid.currentTime - 5));
            break;
        case "Right":
            seekTo(Math.min(vid.duration, vid.currentTime + 5));
            break;
        case "Up":
            setVolume(Math.min(1, vid.volume + 0.1));
            break;
        case "Down":
            setVolume(Math.max(0, vid.volume - 0.1));
            break;
    }
}