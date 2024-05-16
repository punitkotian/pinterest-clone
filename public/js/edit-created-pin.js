const editPinContainer = document.querySelector(".edit-pin-container");
const titleInput = document.querySelector(".edit-pin-container input.title");
let dataId = editPinContainer.getAttribute("data-id");
const descriptionInput = document.querySelector(
  ".edit-pin-container textarea.description"
);
const cancelBtn = document.querySelector(".cancel-btn");
const deleteBtn = document.querySelector(".delete-btn");
const saveBtn = document.querySelector(".save-btn");

cancelBtn.addEventListener("click", (event) => {
  event.preventDefault();
});
deleteBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  var previousUrl = document.referrer;

  const response = await fetch(`/delete-created-pin/${dataId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    alert("Pin deleted");
  } else {
    if (response.status === 400) {
      alert("Pin id is missing");
    } else if (response.status === 401) {
      alert("Unauthorized access");
    } else if (response.status === 500) {
      alert("Something went wrong");
    }
  }

  window.location.href = previousUrl ? previousUrl : "/"
});
saveBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  var previousUrl = document?.referrer;

  const selectedLi = document.querySelector("li.selected");
  const title = titleInput?.value;
  const description = descriptionInput?.value;
  let board = selectedLi?.innerText;

  const response = await fetch(`/edit-created-pin/${dataId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, board }),
  });

  if (response.ok) {
    alert("Pin updated");
  } else {
    if (response.status === 400) {
      return alert("Please select board");
    } else if (response.status === 401) {
      return alert("Unauthorized access");
    } else if (response.status === 500) {
      alert("Something went wrong");
    }
  }

  window.location.href = previousUrl ? previousUrl : "/"
});
