let pageHistory = []; // Initialize an empty history stack
// Sample data for accounts, loans, and transactions
let accountData = [];

const loanData = [
  { name: "Car Loan", remainingLoan: 8000, currency: "USD" },
  { name: "Home Loan", remainingLoan: 150000, currency: "USD" },
];

let transactionData = [];
let selectedTransaction = {};
let accountList = [];
let filter = {
  DATE: "",
};

let datePicker = document.getElementById("datePicker");
let prevButton = document.getElementById("prevDate");
let nextButton = document.getElementById("nextDate");

// Initialize date picker with today's date
let today = new Date();

// Extract the year, month (0-based), and day
const year = today.getFullYear();
const month = today.getMonth(); // 0-based (January = 0, February = 1, etc.)
const day = today.getDate();
const hours = today.getHours();
const minutes = today.getMinutes();
const seconds = today.getSeconds();

// Construct the string in the desired format
const formattedDateTime = `Date(${year},${month},${day},${hours},${minutes},${seconds})`;

// Construct the string in the desired format
const formattedDate = `Date(${year},${month},${day})`;

const defaultTransaction={
  DATE: formattedDate, TIME: formattedDateTime
}

selectedTransaction = { DATE: formattedDate, TIME: formattedDateTime };

today = new Date(
  Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
); // Create UTC midnight
