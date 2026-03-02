currentTab = "income";

incomeState = {
  data: [],
  isLoading: false,
};

expenseState = {
  data: [],
  isLoading: false,
};

// Date picker setup
if (!window.filter) {
  window.filter = {};
}
if (!window.filter.DATE_FROM) {
  const today = new Date();
  window.filter.DATE_FROM = new Date(today.getFullYear(), today.getMonth(), 1);
}
if (!window.filter.DATE_TO) {
  const today = new Date();
  window.filter.DATE_TO = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  );
}

ledgerDateFrom = document.getElementById("ledgerDateFrom");
ledgerDateTo = document.getElementById("ledgerDateTo");
reloadLedgerDataBtn = document.getElementById("reloadLedgerData");

if (ledgerDateFrom) {
  ledgerDateFrom.valueAsDate = filter.DATE_FROM;
  ledgerDateFrom.addEventListener("change", (e) => {
    if (e.target.value) {
      filter.DATE_FROM = new Date(e.target.value);
    }
  });
}

if (ledgerDateTo) {
  ledgerDateTo.valueAsDate = filter.DATE_TO;
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
