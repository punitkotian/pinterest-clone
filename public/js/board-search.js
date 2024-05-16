const boardSearchContainer = document.querySelector(".board-search-container");
const selectBtn = document.querySelector(".select-btn");
const searchInp = document.querySelector(".search-input");
const options = document.querySelector(".options");

let boards = [];

async function fetchBoards() {
  const response = await fetch(`/boards`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  boards = data.boards;
  addBoards(); // Call addBoards() after fetching the data
}

function addBoards(selectedBoard) {
  options.innerHTML = "";
  boards.forEach(({ title }) => {
    let isSelected = title === selectedBoard ? "selected" : "";
    let li = `<li onclick="updateName(this)" class="${isSelected} body-medium">${title}</li>`;
    options.insertAdjacentHTML("beforeend", li);
  });
}

function updateName(selectedLi) {
  searchInp.value = "";
  addBoards(selectedLi.innerText);
  boardSearchContainer.classList.toggle("active");
  selectBtn.firstElementChild.innerText = selectedLi.innerText;
}

searchInp.addEventListener("input", () => {
  let arr = [];
  let searchedVal = searchInp.value.toLowerCase();
  arr = boards
    .filter(({ title }) => title.toLowerCase().startsWith(searchedVal))
    .map(
      ({ title }) =>
        `<li onclick="updateName(this)" class="body-medium">${title}</li>`
    )
    .join("");
  options.innerHTML = arr
    ? arr
    : `<p class="label-medium">Oops! Boards not found</p>`;
});

selectBtn.addEventListener("click", () => {
  boardSearchContainer.classList.toggle("active");
});

const params = window.location.search
const id = new URLSearchParams(params).get('id')

fetchBoards(); // Call fetchBoards() to fetch data
