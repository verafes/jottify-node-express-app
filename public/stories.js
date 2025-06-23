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
const storiesContainer = document.getElementById("stories-grid");
let currentView = 'cards';
const tableViewBtn = document.getElementById("table-view-btn");
const cardViewBtn = document.getElementById("card-view-btn");

export const handleStories = () => {
  storiesDiv = document.getElementById("story");
  const logoff = document.getElementById("logoff");
  const addStory = document.getElementById("add-story");
  storiesTable = document.getElementById("story-table");
  storiesTableHeader = document.getElementById("story-table-header");
  
  // View toggle event listeners
  tableViewBtn.addEventListener("click", () => {
    currentView = 'table';
    tableViewBtn.classList.add("active");
    cardViewBtn.classList.remove("active");
    storiesTable.style.display = "table";
    storiesContainer.style.display = "none";
  });
  
  cardViewBtn.addEventListener("click", () => {
    currentView = 'cards';
    cardViewBtn.classList.add("active");
    tableViewBtn.classList.remove("active");
    storiesTable.style.display = "none";
    storiesContainer.style.display = "grid";
  });
  
  // Sort dropdown
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      const [sortBy, order] = e.target.value.split("-");
      // Reset to first page on sort change
      showStories(1, sortBy, order);
    });
  }
  
  window.addEventListener("resize", () => {
    if (currentView === "cards") {
      showStories(1, currentSortBy, currentOrder);
    }
  });
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
        message.textContent = "You have been logged off. Until next time. Your Stories are safe!";
        storiesTable.replaceChildren([storiesTableHeader]);
        // storiesContainer.replaceChildren(cards)
        showLoginRegister();
        document.getElementById("get-started")?.style.setProperty("display", "inline-block");
        document.getElementById("logon-register")?.style.setProperty("display", "flex");
      }
    }
  });
};

let currentPage = 1;
let currentSortBy = 'date';
let currentOrder = 'desc';

export const showStories = async (page = 1, sortBy = 'date', order = 'desc') => {
  try {
    enableInput(false);
    currentPage = page;
    currentSortBy = sortBy;
    currentOrder = order;
    let limit = 5;

    const storiesPerRow = () => {
      const estimatedCardWidth = 280; // average card width incl. gap
      const containerWidth = storiesContainer.offsetWidth;
      return Math.max(1, Math.floor(containerWidth / estimatedCardWidth));
    };
    
    const response = await fetch(`/api/v1/stories?page=${currentPage}&limit=${limit}&sortBy=${sortBy}&order=${order}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    // Get tbody element inside your table
    const tbody = storiesTable.querySelector('tbody');
    if (!tbody) {
      console.error("No <tbody> found inside #story-table");
      enableInput(true);
      return;
    }
    
    let children = [storiesTableHeader];
    
    // Clear tbody before inserting new rows
    tbody.replaceChildren();
    storiesContainer.innerHTML = '';
    
    if (response.status === 200) {
      message.classList.remove("error");
      if (data.count === 0) {
        tbody.replaceChildren(...children);
        storiesContainer.innerHTML = '<p class="no-stories">No stories found</p>';
      } else {
        let children = [];
        
        for (let i = 0; i < data.stories.length; i++) {
          const story = data.stories[i];
          
          let editButton = `<td><button type="button" class="editButton" data-id=${story._id}>edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${story._id}>delete</button></td>`;
          
          // Create table row
          let rowEntry = document.createElement("tr");
          let rowHTML = `
            <td>
              <img src="${story.imageUrl || 'img/default.png'}" alt="Thumbnail" />
            </td>
            <td class="story-title">${story.title}</td>
            <td class="story-description">${story.description}</td>
            <td class="story-tags">${
            Array.isArray(story.tags)
              ? story.tags.join(", ")
              : story.tags
          }</td>
            <td class="story-date">${formatDate(story.storyDate)}</td>
            <td class="story-favorite">${story.isFavorite ? "Yes" : "No"}</td>
            ${editButton}${deleteButton}`;
          
          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry);
          
          // Card creation
          const card = createStoryCard(story);
          storiesContainer.appendChild(card);
        }
        // update table
        tbody.replaceChildren(...children);
      }
      
      storiesContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("tag-remove")) {
          e.target.parentElement.remove();
        }
      });
      renderPaginationControls(data.totalPages, data.currentPage);
      
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.warn(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(storiesDiv);
  updateViewMode();
};

function truncateText(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
}

function formatDate(dateString) {
  if (!dateString) return "";

  const datePart = dateString.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  
  if (!year || !month || !day) return "";
  const date = new Date(year, month - 1, day);

  if (isNaN(date)) return "";
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function createStoryCard(story) {
  const card = document.createElement("div");
  card.classList.add("story-card");
  
  const tagsArray = Array.isArray(story.tags) ? story.tags : [] ;
  const tagSpans = tagsArray.length > 0
    ? `<div class="image-tags">
         ${tagsArray.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
      </div>`
    : "";

  card.innerHTML = `
    <div class="card-header">
      <img src="${story.imageUrl || 'img/default.png'}" class="story-image" alt="Story image"/>
      <div class="favorite-icon ${story.isFavorite ? 'favorite' : ''}">
        ${story.isFavorite ? '❤️' : '🤍'}
      </div>
      ${tagSpans}
      <h3 class="story-title">${truncateText(story.title, 35)}</h3>
    </div>
    <p class="story-description">${truncateText(story.description, 90)}</p>
    <p class="story-date">${formatDate(story.storyDate)}</p>
    <div class="story-actions">
      <button class="editButton" data-id="${story._id}">Edit</button>
      <button class="deleteButton" data-id="${story._id}">Delete</button>
    </div>
  `;
  
  return card;
}

function updateViewMode() {
  if (currentView === 'cards') {
    storiesContainer.style.display = 'grid';
    storiesTable.style.display = 'none';
    cardViewBtn.classList.add("active");
    tableViewBtn.classList.remove("active");
  } else {
    storiesContainer.style.display = 'none';
    storiesTable.style.display = 'table';
    cardViewBtn.classList.remove("active");
    tableViewBtn.classList.add("active");
  }
}

function renderPaginationControls(totalPages, current) {
  const paginationDiv = document.getElementById("pagination");
  
  if (!paginationDiv) {
    paginationDiv.classList.add("pagination-controls");
    storiesDiv.appendChild(paginationDiv);
  }
  
  paginationDiv.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === current) btn.classList.add("active");
    btn.addEventListener("click", () => showStories(i));
    paginationDiv.appendChild(btn);
  }
}