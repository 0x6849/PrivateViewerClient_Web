const file = document.querySelector("#file");
const file2 = document.querySelector("#file2");
const files = document.querySelectorAll(".file");
const urls = document.querySelectorAll(".url");
const txtUrl = document.querySelector("#txtUrl");
const txtUrl2 = document.querySelector("#txtUrl2");

function initFileLoading() {
    file.addEventListener("change", file1Selected);
    file2.addEventListener("change", file2Selected);
    txtUrl.addEventListener("change", () => {
        urlSelected(0);
    });
    txtUrl2.addEventListener("change", () => {
        urlSelected(1);
    });
}

function fileSelected(id) {
    vids[id].src = URL.createObjectURL(files[id].files[0]);
    vids[id].oncanplay = () => {
        if (lastState) {
            updateVideo(lastState);
        }
        updateSlider();
        vids[id].oncanplay = undefined;
    };
}

function urlSelected(id) {
    vids[id].src = urls[id].value;
    vids[id].oncanplay = () => {
        if (lastState) {
            updateVideo(lastState);
        }
        updateSlider();
        vids[id].oncanplay = undefined;
    };
}

function file1Selected() {
    fileSelected(0);
}

function file2Selected() {
    fileSelected(1);
}

initFileLoading();