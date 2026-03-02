currentTab = "income";

incomeState = {
  data: [],
  isLoading: false,
};

expenseState = {
  data: [],
  isLoading: false,
};

// Period selection and Date picker setup
currentPeriod = "monthly"; // default
currentLedgerPeriodDate = window.currentLedgerPeriodDate || new Date();

if (!window.filter) {
  window.filter = {};
}

ledgerPeriodSelect = document.getElementById("ledgerPeriodSelect");
ledgerPeriodNavigation = document.getElementById("ledgerPeriodNavigation");
ledgerPeriodLabel = document.getElementById("ledgerPeriodLabel");
prevLedgerPeriodBtn = document.getElementById("prevLedgerPeriodBtn");
nextLedgerPeriodBtn = document.getElementById("nextLedgerPeriodBtn");
customDateFields = document.getElementById("custom-date-fields");
ledgerDateFrom = document.getElementById("ledgerDateFrom");
ledgerDateTo = document.getElementById("ledgerDateTo");
reloadLedgerDataBtn = document.getElementById("reloadLedgerData");

function setDatesByPeriod(period, refDate = new Date()) {
  if (period === "monthly") {
    filter.DATE_FROM = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    filter.DATE_TO = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);
    if (ledgerPeriodLabel) {
      ledgerPeriodLabel.innerText = refDate.toLocaleDateString("default", {
        month: "long",
        year: "numeric",
      });
    }
  } else if (period === "weekly") {
    const day = refDate.getDay();
    const diff = refDate.getDate() - day + (day === 0 ? -6 : 1);
    filter.DATE_FROM = new Date(
      refDate.getFullYear(),
      refDate.getMonth(),
      diff,
    );
    filter.DATE_TO = new Date(
      refDate.getFullYear(),
      refDate.getMonth(),
      diff + 6,
    );
    if (ledgerPeriodLabel) {
      const fromStr = filter.DATE_FROM.toLocaleDateString("default", {
        day: "2-digit",
        month: "short",
      });
      const toStr = filter.DATE_TO.toLocaleDateString("default", {
        day: "2-digit",
        month: "short",
      });
      ledgerPeriodLabel.innerText = `${fromStr} - ${toStr}`;
    }
  }

  if (ledgerDateFrom && filter.DATE_FROM)
    ledgerDateFrom.valueAsDate = filter.DATE_FROM;
  if (ledgerDateTo && filter.DATE_TO) ledgerDateTo.valueAsDate = filter.DATE_TO;
}

if (ledgerPeriodSelect) {
  ledgerPeriodSelect.addEventListener("change", (e) => {
    currentPeriod = e.target.value;
    if (currentPeriod === "custom") {
      if (customDateFields) customDateFields.style.display = "flex";
      if (ledgerPeriodNavigation) ledgerPeriodNavigation.style.display = "none";
    } else {
      if (customDateFields) customDateFields.style.display = "none";
      if (ledgerPeriodNavigation) ledgerPeriodNavigation.style.display = "flex";
      currentLedgerPeriodDate = new Date(); // Reset ref date
      setDatesByPeriod(currentPeriod, currentLedgerPeriodDate);
      loadLedgerDataForPeriod();
    }
  });
}

if (prevLedgerPeriodBtn) {
  prevLedgerPeriodBtn.addEventListener("click", () => {
    if (currentPeriod === "monthly") {
      currentLedgerPeriodDate.setMonth(currentLedgerPeriodDate.getMonth() - 1);
    } else if (currentPeriod === "weekly") {
      currentLedgerPeriodDate.setDate(currentLedgerPeriodDate.getDate() - 7);
    }
    setDatesByPeriod(currentPeriod, currentLedgerPeriodDate);
    loadLedgerDataForPeriod();
  });
}

if (nextLedgerPeriodBtn) {
  nextLedgerPeriodBtn.addEventListener("click", () => {
    if (currentPeriod === "monthly") {
      currentLedgerPeriodDate.setMonth(currentLedgerPeriodDate.getMonth() + 1);
    } else if (currentPeriod === "weekly") {
      currentLedgerPeriodDate.setDate(currentLedgerPeriodDate.getDate() + 7);
    }
    setDatesByPeriod(currentPeriod, currentLedgerPeriodDate);
    loadLedgerDataForPeriod();
  });
}

if (!filter.DATE_FROM || !filter.DATE_TO) {
  setDatesByPeriod("monthly", currentLedgerPeriodDate);
  if (ledgerPeriodSelect) ledgerPeriodSelect.value = "monthly";
  if (ledgerPeriodNavigation) ledgerPeriodNavigation.style.display = "flex";
} else {
  if (ledgerDateFrom && filter.DATE_FROM)
    ledgerDateFrom.valueAsDate = filter.DATE_FROM;
  if (ledgerDateTo && filter.DATE_TO) ledgerDateTo.valueAsDate = filter.DATE_TO;
  if (ledgerPeriodSelect) {
    ledgerPeriodSelect.value = "custom";
    if (customDateFields) customDateFields.style.display = "flex";
    if (ledgerPeriodNavigation) ledgerPeriodNavigation.style.display = "none";
  }
}

if (ledgerDateFrom) {
  ledgerDateFrom.addEventListener("change", (e) => {
    if (e.target.value) {
      filter.DATE_FROM = new Date(e.target.value);
    }
  });
}

if (ledgerDateTo) {
  ledgerDateTo.addEventListener("change", (e) => {
    if (e.target.value) {
      filter.DATE_TO = new Date(e.target.value);
    }
  });
}

if (reloadLedgerDataBtn) {
  reloadLedgerDataBtn.addEventListener("click", () => {
    loadLedgerDataForPeriod();
  });
}

