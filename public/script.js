document.addEventListener("DOMContentLoaded", (event) => {
  let dropArea = document.getElementById("drop-area");

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.classList.add("highlight");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("highlight");
  });

  dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.classList.remove("highlight");
    let files = event.dataTransfer.files;
    handleFiles(files);
  });

  document.getElementById("fileElem").addEventListener("change", (event) => {
    let files = event.target.files;
    handleFiles(files);
  });

  function handleFiles(files) {
    [...files].forEach(uploadFile);
  }

  function uploadFile(file) {
    let url = "/upload";
    let formData = new FormData();
    formData.append("file", file);

    fetch(url, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then(showImages)
      .catch(() => {
        /* Error Handling */
      });
  }

  function showImages() {
    fetch("/images")
      .then((response) => response.json())
      .then((images) => {
        let portafolio = document.getElementById("portafolio");
        portafolio.innerHTML = "";
        images.forEach((image) => {
          let div = document.createElement("div");
          div.classList.add("cardIMG");
          let img = document.createElement("img");
          img.src = `/image/${image.id}`;
          div.appendChild(img);
          portafolio.appendChild(div);
        });
      });
  }

  showImages();
});
