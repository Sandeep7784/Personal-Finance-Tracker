// // Get the user's name
// const userName = prompt("Please enter your name:");
// const welcomeMessage = document.createElement("span");
// welcomeMessage.textContent = `Hi ${userName}, here are your transactions`;
// welcomeMessage.classList.add("username");

// // Display the welcome message
// const welcomeMessageElement = document.getElementById("welcome-message");
// welcomeMessageElement.innerHTML = "";
// welcomeMessageElement.appendChild(welcomeMessage);

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

// Function to handle form submission
function addTransaction(event) {
  event.preventDefault();
  // submitForm(event);

  // Get form values
  const descriptionInput = document.getElementById("description");
  const amountInput = document.getElementById("amount");
  const typeInput = document.getElementById("type");
  const dateInput = document.getElementById("date");

  const description = descriptionInput.value;
  const amount = parseFloat(amountInput.value);
  const type = typeInput.value;
  const date = dateInput.value;

  // Clear form values
  descriptionInput.value = "";
  amountInput.value = "";
  typeInput.value = "";
  dateInput.value = "";

  // Add transaction to table
  const transactionList = document.getElementById("transaction-list");
  const row = transactionList.insertRow(1);
  const descriptionCell = row.insertCell(0);
  const amountCell = row.insertCell(1);
  const typeCell = row.insertCell(2);
  const dateCell = row.insertCell(3);
  const deleteCell = row.insertCell(4);

  descriptionCell.textContent = description;
  amountCell.textContent = amount.toFixed(2);
  typeCell.textContent = type;
  dateCell.textContent = date;

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", deleteTransaction.bind(null, row));
  deleteCell.appendChild(deleteButton);

  if (type === "income") {
    row.classList.add("income-row");
  } else if (type === "deduction") {
    row.classList.add("deduction-row");
  }

  // Update charts
  updateCharts();
}

// Function to delete a transaction
function deleteTransaction(row) {
  const transactionList = document.getElementById("transaction-list");
  transactionList.deleteRow(row.rowIndex);

  // Update charts
  updateCharts();
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
      if (type === "income") {
        dailyIncomeAmounts[index] += amount;
      } else if (type === "deduction") {
        dailyDeductionAmounts[index] += amount;
      }
    } else {
      dailyTransactionLabels.push(date);
      if (type === "income") {
        dailyIncomeAmounts.push(amount);
        dailyDeductionAmounts.push(0);
      } else if (type === "deduction") {
        dailyDeductionAmounts.push(amount);
        dailyIncomeAmounts.push(0);
      }
    }

    // Update income and deduction totals
    if (type === "income") {
      totalIncome += amount;
    } else if (type === "deduction") {
      totalDeduction += amount;
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
          const labelPercentages = chartData.map((value) => ((value / total) * 100).toFixed(2) + "%");

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

// Firebase configuration //

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

// document.getElementById("transaction-form").addEventListener("submit", submitForm);

function submitForm(event) {
  event.preventDefault();

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
  // document.getElementById("transaction-form").reset();
  addTransaction(event);
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
