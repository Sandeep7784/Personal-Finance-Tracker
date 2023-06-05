import firebase from "./config.js";

// // Check if user is logged in
if (localStorage.getItem('userid') === null) {
  window.location.href = "login.html";
}
// // Form submission event listener
const form = document.getElementById("transaction-form");
form.addEventListener("submit", submitForm);

// const form=document.getElementById("transaction-form");
// form.addEventListener("submit", function(event) {
//   // Call the functions from the first and second scripts
//   addTransaction(event);
//   // submitForm(event);
// });

// Initialize charts
let descriptionChart;
let dailyTransactionChart;
let incomeDeductionChart;

// Function to handle form submission and add/update a transaction
function addTransaction(event, rowIndex = -1) {
  event.preventDefault();

  // Get form values
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const date = dateInput.value.split("-").reverse().join("/");

  // Perform validation
  if (!description || isNaN(amount) || !isFinite(amount) || !type || !date) {
    // alert("Please fill in all fields and ensure the amount is a valid number.");
    return;
  }

  // Clear form values
  descriptionInput.value = "";
  amountInput.value = "";
  typeInput.value = "";
  dateInput.value = "";

  // Create or update transaction row
  const transactionList = document.getElementById("transaction-list");
  const row = rowIndex === -1 ? transactionList.insertRow(1) : transactionList.rows[rowIndex];
  const descriptionCell = row.insertCell(0);
  const amountCell = row.insertCell(1);
  const typeCell = row.insertCell(2);
  const dateCell = row.insertCell(3);
  const editCell = row.insertCell(4);
  const deleteCell = row.insertCell(5);

  descriptionCell.textContent = description;
  amountCell.textContent = amount.toFixed(2);
  typeCell.textContent = type;
  dateCell.textContent = date;

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener(
    "click",
    deleteTransaction.bind(null, row, description, amount, type, date)
  );
  deleteCell.appendChild(deleteButton);

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("edit-button");
  editButton.addEventListener("click", editTransaction.bind(null, row));
  editCell.appendChild(editButton);

  // if (transactionList.rows.length === "Income") {
  //   row.classList.add("odd-row");
  // } else if (type === "Deduction") {
  //   row.classList.add("even-row");
  // }

  // Update charts
  updateCharts();

  // Update total income and total deduction
  updateTotalIncome();
  updateTotalDeduction();
}

// Function to delete a transaction
function deleteTransaction(row,description, amount, type, date) {
  const transactionList = document.getElementById("transaction-list");
  transactionList.deleteRow(row.rowIndex);

  // Update charts
  updateCharts();

  // Update total income and total deduction
  updateTotalIncome();
  updateTotalDeduction();
}

// Function to edit a transaction
function editTransaction(row) {
  popup.classList.add("show");  // Show popup

  const descriptionCell = row.cells[0];
  const amountCell = row.cells[1];
  const typeCell = row.cells[2];
  const dateCell = row.cells[3];

  // Fill form with existing transaction data
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");

  descriptionInput.value = descriptionCell.textContent;
  amountInput.value = parseFloat(amountCell.textContent);
  typeInput.value = typeCell.textContent;
  dateInput.value = dateCell.textContent;

  // Delete existing transaction row
  const transactionList = document.getElementById("transaction-list");
  transactionList.deleteRow(row.rowIndex);

  // Update charts without adding a new row
  updateCharts();

  // Scroll to the top of the form
  document.getElementById("transaction-form").scrollIntoView({ behavior: "smooth" });

  // Update total income and total deduction
  updateTotalIncome();
  updateTotalDeduction();
}

