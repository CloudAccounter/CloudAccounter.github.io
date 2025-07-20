let pageHistory = []; // Initialize an empty history stack
// Sample data for accounts, loans, and transactions
let accountData = [];

const loanData = [
  { name: "Car Loan", remainingLoan: 8000, currency: "USD" },
  { name: "Home Loan", remainingLoan: 150000, currency: "USD" },
];

let transactionData = [];
let currentOffset = 0;
let isLoading = false;
let isEndOfData = false;
const pageSize = 20;
let selectedTransaction = {};
let selectedAccount;
let accountList = [];
let filter = {
  DATE: "",
};
let defaultTransaction = {};
let today;

let dropdownBtn;
let dropdownMenu;
let selectedValue;

let datePicker;
let prevButton;
let nextButton;

function getNewDateTime() {
  // Initialize date picker with today's date
  today = new Date();

  // Extract the year, month (0-based), and day
  const year = today.getFullYear();
  // const month = today.getMonth(); // 0-based (January = 0, February = 1, etc.)
  const month = String(today.getMonth()).padStart(2, "0"); // Convert to 1-based month and add leading zero
  const day = String(today.getDate()).padStart(2, "0"); // Add leading zero

  const hours = today.getHours();
  const minutes = today.getMinutes();
  const seconds = today.getSeconds();

  // Construct the string in the desired format
  const formattedDateTime = `Date(${year},${month},${day},${hours},${minutes},${seconds})`;

  // Construct the string in the desired format
  const formattedDate = `Date(${year},${month},${day})`;

  today = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  ); // Create UTC midnight

  return {
    DATE: formattedDate,
    TIME: formattedDateTime,
  };
}

const amountDecimalPlaces = 2; // Number of decimal places for amounts