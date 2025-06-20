import {
  inputEnabled,
  setDiv,
  message,
  setToken,
  token,
  enableInput,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showAddEdit, showDelete } from "./addEdit.js";

let storiesDiv = null;
let storiesTable = null;
let storiesTableHeader = null;

export const handleStories = () => {
  storiesDiv = document.getElementById("story");
  const logoff = document.getElementById("logoff");
  const addStory = document.getElementById("add-story");
  storiesTable = document.getElementById("story-table");
  storiesTableHeader = document.getElementById("story-table-header");
  
  storiesDiv.addEventListener("click", (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addStory) {
        showAddEdit(null);
      } else if (e.target.classList.contains("editButton")) {
        message.textContent = "";
        showAddEdit(e.target.dataset.id);
      } else if (e.target.classList.contains("deleteButton")) {
        message.textContent = "";
        showDelete(e.target.dataset.id);
      } else if (e.target === logoff) {
        setToken(null);
        message.textContent = "You have been logged off.";
        storiesTable.replaceChildren([storiesTableHeader]);
        showLoginRegister();
      }
    }
  });
};

export const showStories = async () => {
  try {
    enableInput(false);

    const response = await fetch("/api/v1/stories", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    let children = [storiesTableHeader];

    if (response.status === 200) {
      message.classList.remove("error");
      if (data.count === 0) {
        storiesTable.replaceChildren(...children); // clear this for safety
      } else {
        for (let i = 0; i < data.stories.length; i++) {
          let rowEntry = document.createElement("tr");

          let editButton = `<td><button type="button" class="editButton" data-id=${data.stories[i]._id}>edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.stories[i]._id}>delete</button></td>`;
          let rowHTML = `
            <td>${data.stories[i].title}</td>
            <td>${data.stories[i].description}</td>
            <td>${data.stories[i].tags}</td>
            <td>${formatDate(data.stories[i].storyDate)}</td>
            <td>${data.stories[i].isFavorite ? "✅" : "❌"}</td>
            ${editButton}${deleteButton}`;

          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry);
        }
        storiesTable.replaceChildren(...children);
      }
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(storiesDiv);
};

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
