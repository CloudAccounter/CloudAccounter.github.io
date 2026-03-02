defaultTransaction = {...getNewDateTime()};
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
  if (!transactionList) return;
  if (TYPE !== "FORCE" && (isLoading || isEndOfData)) return;
  if (TYPE === "FORCE") {
    transactionList.innerHTML = "";
    currentOffset = 0;
  }
  isLoading = true;
  const {DATE} = filter;

  transactionData = [];
  const SHEET_ID = JSON.parse(localStorage.getItem("user"))?.id;
  const GID = JSON.parse(localStorage.getItem("user"))?.VW_TRANSACTIONS;
  let QUERY = `SELECT * WHERE 1=1`;
  if (selectedAccount?.ACCOUNT_NAME) {
    // document.getElementById("transaction-filter").style.display = "none";
    QUERY =
      QUERY +
      ` AND G='${selectedAccount?.ACCOUNT_NAME}' OR H='${selectedAccount?.ACCOUNT_NAME}'`;
  }
  // else {
  // QUERY = QUERY + ` AND E = date '${formatDateToYYYYMMDD(DATE)}'`;
  // }
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
  if (!transactionList) return;
  if (currentOffset === 0) transactionList.innerHTML = "";
  if (transactionData?.length) {
    const txIconMap = {
      income: {icon: "fa-arrow-down", color: "#28a745", bg: "#e8f5e9"},
      expense: {icon: "fa-arrow-up", color: "#dc3545", bg: "#ffebee"},
      transfer: {icon: "fa-exchange-alt", color: "#007bff", bg: "#e3f2fd"},
    };

    transactionData.forEach((transaction) => {
      const isIncome = transaction?.CATEGORY === "income";
      const isTransfer = transaction?.CATEGORY === "transfer";
      const catInfo = txIconMap[transaction?.CATEGORY] || txIconMap["expense"];

      let sign = isIncome ? "+" : "-";
      let amountClass = isIncome ? "tx-amount-green" : "tx-amount-red";
      if (isTransfer) {
        sign = "";
        amountClass = "tx-amount-blue";
      }

      let title = transaction?.ACCOUNT || "Transaction";
      if (transaction?.TO) {
        title = `${transaction?.ACCOUNT} to ${transaction?.TO}`;
      } else if (transaction?.DESCRIPTION) {
        title = transaction?.DESCRIPTION;
      }

      let niceDate = "";
      if (
        typeof transaction?.DATE === "string" &&
        transaction?.DATE.startsWith("Date")
      ) {
        niceDate = formatCustomDate(transaction?.DATE);
      } else {
        niceDate = transaction?.DATE ? formatCustomDate(transaction?.DATE) : "";
      }

      const transactionItem = document.createElement("div");
      transactionItem.onclick = function () {
        selectedTransaction = {...transaction};
        loadPage(`add${capitalizeFirstLetter(transaction?.CATEGORY)}`);
      };
      transactionItem.className = "recent-tx-item";
      transactionItem.innerHTML = `
          <div class="tx-icon-wrap" style="background: ${catInfo.bg}; color: ${catInfo.color}">
            <i class="fas ${catInfo.icon}"></i>
          </div>
          <div class="tx-details-dash">
            <span class="tx-title">${title}</span>
            <span class="tx-date" style="font-size: 12px; color: #6c757d;">${niceDate}</span>
          </div>
          <div style="text-align: right;">
            <strong class="${amountClass}" style="display: block; font-size: 12px; margin-bottom: 2px;">${sign}₹${formatNumber(transaction?.AMOUNT)}</strong>
            <span style="font-size: 12px; color: #adb5bd;">${formatCustomTime(transaction?.TIME) || ""}</span>
          </div>
      `;
      transactionList.appendChild(transactionItem);
    });
  } else {
    const transactionItem = document.createElement("div");
    transactionItem.style.textAlign = "center";
    transactionItem.style.color = "#999";
    transactionItem.style.fontSize = "12px";
    transactionItem.style.padding = "20px";
    transactionItem.innerHTML = "no transactions found";
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
