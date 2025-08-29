defaultTransaction = { ...getNewDateTime() };
datePicker = document.getElementById("datePicker");
prevButton = document.getElementById("prevDate");
nextButton = document.getElementById("nextDate");

filter.DATE = today;
datePicker.valueAsDate = filter.DATE;

// Event listeners for buttons
datePicker.addEventListener("change", () => adjustDate(0));
prevButton.addEventListener("click", () => adjustDate(-1)); // Go to previous day
nextButton.addEventListener("click", () => adjustDate(1)); // Go to next day

isEndOfData = false;
currentOffset = 0;
// Function to load transaction data


async function loadTransactionData(TYPE) {
  const transactionList = document.getElementById("transaction-list");
  if (TYPE !== "FORCE" && (isLoading || isEndOfData)) return;
  if (TYPE === "FORCE") {transactionList.innerHTML = ""; currentOffset = 0;}
  isLoading = true;
  const { DATE } = filter;

  transactionData = [];
  const SHEET_ID = JSON.parse(localStorage.getItem("user"))?.id;
  const GID = "2044609807";
  let QUERY = `SELECT *`;
  if (selectedAccount?.ACCOUNT_NAME) {
    document.getElementById("transaction-filter").style.display = "none";
    QUERY =
      QUERY +
      ` WHERE G='${selectedAccount?.ACCOUNT_NAME}' OR H='${selectedAccount?.ACCOUNT_NAME}'`;
  } else {
    QUERY = QUERY + ` WHERE E = date '${formatDateToYYYYMMDD(DATE)}'`;
  }
  QUERY = QUERY + ` AND (L IS NULL OR L != 1) ORDER BY E DESC, F DESC`;
  QUERY += ` LIMIT ${pageSize} OFFSET ${currentOffset}`;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);
  const columns = [...res?.table?.cols];
  const rows = res?.table?.rows;

  if (!rows || rows.length === 0) {
    isEndOfData = true;
    isLoading = false;
    return;
  }

  rows.forEach((item) => {
    const transactionObject = {};
    columns.forEach((header, i) => {
      transactionObject[header?.label?.trim()] = item?.c?.[i]?.v;
    });
    transactionData.push(transactionObject);
  });

  currentOffset += pageSize;
  isLoading = false;

  // Optionally, call render function here
  renderTransactions(transactionData);
}

window.addEventListener("scroll", () => {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight + 50;
  if (nearBottom) {
    loadTransactionData();
  }
});

function renderTransactions(transactionData) {
  const transactionList = document.getElementById("transaction-list");
  if (currentOffset === 0) transactionList.innerHTML = "";
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
            }">${formatNumber(transaction?.AMOUNT) || ""}</span>
            
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

dropdownBtn = document.getElementById("periodDropdownBtn");
dropdownMenu = document.getElementById("periodDropdownMenu");
selectedValue = document.getElementById("periodSelectedValue");

// Toggle dropdown menu visibility
dropdownBtn.addEventListener("click", function () {
  dropdownMenu.style.display =
    dropdownMenu.style.display === "block" ? "none" : "block";
});

// Handle option selection
dropdownMenu.querySelectorAll("a").forEach((item) => {
  item.addEventListener("click", function (event) {
    event.preventDefault();
    dropdownBtn.innerHTML = `${this.dataset.value} <span class="period-dropdown-icon">▼</span>`;
    selectedValue.textContent = this.dataset.value;
    dropdownMenu.style.display = "none"; // Hide dropdown
  });
});

// Hide dropdown if clicked outside
document.addEventListener("click", function (event) {
  if (
    !dropdownBtn.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.style.display = "none";
  }
});