function switchLedgerTab(tabName) {
  currentTab = tabName;

  // Update button active state
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase().includes(tabName)) {
      btn.classList.add("active");
    }
  });

  // Update content active state
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`${tabName}-transactions`).classList.add("active");
}

function updateLedgerTitle() {
  const titleEl = document.getElementById("ledger-title");
  if (titleEl) {
    if (selectedAccount && selectedAccount.ACCOUNT_NAME) {
      titleEl.innerText = `${selectedAccount.ACCOUNT_NAME} - Ledger`;
    } else {
      titleEl.innerText = `Ledger Transactions`;
    }
  }
}
updateLedgerTitle();

async function loadLedgerDataForPeriod() {
  const incomeListId = "income-transaction-list";
  const expenseListId = "expense-transaction-list";
  const transactionListIncome = document.getElementById(incomeListId);
  const transactionListExpense = document.getElementById(expenseListId);

  if (!transactionListIncome || !transactionListExpense) return;
  // if (
  //   typeof selectedAccount === "undefined" ||
  //   !selectedAccount ||
  //   !selectedAccount.ACCOUNT_NAME
  // )
  //   return;
  if (!filter.DATE_FROM || !filter.DATE_TO) return;

  if (incomeState.isLoading || expenseState.isLoading) return;

  incomeState.isLoading = true;
  expenseState.isLoading = true;

  transactionListIncome.innerHTML = "";
  transactionListExpense.innerHTML = "";

  incomeState.data = [];
  expenseState.data = [];

  const SHEET_ID = JSON.parse(localStorage.getItem("user"))?.id;
  const GID = JSON.parse(localStorage.getItem("user"))?.VW_TRANSACTIONS;

  let QUERY = `SELECT * WHERE (I = 'income' OR I = 'expense')`;

  if (selectedAccount && selectedAccount.ACCOUNT_NAME) {
    QUERY += ` AND (G='${selectedAccount.ACCOUNT_NAME}' OR H='${selectedAccount.ACCOUNT_NAME}')`;
  }

  if (filter.DATE_FROM) {
    QUERY += ` AND E >= date '${formatDateToYYYYMMDD(filter.DATE_FROM)}'`;
  }
  if (filter.DATE_TO) {
    QUERY += ` AND E <= date '${formatDateToYYYYMMDD(filter.DATE_TO)}'`;
  }
  QUERY += ` AND (L IS NULL OR L != 1) ORDER BY E DESC, F DESC`;

  try {
    const res = await readGsheetData(SHEET_ID, GID, QUERY);

    let totalIncome = 0;
    let totalExpense = 0;

    if (res?.errors) {
      console.error("GSheet query error:", res.errors);
      incomeState.isLoading = false;
      expenseState.isLoading = false;
      return;
    }

    if (res && res.table && res.table.cols && res.table.rows) {
      const columns = [...res.table.cols];
      const rows = res.table.rows;

      if (rows.length > 0) {
        rows.forEach((item) => {
          const transactionObject = {};
          columns.forEach((header, i) => {
            transactionObject[header?.label?.trim()] = item?.c?.[i]?.v;
          });

          if (transactionObject.CATEGORY === "income") {
            incomeState.data.push(transactionObject);
            totalIncome += Number(transactionObject.AMOUNT || 0);
          } else if (transactionObject.CATEGORY === "expense") {
            expenseState.data.push(transactionObject);
            totalExpense += Number(transactionObject.AMOUNT || 0);
          }
        });
      }
    }

    // Update Totals UI
    const totalBalance = totalIncome - totalExpense;

    const incomeTotalEl = document.getElementById("ledger-income-total");
    if (incomeTotalEl) incomeTotalEl.innerText = formatNumber(totalIncome);

    const expenseTotalEl = document.getElementById("ledger-expense-total");
    if (expenseTotalEl) expenseTotalEl.innerText = formatNumber(totalExpense);

    const balanceEl = document.getElementById("ledger-balance-amount");
    if (balanceEl) {
      if (totalBalance > 0) {
        balanceEl.style.color = "green";
        balanceEl.innerText = `+${formatNumber(totalBalance)}`;
      } else if (totalBalance < 0) {
        balanceEl.style.color = "red";
        balanceEl.innerText = `-${formatNumber(Math.abs(totalBalance))}`;
      } else {
        balanceEl.style.color = "#007bff";
        balanceEl.innerText = formatNumber(0);
      }
    }

    incomeState.isLoading = false;
    expenseState.isLoading = false;

    renderLedgerTransactions(incomeState.data, incomeListId, true);
    renderLedgerTransactions(expenseState.data, expenseListId, true);
  } catch (err) {
    console.error(`Error loading ledger data:`, err);
    incomeState.isLoading = false;
    expenseState.isLoading = false;
  }
}

function renderLedgerTransactions(transactionData, listId, clearList = false) {
  const transactionList = document.getElementById(listId);
  if (!transactionList) return;

  if (clearList) transactionList.innerHTML = "";

  if (transactionData && transactionData.length > 0) {
    transactionData.forEach((transaction) => {
      const transactionItem = document.createElement("div");
      transactionItem.onclick = function () {
        selectedTransaction = {...transaction};
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
  } else if (clearList) {
    const transactionItem = document.createElement("div");
    transactionItem.classList.add("transaction-no-item");
    transactionItem.innerHTML = `
            <span class="transaction-account" style="text-align:center;margin:auto">
              no transactions found
            </span>`;
    transactionList.appendChild(transactionItem);
  }
}

// Initial load for the default active date
loadLedgerDataForPeriod();
