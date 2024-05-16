/** PROFILE SECTION */

const pinContainers = document.querySelectorAll(".box-type-1 .pin-container");

pinContainers.forEach((container, i) => {
  const pins = container.querySelectorAll(".pin");

  pins.forEach((pin, j) => {
    if (pin instanceof HTMLElement) {
      pin.style.zIndex = `-${j + 1}`;
      pin.style.backgroundColor = "hsl(220, 6%, 15%)";
      if (j !== 0) {
        pin.style.left = `${j * 10}%`;
      }
    }
  });
});

function toggleContent(showPins) {
  const pinsContent = document.getElementById("pins-content");
  const boardsContent = document.getElementById("boards-content");

  if (showPins) {
    pinsContent.style.display = "grid";
    boardsContent.style.display = "none";
  } else {
    pinsContent.style.display = "none";
    boardsContent.style.display = "grid";
  }
}

const pinsButton = document.querySelector(".btn-pins");
const boardsButton = document.querySelector(".btn-boards");

pinsButton.addEventListener("click", () => {
  toggleContent(true);
});

boardsButton.addEventListener("click", () => {
  toggleContent(false);
});
