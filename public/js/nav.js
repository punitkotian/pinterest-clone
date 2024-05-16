/** NAV SECTION */

const navMenu = document.querySelector(".nav-menu");
const navBurgerIcon = document.querySelector(".nav-burger");
const navCloseIcon = document.querySelector(".nav-close");
const main = document.querySelector(".main");
const nav = document.querySelector(".nav");

navBurgerIcon.addEventListener("click", () => {
  navBurgerIcon.classList.remove("active");
  navCloseIcon.classList.add("active");
  navMenu.classList.add("show-nav-menu");
});
navCloseIcon.addEventListener("click", () => {
  navBurgerIcon.classList.add("active");
  navCloseIcon.classList.remove("active");
  navMenu.classList.remove("show-nav-menu");
});

function adjustBodyPadding() {
  const navHeight = nav.clientHeight;
  main.style.marginTop = `${navHeight}px`;
}

window.addEventListener("load", adjustBodyPadding);
window.addEventListener("resize", adjustBodyPadding);