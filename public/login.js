import {
  inputEnabled,
  setDiv,
  token,
  message,
  enableInput,
  setToken,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showStories } from "./stories.js";
import { showRegister } from "./register.js";

let loginDiv = null;
let email = null;
let password = null;

export const handleLogin = () => {
  loginDiv = document.getElementById("logon-div");
  email = document.getElementById("email");
  password = document.getElementById("password");
  const logonButton = document.getElementById("logon-button");
  const logonCancel = document.getElementById("logon-cancel");
  const logonLink = document.getElementById("logon-link");
  const registerLink = document.getElementById("register-link");

  loginDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === logonButton) {
        enableInput(false);

        try {
          const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.value,
              password: password.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200) {
            message.classList.remove("error");
            const capitalizedName = capitalizeFullName(data.user.name);
            message.textContent = `Login successful. Welcome back ${capitalizedName}`;
            setToken(data.token);
            
            document.getElementById("get-started")?.style.setProperty("display", "none");
            document.getElementById("logon-register")?.style.setProperty("display", "none");
            
            email.value = "";
            password.value = "";
            
            setDiv(document.getElementById("story"));
            showStories();
          } else {
            message.textContent = data.msg;
            message.classList.add("error");
            message.style.display = "block";
          }
        } catch (err) {
          console.error(err);
          message.textContent = "A communications error occurred.";
        }

        enableInput(true);
      } else if (e.target === logonCancel) {
        email.value = "";
        password.value = "";
        showLoginRegister();
      }
    }
  });
  
  if (logonLink) {
    logonLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLogin();
    });
  }

  if (registerLink) {
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRegister();
    });
  }
};

export const showLogin = () => {
  email.value = null;
  password.value = null;
  setDiv(loginDiv);
};

function capitalizeFullName(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
