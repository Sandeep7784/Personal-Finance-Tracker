import firebase from "./config.js";

var regDB = firebase.database().ref("registration");
var authDB = firebase.database().ref("authenticate");

// Get form elements
const signupForm = document.getElementById("signup-form");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const passwordError = document.getElementById("password-match-error");
const signupButton = document.getElementById("signup-button");

// Add form submission event listener
signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  var name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const username = document.getElementById("username").value;
  const dob = document.getElementById("dob").value;
  const password = document.getElementById("password").value;

  // Check if passwords match
  if (
    passwordInput.value !== confirmPasswordInput.value &&
    passwordInput.value !== "" &&
    confirmPasswordInput.value !== ""
  ) {
    passwordError.style.display = "block";
    showAlert();
  } else {
    passwordError.style.display = "none";
    // Create account
    regDB
      .orderByChild("username")
      .equalTo(username)
      .once("value")
      .then(function (account) {
        if (account.exists()) {
          alert("Username already exists!");
        } else {
          firebase
            .database()
            .ref("registration" + "/" + username)
            .set({
              email: email,
              username: username,
              name: name,
              dob: dob,
              password: password,
            });
          console.log("Account created successfully!");
          console.log(email,username,name,dob)
          window.location.href = "login.html";
        }
      })
      .catch(function (error) {
        console.log("Error: " + error.code);
      });
  }
});

// Add input change event listener
signupForm.addEventListener("input", function (event) {
  if (
    passwordInput.value === confirmPasswordInput.value ||
    passwordInput.value === "" ||
    confirmPasswordInput.value === ""
  ) {
    passwordError.style.display = "none";
  }
});
