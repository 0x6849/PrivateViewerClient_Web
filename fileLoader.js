const file = document.querySelector("#file");
const file2 = document.querySelector("#file2");

function initFileLoading() {
    file.addEventListener("change", file1Selected);
    file2.addEventListener("change", file2Selected);
}

function file1Selected() {
    vids[0].src = URL.createObjectURL(file.files[0]);
    vids[0].oncanplay = () => {
        if (lastState) {
            updateVideo(lastState);
        }
        updateSlider();
        vids[0].oncanplay = undefined;
    };
}

function file2Selected() {
    vids[1].src = URL.createObjectURL(file2.files[0]);
    vids[1].oncanplay = () => {
        if (lastState) {
            updateVideo(lastState);
        }
        updateSlider();
        vids[1].oncanplay = undefined;
    };
}

initFileLoading();