// Function to update the charts
function updateCharts() {
  // Clear existing charts
  if (descriptionChart) {
    descriptionChart.destroy();
    descriptionChart = null;
  }
  if (dailyTransactionChart) {
    dailyTransactionChart.destroy();
    dailyTransactionChart = null;
  }
  if (incomeDeductionChart) {
    incomeDeductionChart.destroy();
    incomeDeductionChart = null;
  }

  // Get data from transaction table
  const transactionList = document.getElementById("transaction-list");
  const rows = transactionList.getElementsByTagName("tr");

   // Sort rows based on date in descending order
   const sortedRows = Array.from(rows).slice(1).sort((a, b) => {
    const dateA = new Date(a.cells[3].textContent);
    const dateB = new Date(b.cells[3].textContent);
    return dateB - dateA;
  });

  // Clear transaction list
  while (transactionList.rows.length > 1) {
    transactionList.deleteRow(1);
  }

  // Add sorted rows back to the transaction list
  for (const row of sortedRows) {
    transactionList.appendChild(row);
  }

  const descriptionLabels = [];
  const descriptionAmounts = [];

  const dailyTransactionLabels = [];
  const dailyTransactionAmounts = [];
  const dailyIncomeAmounts = [];
  const dailyDeductionAmounts = [];

  let totalIncome = 0;
  let totalDeduction = 0;

  // Loop through table rows and extract data
  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    const description = cells[0].textContent;
    const amount = parseFloat(cells[1].textContent);
    const type = cells[2].textContent;
    const date = cells[3].textContent;

    // Update description chart data
    const descriptionIndex = descriptionLabels.indexOf(description);
    if (descriptionIndex !== -1) {
      descriptionAmounts[descriptionIndex] += amount;
    } else {
      descriptionLabels.push(description);
      descriptionAmounts.push(amount);
    }

    // Update daily transaction chart data
    if (dailyTransactionLabels.includes(date)) {
      const index = dailyTransactionLabels.indexOf(date);
      if (type === "Income") {
        dailyIncomeAmounts[index] += amount;
      } else if (type === "Deduction") {
        dailyDeductionAmounts[index] += amount;
      }
    } else {
      dailyTransactionLabels.push(date);
      if (type === "Income") {
        dailyIncomeAmounts.push(amount);
        dailyDeductionAmounts.push(0);
      } else if (type === "Deduction") {
        dailyDeductionAmounts.push(amount);
        dailyIncomeAmounts.push(0);
      }
    }

    // Loop through sorted rows and calculate totals
    for (const row of sortedRows) {
      const amount = parseFloat(row.cells[1].textContent);
      const type = row.cells[2].textContent;

      if (type === "Income") {
        totalIncome += amount;
      } else if (type === "Deduction") {
        totalDeduction += amount;
      }
    }
  }

  // Show/hide loading message based on transaction data
  const loadingMessage = document.getElementById("loading-message");
  const graphSection = document.querySelector(".graph-section");

  if (rows.length <= 1) {
    loadingMessage.style.display = "block";
    graphSection.style.display = "none";
  } else {
    loadingMessage.style.display = "none";
    graphSection.style.display = "block";
  }

  // Create description chart
  const descriptionChartElement = document.getElementById("description-chart");
  const descriptionLabelsDiv = document.getElementById("description-labels");

  descriptionChart = new Chart(descriptionChartElement, {
    type: "doughnut",
    data: {
      labels: descriptionLabels,
      datasets: [
        {
          data: descriptionAmounts,
          backgroundColor: getRandomColors(descriptionLabels.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Transaction Description Breakdown",
        },
        legend: {
          display: false, // Hide legend labels
        },
      },
      animation: {
        onComplete: function () {
          // Generate label text and percentages
          const chartData = this.data.datasets[0].data;
          const total = chartData.reduce((acc, val) => acc + val, 0);
          const labelPercentages = chartData.map(
            (value) => ((value / total) * 100).toFixed(2) + "%"
          );

          // Generate labels and percentages in the inline div
          descriptionLabelsDiv.innerHTML = "";
          for (let i = 0; i < descriptionLabels.length; i++) {
            const label = descriptionLabels[i];
            const percentage = labelPercentages[i];
            const color = this.data.datasets[0].backgroundColor[i];

            const labelContainer = document.createElement("div");
            labelContainer.classList.add("label-container");

            const colorIndicator = document.createElement("span");
            colorIndicator.classList.add("color-indicator");
            colorIndicator.style.backgroundColor = color;

            const labelText = document.createElement("span");
            labelText.classList.add("label-text");
            labelText.textContent = label;

            const labelPercentage = document.createElement("span");
            labelPercentage.classList.add("label-percentage");
            labelPercentage.textContent = percentage;

            labelContainer.appendChild(colorIndicator);
            labelContainer.appendChild(labelText);
            labelContainer.appendChild(labelPercentage);
            descriptionLabelsDiv.appendChild(labelContainer);
          }
        },
      },
    },
  });

  // Create income and deduction v/s day chart
  const dailyTransactionChartElement = document.getElementById(
    "daily-transaction-chart"
  );
  dailyTransactionChartElement.width = 800; // Set the width of the chart
  dailyTransactionChartElement.height = 400; // Set the height of the chart
  dailyTransactionChart = new Chart(dailyTransactionChartElement, {
    type: "bar",
    data: {
      labels: dailyTransactionLabels,
      datasets: [
        {
          label: "Income",
          data: dailyIncomeAmounts,
          backgroundColor: "rgba(75, 192, 192, 0.8)", // Green color for income
        },
        {
          label: "Deduction",
          data: dailyDeductionAmounts,
          backgroundColor: "rgba(255, 99, 132, 0.8)", // Red color for deduction
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Income and Deduction vs Day",
        },
        legend: {
          position: "right",
        },
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    },
  });

  // Create income and deduction chart
  const incomeDeductionChartElement = document.getElementById(
    "income-deduction-chart"
  );
  incomeDeductionChart = new Chart(incomeDeductionChartElement, {
    type: "pie",
    data: {
      labels: ["Income", "Deduction"],
      datasets: [
        {
          data: [totalIncome, totalDeduction],
          backgroundColor: ["rgb(133,253,158)", "rgba(253, 140, 140, 1)"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Total Income and Deduction",
        },
      },
    },
  });
}

// Function to generate random colors for chart elements
function getRandomColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const color = `rgba(${getRandomNumber(0, 255)}, ${getRandomNumber(
      0,
      255
    )}, ${getRandomNumber(0, 255)}, 0.8)`;
    colors.push(color);
  }
  return colors;
}

