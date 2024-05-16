const downloadBtns = document.querySelectorAll(".download-btn");

downloadBtns.forEach((downloadBtn) => {
  downloadBtn.addEventListener("click", (e) => {
    e.preventDefault();
      fetchFile(downloadBtn.href);
  });
});

function fetchFile(url) {
  fetch(url)
    .then((res) => res.blob())
    .then((file) => {
      let tempUrl = URL.createObjectURL(file);
      let aTag = document.createElement("a");
      aTag.href = tempUrl;
      aTag.download = url.replace(/^.*[\\\/]/, "");
      document.body.appendChild(aTag);
      aTag.click();
      aTag.remove();
      URL.revokeObjectURL(tempUrl);
    })
    .catch(() => {
      alert("Failed to download file!");
    });
}
