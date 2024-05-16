/** PIN DETAILS: - comment section */
const dropDownBtn = document.querySelector(".drop-down-btn");
const dropDownArea = document.querySelector(".drop-down-area");
const arrow = document.querySelector(".drop-down-btn span");

dropDownBtn.addEventListener("click", () => {
  dropDownArea.classList.toggle("active");
  arrow.classList.toggle("rotate");
});