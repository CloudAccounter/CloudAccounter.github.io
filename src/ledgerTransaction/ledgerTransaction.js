currentTab = "income";

incomeState = {
  data: [],
  offset: 0,
  isEndOfData: false,
  isLoading: false,
};

expenseState = {
  data: [],
  offset: 0,
  isEndOfData: false,
  isLoading: false,
};

function switchLedgerTab(tabName) {
  currentTab = tabName;

  // Update button active state
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase() === tabName) {
      btn.classList.add("active");
    }
  });

  // Update content active state
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });
  document.getElementById(`${tabName}-transactions`).classList.add("active");

  // Load data if empty
  if (tabName === "income" && incomeState.data.length === 0) {
    loadLedgerData("income");
  } else if (tabName === "expense" && expenseState.data.length === 0) {
    loadLedgerData("expense");
  }
}

async function loadLedgerData(type, forceRefresh = false) {
  const state = type === "income" ? incomeState : expenseState;
  const listId = `${type}-transaction-list`;
  const transactionList = document.getElementById(listId);

  if (!transactionList) return;
  if (!forceRefresh && (state.isLoading || state.isEndOfData)) return;

  if (forceRefresh) {
    transactionList.innerHTML = "";
    state.offset = 0;
    state.data = [];
    state.isEndOfData = false;
  }

  state.isLoading = true;

  const SHEET_ID = JSON.parse(localStorage.getItem("user"))?.id;
  const GID = JSON.parse(localStorage.getItem("user"))?.VW_TRANSACTIONS;

  // Base query with category filter
  let QUERY = `SELECT * WHERE I = '${type}'`;

  if (selectedAccount?.ACCOUNT_NAME) {
    QUERY += ` AND (G='${selectedAccount?.ACCOUNT_NAME}' OR H='${selectedAccount?.ACCOUNT_NAME}')`;
  }

  QUERY += ` AND (L IS NULL OR L != 1) ORDER BY E DESC, F DESC`;
  QUERY += ` LIMIT ${pageSize} OFFSET ${state.offset}`;

  try {
    const res = await readGsheetData(SHEET_ID, GID, QUERY);

    if (res?.errors) {
      console.error("GSheet query error:", res.errors);
      state.isLoading = false;
      return;
    }

    if (!res || !res.table || !res.table.cols) {
      console.error("Invalid response from google sheet:", res);
      state.isLoading = false;
      return;
    }

    const columns = [...res.table.cols];
    const rows = res.table.rows;

    if (!rows || rows.length === 0) {
      state.isEndOfData = true;
      state.isLoading = false;
      if (state.offset === 0) {
        renderLedgerTransactions([], listId);
      }
      return;
    }

    const newData = [];
    rows.forEach((item) => {
      const transactionObject = {};
      columns.forEach((header, i) => {
        transactionObject[header?.label?.trim()] = item?.c?.[i]?.v;
      });
      newData.push(transactionObject);
      state.data.push(transactionObject);
    });

    state.offset += pageSize;
    state.isLoading = false;

    renderLedgerTransactions(newData, listId, state.offset === pageSize);
  } catch (err) {
    console.error(`Error loading ${type} ledger data:`, err);
    state.isLoading = false;
  }
}

window.addEventListener("scroll", () => {
  const nearBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
  if (nearBottom) {
    // Only load more for the currently active tab
    loadLedgerData(currentTab);
  }
});

function renderLedgerTransactions(transactionData, listId, clearList = false) {
  const transactionList = document.getElementById(listId);
  if (!transactionList) return;

  if (clearList) transactionList.innerHTML = "";

  if (transactionData?.length) {
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
    // Only show "no transactions" if we are clearing the list (meaning offset 0 and no data)
    const transactionItem = document.createElement("div");
    transactionItem.classList.add("transaction-no-item");
    transactionItem.innerHTML = `
            <span class="transaction-account" style="text-align:center;margin:auto">
              no transactions found
            </span>`;
    transactionList.appendChild(transactionItem);
  }
}

// Initial load for the default active tab
loadLedgerData("income");
