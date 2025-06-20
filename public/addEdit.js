import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showStories } from "./stories.js";

let addEditDiv = null;
let title = null;
let description = null;
let tags = null;
let isFavorite = null;
let addingStory = null;
let storyDate = null;

export const handleAddEdit = () => {
  addEditDiv = document.getElementById("edit-story");
  title = document.getElementById("storyTitle");
  description = document.getElementById("description");
  tags = document.getElementById("tags");
  isFavorite = document.getElementById("favorite");
  storyDate = document.getElementById("story-date");
  addingStory = document.getElementById("adding-story");
  const editCancel = document.getElementById("edit-cancel");

  addEditDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addingStory) {
        enableInput(false);

        let method = "POST";
        let url = "/api/v1/stories";
        const storyId = addEditDiv.dataset.id;

        if (addingStory.textContent === "update") {
          method = "PATCH";
          url = `/api/v1/stories/${storyId}`;
        }

        try {
          const response = await fetch(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: title.value,
              description: description.value,
              tags: tags.value,
              isFavorite: isFavorite.checked, // not required
              storyDate: storyDate.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200 || response.status === 201) {
            message.classList.remove("error");
            if (response.status === 200) {
              message.textContent = "The story entry was updated.";
            } else {
              message.textContent = "The story entry was created.";
            }
            
            // Reset form after add/edit
            title.value = "";
            description.value = "";
            tags.value = "";
            isFavorite.checked = false;
            storyDate.value = "";
            addEditDiv.dataset.id = "";
            
            showStories();
          } else {
            message.textContent = data.msg;
            message.classList.add("error");
          }
        } catch (err) {
          console.error(err);
          message.textContent = "A communication error occurred.";
          message.classList.add("error");
        }

        enableInput(true);
      } else if (e.target === editCancel) {
        addEditDiv.dataset.id = ""; // Clear ID on cancel
        message.classList.remove("error");
        message.textContent = "";
        showStories();
      }
    }
  });
  
  const tagHintsContainer = document.getElementById("tag-hints");
  if (tagHintsContainer) {
    tagHintsContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("tag-hint")) {
        const clickedTag = e.target.textContent.trim();
        const currentTags = tags.value.split(",").map(t => t.trim()).filter(t => t);
        if (!currentTags.includes(clickedTag)) {
          currentTags.push(clickedTag);
          tags.value = currentTags.join(", ");
        }
      }
    });
  }
};

export const showAddEdit = async (storyId) => {
  if (!storyId) {
    title.value = "";
    description.value = "";
    tags.value = "";
    isFavorite.checked = false;
    storyDate.value = new Date().toISOString().split('T')[0];
    addingStory.textContent = "Add Story";
    addEditDiv.dataset.id = "";
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    enableInput(false);

    try {
      const response = await fetch(`/api/v1/stories/${storyId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        title.value = data.story.title;
        description.value = data.story.description;
        tags.value = data.story.tags;
        isFavorite.checked = data.story.isFavorite;
        storyDate.value =  data.story.storyDate;
        addingStory.textContent = "update";
        message.textContent = "";
        addEditDiv.dataset.id = storyId;

        setDiv(addEditDiv);
      } else {
        message.textContent = "The story entry was not found";
        message.classList.add("error");
        showStories();
      }
    } catch (err) {
      console.error(err);
      message.textContent = "A communications error has occurred.";
      await showStories();
    }

    enableInput(true);
  }
};

export const showDelete = async (storyId) => {
  enableInput(false);
  try {
    const response = await fetch(`/api/v1/stories/${storyId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (response.status === 200) {
      addingStory.textContent = "delete";
      message.classList.remove("error");
      message.textContent = data.msg;
      showStories();
    } else {
      // might happen if the list has been updated since last display
      message.textContent = "The story entry was not found";
      showStories();
    }
  } catch (err) {
    console.error(err);
    message.textContent = "A communications error has occurred.";
    showStories();
  }
  enableInput(true);
};
