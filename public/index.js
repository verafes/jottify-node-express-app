let activeDiv = null;
export const setDiv = (newDiv) => {
  if (newDiv != activeDiv) {
    if (activeDiv) {
      activeDiv.style.display = "none";
    }
    newDiv.style.display = "block";
    activeDiv = newDiv;
  }
};

export let inputEnabled = true;
export const enableInput = (state) => {
  inputEnabled = state;
};

export let token = null;
export const setToken = (value) => {
  token = value;
  if (value) {
    localStorage.setItem("token", value);
  } else {
    localStorage.removeItem("token");
  }
};

export let message = null;

import { showStories, handleStories } from "./stories.js";
import { showLoginRegister, handleLoginRegister } from "./loginRegister.js";
import { handleLogin } from "./login.js";
import { handleAddEdit } from "./addEdit.js";
import {handleRegister, showRegister} from "./register.js";
import { showAddEdit } from "./addEdit.js";

document.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token");
  message = document.getElementById("message");
  handleLoginRegister();
  handleLogin();
  handleStories();
  handleRegister();
  handleAddEdit();
  
  const getStarted = document.getElementById("get-started");
  if (getStarted) {
    getStarted.addEventListener("click", (e) => {
      e.preventDefault();
      showRegister();
    });
  }
  
  if (token) {
    if (getStarted) getStarted.style.display = "none";
    showStories();
  } else {
    if (getStarted) getStarted.style.display = "inline-block";
    showLoginRegister();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const storiesLink = document.getElementById("new-story");
  
  if (storiesLink) {
    storiesLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (token) {
        showAddEdit(null);
      } else {
        message.textContent = "Please log in first.";
      }
    });
  }
});