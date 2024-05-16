const editPinContainer = document.querySelector(".edit-pin-container");
let dataId = editPinContainer.getAttribute("data-id");
const cancelBtn = document.querySelector(".cancel-btn");
const deleteBtn = document.querySelector(".delete-btn");
const saveBtn = document.querySelector(".save-btn");

cancelBtn?.addEventListener("click", (event) => {
  event.preventDefault();
});
deleteBtn?.addEventListener("click", async (event) => {
  var previousUrl = document.referrer;

  event.preventDefault();
  const response = await fetch(`/delete-saved-pin/${dataId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    alert("Pin deleted");
  } else {
    if (response.status === 400) {
      return alert("Pin id is missing");
    } else if (response.status === 401) {
      return alert("Unauthorized access");
    } else if (response.status === 500) {
      alert("Something went wrong");
    }
  }

  window.location.href = previousUrl ? previousUrl : "/"
});
saveBtn?.addEventListener("click", async (event) => {
  var previousUrl = document.referrer;

  event.preventDefault();
  const selectedLi = document.querySelector("li.selected");
  let board = selectedLi?.innerText;

  if (!board) {
    return alert("Please select board");
  }

  const response = await fetch(`/edit-saved-pin/${dataId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ board }),
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
