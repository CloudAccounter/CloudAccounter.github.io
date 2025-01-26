datePicker = document.getElementById("datePicker");
prevButton = document.getElementById("prevDate");
nextButton = document.getElementById("nextDate");

filter.DATE = today;
datePicker.valueAsDate = filter.DATE;

// Function to adjust the date
function adjustDate(days) {
  const currentDate = new Date(datePicker.value);
  currentDate.setDate(currentDate.getDate() + days);
  datePicker.valueAsDate = currentDate;
  filter.DATE = currentDate;
  loadTransactionData();
}

// Event listeners for buttons
prevButton.addEventListener("click", () => adjustDate(-1)); // Go to previous day
nextButton.addEventListener("click", () => adjustDate(1)); // Go to next day

function formatCustomDate(input) {
  // Extract the values from the input string using a regular expression
  const match = input?.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
  let result = "";

  if (!!match) {
    // Destructure the extracted values into separate variables
    const [_, year, month, day] = match.map(Number); // Convert to numbers

    // Create a new Date object
    const date = new Date(year, month, day);

    // Format the date
    const dayNumber = date.getDate();
    const monthName = date.toLocaleString("default", { month: "short" }); // Get the short month name
    const yearNumber = date.getFullYear();

    result = `${dayNumber} ${monthName} ${yearNumber}`;
  }
  return result;
}

function formatCustomTime(input) {
  // Extract the values from the input string using a regular expression
  const match = input?.match(
    /Date\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/
  );

  let result = "";
  if (!!match) {
    // Destructure the extracted values into separate variables
    const [_, year, month, day, hour, minute] = match.map(Number); // Convert to numbers

    // Create a new Date object
    const date = new Date(year, month, day, hour, minute);

    // Format the time
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12 || 12;

    // Pad minutes with leading zero if needed
    const formattedMinutes = minutes.toString().padStart(2, "0");

    result = `${hours}:${formattedMinutes} ${period}`;
  }

  return result;
}

// Function to format date as YYYY-MM-DD
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
  return `${year}-${month}-${day}`;
}

function capitalizeFirstLetter(word) {
  if (!word) return ""; // Handle empty or invalid input
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Function to load transaction data
async function loadTransactionData() {
  const { DATE } = filter;

  transactionData = [];
  const SHEET_ID = "1piEdxdEJv8_vnKem-r1GP03cLG5tFM1M9ydwSTSx94A";
  const GID = "2044609807";
  const QUERY = `SELECT * WHERE E = date '${formatDateToYYYYMMDD(
    DATE
  )}' ORDER BY E ASC, F DESC`;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);
  const columns = [...res?.table?.cols];
  res?.table?.rows?.map((item) => {
    const transactionObject = {};
    columns?.map((header, i) => {
      transactionObject[header?.label?.trim()] = item?.c?.[i]?.v;
      return "";
    });
    transactionData?.push(transactionObject);
    return "";
  });
  const transactionList = document.getElementById("transaction-list");
  transactionList.innerHTML = "";
  if (transactionData?.length) {
    transactionData.forEach((transaction) => {
      const transactionItem = document.createElement("div");
      transactionItem.onclick = function () {
        selectedTransaction = { ...transaction };
        loadPage(`add${capitalizeFirstLetter(transaction?.CATEGORY)}`);
      };
      transactionItem.classList.add("transaction-item");
      transactionItem.innerHTML = `
            <span class="transaction-account">
              ${
                transaction?.TO
                  ? `${transaction?.ACCOUNT || ""} - ${transaction?.TO}`
                  : `${transaction?.ACCOUNT || ""}`
              }
            </span>

            <span class="transaction-description">${
              transaction?.DESCRIPTION || ""
            }</span>

            <span class="amount" style="color:${
              transaction?.CATEGORY === "income" ? "green" : "red"
            }">${transaction?.AMOUNT || ""}</span>
            
            <span class="transaction-account">${
              transaction?.CATEGORY || ""
            }</span>

            <div style="color:grey; font-size:2vh;">${
              formatCustomDate(transaction?.DATE) || ""
            } </div>

            <div style="color:grey; font-size:2vh; text-align:right;">${
              formatCustomTime(transaction?.TIME) || ""
            }</div>
        `;
      transactionList.appendChild(transactionItem);
    });
  } else {
    const transactionItem = document.createElement("div");
    transactionItem.classList.add("transaction-no-item");
    transactionItem.innerHTML = `
            <span class="transaction-account" style="text-align:center;margin:auto">
              no transactions found
            </span>`;
    transactionList.appendChild(transactionItem);
  }
}

loadTransactionData();
