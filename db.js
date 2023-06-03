// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBcHUL9y5roVcy-PTJhW03dVcOmcX4PI48",
    authDomain: "transaction-history-7ffab.firebaseapp.com",
    databaseURL: "https://transaction-history-7ffab-default-rtdb.firebaseio.com",
    projectId: "transaction-history-7ffab",
    storageBucket: "transaction-history-7ffab.appspot.com",
    messagingSenderId: "486424869674",
    appId: "1:486424869674:web:7c630e73fc452849fabc53"
  };

  // initialize firebase
firebase.initializeApp(firebaseConfig);

// reference your database
var transactionFormDB = firebase.database().ref("Transactions_History");

document.getElementById("transaction-form").addEventListener("submit", submitForm);
// document.getElementById("transaction-form");

function submitForm(e) {
  e.preventDefault();

  var description = getElementVal("description");
  var amount = getElementVal("amount");
  var type = getElementVal("type");
  var date = getElementVal("date");
  
  console.log(description, amount, type, date);

  saveMessages(description, amount, type, date);

  //   enable alert
  document.querySelector(".alert").style.display = "block";

  //   remove the alert
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 3000);

  //   reset the form
  document.getElementById("transaction-form").reset();
}

const saveMessages = (description, amount, type, date) => {
  var newContactForm = transactionFormDB.push();

  newContactForm.set({
    description: description, 
    amount: amount, 
    type: type, 
    date: date,
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
