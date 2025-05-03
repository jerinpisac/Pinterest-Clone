const box = document.querySelector(".uploadbox");
const input = document.querySelector(".uploadinput");

box.addEventListener("click", () => {
    input.click();
});

input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        box.innerHTML = "";

        if (file.type.startsWith("image/")) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.style.width = "100%";
            img.style.height = "auto";
            img.style.borderRadius = "12px";
            box.appendChild(img);
        } else if (file.type.startsWith("video/")) {
            const video = document.createElement("video");
            video.src = e.target.result;
            video.controls = true;
            video.style.width = "100%";
            video.style.height = "auto";
            video.style.borderRadius = "12px";
            box.appendChild(video);
        } else {
            box.innerHTML = `<p style="color:red; text-align:center">Unsupported file format. Please upload an image or a video.</p>`;
        }
    };

    reader.readAsDataURL(file);
});