// Function to generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Initial chart update
updateCharts();

// Get the form element
const formElement = document.getElementById("transaction-form");

// Add event listener to the form submit event
formElement.addEventListener("submit", addTransaction);

// Add event listener to the Edit buttons
const editButtons = document.getElementsByClassName("edit-button");
Array.from(editButtons).forEach((button) => {
  button.addEventListener("click", () => {
    const row = button.parentNode.parentNode;
    editTransaction(row);
  });
});

let nettotalIncome = 0;
let nettotalDeduction = 0;

// Function to update total income
function updateTotalIncome() {
  const transactionList = document.getElementById("transaction-list");
  let totalIncome = 0;

  for (let i = 1; i < transactionList.rows.length; i++) {
    const row = transactionList.rows[i];
    const amountCell = row.cells[1];
    const typeCell = row.cells[2];

    if (typeCell.textContent === "Income") {
      totalIncome += parseFloat(amountCell.textContent);
    }
  }

  nettotalIncome = totalIncome;

  const totalIncomeElement = document.getElementById("total-income");
  totalIncomeElement.textContent = "Total Income: " + totalIncome.toFixed(2);

  const totalBalance = document.getElementById("total-balance");
  const starting_balance = 10000;  //this we have to figure out how to get from the signup page
  console.log(starting_balance);
  const cur_balance = starting_balance - nettotalDeduction + nettotalIncome;
  console.log(cur_balance);
  totalBalance.textContent = "Total Balance: " + cur_balance.toFixed(2);
  console.log(totalBalance.textContent);
}

// Function to update total deduction
function updateTotalDeduction() {
  const transactionList = document.getElementById("transaction-list");
  let totalDeduction = 0;

  for (let i = 1; i < transactionList.rows.length; i++) {
    const row = transactionList.rows[i];
    const amountCell = row.cells[1];
    const typeCell = row.cells[2];

    if (typeCell.textContent === "Deduction") {
      totalDeduction += parseFloat(amountCell.textContent);
    }
  }

  nettotalDeduction = totalDeduction;

  const totalDeductionElement = document.getElementById("total-deduction");
  totalDeductionElement.textContent =
    "Total Deduction: " + totalDeduction.toFixed(2);

  const totalBalance = document.getElementById("total-balance");
  const starting_balance = 10000; //this we have to figure out how to get from the signup page
  const cur_balance = starting_balance - nettotalDeduction + nettotalIncome;
  totalBalance.textContent = "Total Balance: " + cur_balance.toFixed(2);
}

// reference your database
var transactionFormDB = firebase.database().ref("Transactions_History");

// document.getElementById("transaction-form").addEventListener("submit", submitForm);
const saveMessages = (description, amount, type, date) => {
  var newContactForm = transactionFormDB.push();

  newContactForm.set({
    description: description,
    amount: amount,
    type: type,
    date: date,
    username: localStorage.userid,
  });
};

function submitForm(event) {
  popup.classList.remove("show"); //to remove popup

  event.preventDefault();


  var description = document.getElementById("description").value;
  var amount = document.getElementById("amount").value;
  var type = document.getElementById("type").value;
  var date = document.getElementById("date").value;
  
  console.log(description, amount, type, date);

  // Check if the amount is a valid number
  if (isNaN(amount)) {
    alert("Please enter a valid amount.");
    return;
  }

  saveMessages(description, amount, type, date);

  //   enable alert
  document.querySelector(".alert").style.display = "block";

  //   remove the alert
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 3000);

  //   reset the form
  // document.getElementById("transaction-form").reset();
  addTransaction(event);
}

const getElementVal = (id) => {
  return document.getElementById(id).value;
};

const getTransaction = () => {
  var transactionFormDB = firebase.database().ref("Transactions_History");
  transactionFormDB.on("value", (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      if (childData.username == localStorage.userid) {
        console.log(childData);
      }
    });
  });
}
getTransaction();

const getUserDetails = () => {
  var userFormDB = firebase.database().ref("registration");
  userFormDB.on("value", (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      if (childData.username == localStorage.userid) {
        console.log(childData);
        return childData;
      }
    });
  });
}
getUserDetails();