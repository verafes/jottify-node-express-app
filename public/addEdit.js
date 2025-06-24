import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showStories } from "./stories.js";

let addEditDiv = null;
let title = null;
let description = null;
let tags = null;
let isFavorite = null;
let addingStory = null;
let storyDate = null;

export const handleAddEdit = async () => {
  addEditDiv = document.getElementById("edit-story");
  title = document.getElementById("storyTitle");
  description = document.getElementById("description");
  tags = document.getElementById("tags");
  isFavorite = document.getElementById("favorite");
  storyDate = document.getElementById("story-date");
  addingStory = document.getElementById("adding-story");
  const editCancel = document.getElementById("edit-cancel");
  
  const imageInput = document.getElementById("imageUpload");
  let imageUrl = "";
  
  const imageTags = document.getElementById("imageTags");
  const tagHintsContainer = document.getElementById("tag-hints");
  const deleteImageBtn = document.getElementById("deleteImageBtn");
  const editImageBtn = document.getElementById("editImageBtn");
  const imagePreview = document.getElementById("imagePreview");
  
  const syncTagsDisplay = () => {
    const tagsArray = tags.value.split(",").map(tag => tag.trim()).filter(tag => tag);
    imageTags.innerHTML = "";
    tagsArray.forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.textContent = tag;
      imageTags.appendChild(tagSpan);
    });
  };
  
  tags.addEventListener("input", syncTagsDisplay);
  
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
        
        let uploadedImageUrl = imagePreview.src.includes('default.png') ? '' : imagePreview.src;
        
        if (imageInput && imageInput.files.length > 0) {
          const formData = new FormData();
          formData.append("image", imageInput.files[0]);
          
          try {
            const imgRes = await fetch("/api/v1/stories/upload", {
              method: "POST",
              headers: {Authorization: `Bearer ${token}`},
              body: formData,
            });
            
            const imgData = await imgRes.json();
            imageUrl = imgData.image || "";
            uploadedImageUrl = imageUrl;
          } catch (err) {
            console.error("Image upload failed:", err);
            //Fall back to empty if upload failed
            imageUrl = "";
            uploadedImageUrl = "";
          }
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
              isFavorite: isFavorite.checked,
              storyDate: storyDate.value,
              imageUrl: uploadedImageUrl,
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
            imagePreview.src = "img/default.png";
            imagePreview.style.display = "none";
            imageUrl = "";
            
            showStories();
          } else {
            message.textContent = data.msg;
            message.classList.add("error");
            message.style.display = "block";
          }
        } catch (err) {
          console.error(err);
          message.textContent = "A communication error occurred. Please wait for a while and try again.";
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
  
  if (tagHintsContainer) {
    tagHintsContainer?.addEventListener("click", (e) => {
      if (e.target.classList.contains("tag-hint")) {
        const clickedTag = e.target.textContent.trim();
        const currentTags = tags.value.split(",").map(t => t.trim()).filter(t => t);
        if (!currentTags.includes(clickedTag)) {
          currentTags.push(clickedTag);
          tags.value = currentTags.join(", ");
          syncTagsDisplay();
        }
      }
    });
    
    // Clear image and preview
    deleteImageBtn?.addEventListener("click", () => {
      document.getElementById("imageUpload").value = "";
      imagePreview.src = "img/default.png";
      imagePreview.style.display = "none";
      tags.value = "";
      imageTags.innerHTML = "";
    });

    // Reopen image input
    editImageBtn?.addEventListener("click", () => {
      document.getElementById("imageUpload").click();
    });
  }
};

export const showAddEdit = async (storyId) => {
  const imagePreview = document.getElementById("imagePreview");
  let uploadedImageUrl = imagePreview.src.includes('default.png') ? '' : imagePreview.src;
  
  if (!storyId) {
    title.value = "";
    description.value = "";
    tags.value = "";
    isFavorite.checked = false;
    storyDate.value = new Date().toISOString().split('T')[0];
    addingStory.textContent = "Add Story";
    addEditDiv.dataset.id = "";
    message.textContent = "";
    uploadedImageUrl = "";
    
    imagePreview.src = "img/default.png";
    imagePreview.style.display = "none";
    
    setDiv(addEditDiv);
    // Set up preview every time
    handleImagePreview();
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
        syncTagsDisplay();
        isFavorite.checked = data.story.isFavorite;
        storyDate.value = data.story.storyDate
          ? new Date(data.story.storyDate).toISOString().split('T')[0]
          : '';
        addingStory.textContent = "update";
        message.textContent = "";
        addEditDiv.dataset.id = storyId;
        
        // If story has an imageUrl, show it in preview
        const preview = document.getElementById("imagePreview");
        if (data.story.imageUrl) {
          preview.src = data.story.imageUrl;
          preview.style.display = "block";
        } else {
          preview.src = "img/default.png";
          preview.style.display = "block";
        }
        
        setDiv(addEditDiv);
        handleImagePreview();
      } else {
        message.textContent = "The story entry was not found";
        message.classList.add("error");
        message.textContent = data.msg;
        message.style.display = "block";
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


export const handleImagePreview = () => {
  const imageInput = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");
  
  if (!imageInput || !imagePreview) {
    console.warn("Image input or preview element not found.");
    return;
  }
  
  // Prevent auto-showing broken preview when src is empty
  if (imagePreview.src && imagePreview.src.startsWith("http")) {
    imagePreview.style.display = "block";
  }
  
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.src = "img/default.png";
      imagePreview.style.display = "none";
    }
  });
};

const syncTagsDisplay = () => {
  const tagsInput = document.getElementById("tags");
  const imageTagsContainer = document.getElementById("imageTags");
  
  // Clear current visual tags
  imageTagsContainer.innerHTML = "";
  
  const tagsArray = tagsInput.value.split(",").map(tag => tag.trim()).filter(tag => tag);
  tagsArray.forEach(tag => {
    const tagSpan = document.createElement("span");
    tagSpan.textContent = tag;
    imageTagsContainer.appendChild(tagSpan);
  });
};