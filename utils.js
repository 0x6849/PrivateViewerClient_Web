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
    var seconds = time.toFixed(3);
    if (seconds < 10) {
        seconds = "0" + seconds;
    } else {
        seconds = "" + seconds;
    }
    seconds = seconds.substr(0, 6);
    return (isNeg ? "-" : "") + hours + ":" + minutes + ":" + seconds;
}