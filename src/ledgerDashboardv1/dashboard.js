// Function to load dashboard data
async function loadDashboardData() {
  accountData = []; // clear current data
  const SHEET_ID = JSON.parse(localStorage.getItem("user"))?.id;
  const BALANCES_GID = JSON.parse(
    localStorage.getItem("user"),
  )?.SP_ACC_BALANCES;
  const TRANSACTIONS_GID = JSON.parse(
    localStorage.getItem("user"),
  )?.VW_TRANSACTIONS;
  const USER_NAME = JSON.parse(localStorage.getItem("user"))?.name || "User";

  // Set greeting and month
  const today = new Date();
  const hours = today.getHours();
  let greeting = "Good Evening";
  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";
  document.querySelector(".greeting").textContent = greeting; // + " " + USER_NAME;

  const monthSelector = document.getElementById("dashboard-month-selector");
  if (!monthSelector.value) {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    monthSelector.value = `${year}-${month}`;
  }

  monthSelector.onchange = () => {
    loadDashboardData();
  };

  try {
    // 1. Fetch Balances
    const balanceQuery = `SELECT C,D,N ORDER BY D`;
    const balanceRes = await readGsheetData(
      SHEET_ID,
      BALANCES_GID,
      balanceQuery,
    );
    const balanceCols = balanceRes?.table?.cols || [];
    balanceRes?.table?.rows?.forEach((item) => {
      const accountObject = {};
      balanceCols?.forEach((header, i) => {
        accountObject[header?.label] = item?.c?.[i]?.v;
      });
      accountData.push(accountObject);
    });

    // Calculate Net Balance for the selected ledger
    let filteredAccounts = accountData;
    if (
      typeof selectedAccount !== "undefined" &&
      selectedAccount &&
      selectedAccount.ACCOUNT_NAME
    ) {
      filteredAccounts = accountData.filter(
        (acc) => acc.ACCOUNT_NAME === selectedAccount.ACCOUNT_NAME,
      );
      document.querySelector(".greeting").textContent +=
        " " + selectedAccount.ACCOUNT_NAME;
    } else {
      // Fallback if no ledger selected
      filteredAccounts = accountData.filter(
        (acc) => acc.ACCOUNT_TYPE === "LEDGER",
      );
    }

    const netBalance = filteredAccounts.reduce(
      (sum, acc) => sum + (acc.BALANCE || 0),
      0,
    );
    document.getElementById("net-balance-amount").textContent =
      "₹" + formatNumber(netBalance);

    // Render Accounts List
    const accountsListEl = document.getElementById("dashboard-accounts-list");
    accountsListEl.innerHTML = "";

    // Default Mapping
    const typeIconMap = {
      CASH: {icon: "fa-money-bill-wave", color: "#28a745"},
      BANK: {icon: "fa-briefcase", color: "#007bff"},
      CREDIT: {icon: "fa-credit-card", color: "#dc3545"},
      LEDGER: {icon: "fa-book", color: "#ff9800"},
      DEFAULT: {icon: "fa-folder", color: "#6c757d"},
    };

    const uniqueTypes = [
      ...new Set(filteredAccounts.map((a) => a.ACCOUNT_TYPE)),
    ];
    uniqueTypes.slice(0, 3).forEach((type) => {
      const total = filteredAccounts
        .filter((a) => a.ACCOUNT_TYPE === type)
        .reduce((sum, a) => sum + (a.BALANCE || 0), 0);
      const mapping = typeIconMap[type.toUpperCase()] || typeIconMap["DEFAULT"];

      const typeDiv = document.createElement("div");
      typeDiv.className = "account-item-dash";
      typeDiv.onclick = function () {
        loadPage("ledgerTransaction");
      };
      typeDiv.innerHTML = `
        <div class="account-icon-wrap" style="color: ${mapping.color}">
          <i class="fas ${mapping.icon}"></i>
        </div>
        <div class="account-info">
          <span class="account-name-short">${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}</span>
        </div>
        <strong class="account-bal">₹${formatNumber(total)}</strong>
      `;
      accountsListEl.appendChild(typeDiv);
    });

    // 2. Fetch Transactions (for Income/Expense and Recent)
    // We will fetch the recent 100 transactions to deduce the monthly spending
    let txQuery = `SELECT * WHERE (L IS NULL OR L != 1)`;
    if (
      typeof selectedAccount !== "undefined" &&
      selectedAccount &&
      selectedAccount.ACCOUNT_NAME
    ) {
      txQuery += ` AND (G='${selectedAccount.ACCOUNT_NAME}' OR H='${selectedAccount.ACCOUNT_NAME}')`;
    }
    txQuery += ` ORDER BY E DESC, F DESC LIMIT 100`;

    const txRes = await readGsheetData(SHEET_ID, TRANSACTIONS_GID, txQuery);
    const txCols = txRes?.table?.cols || [];
    const transactions = [];
    txRes?.table?.rows?.forEach((item) => {
      const txObj = {};
      txCols?.forEach((header, i) => {
        txObj[header?.label?.trim()] = item?.c?.[i]?.v;
      });
      transactions.push(txObj);
    });

    // Calculate Income / Expense
    let totalIncome = 0;
    let totalExpense = 0;
    const expensesByCategory = {};

    const [selYear, selMonth] = monthSelector.value.split("-");
    const currentYear = parseInt(selYear, 10);
    const currentMonth = parseInt(selMonth, 10) - 1;

    transactions.forEach((tx) => {
      let txDate;
      if (typeof tx.DATE === "string" && tx.DATE.startsWith("Date")) {
        const parts = tx.DATE.match(/\d+/g);
        if (parts && parts.length >= 3) {
          txDate = new Date(parts[0], parts[1], parts[2]);
        }
      } else if (tx.DATE instanceof Date) {
        txDate = tx.DATE;
      }

      // Process only if it's the current month and year
      if (
        txDate &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      ) {
        const amount = parseFloat(tx.AMOUNT) || 0;
        if (tx.CATEGORY === "income") {
          totalIncome += amount;
        } else if (tx.CATEGORY === "expense") {
          totalExpense += amount;
          // Use ACCOUNT as category if DESCRIPTION is missing
          const subCat = tx.ACCOUNT || tx.DESCRIPTION || "Other";
          expensesByCategory[subCat] =
            (expensesByCategory[subCat] || 0) + amount;
        }
      }
    });

    document.getElementById("total-income-amount").textContent =
      "₹" + formatNumber(totalIncome);
    document.getElementById("total-expense-amount").textContent =
      "₹" + formatNumber(totalExpense);
    document.getElementById("cashflow-income").textContent =
      "₹" + formatNumber(totalIncome);
    document.getElementById("cashflow-expense").textContent =
      "₹" + formatNumber(totalExpense);

    const maxFlow = Math.max(totalIncome, totalExpense);
    if (maxFlow > 0) {
      document.getElementById("income-progress").style.width =
        (totalIncome / maxFlow) * 100 + "%";
      document.getElementById("expense-progress").style.width =
        (totalExpense / maxFlow) * 100 + "%";
    } else {
      document.getElementById("income-progress").style.width = "0%";
      document.getElementById("expense-progress").style.width = "0%";
    }

    // Cashflow Insight
    const cashInsightEl = document.getElementById("cashflow-insight");
    if (totalIncome > totalExpense) {
      const savedPercent =
        totalIncome > 0
          ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
          : 0;
      cashInsightEl.className = "insight-banner success-insight";
      cashInsightEl.innerHTML = `<i class="fas fa-check-circle"></i><span><strong>Saved ${savedPercent}%</strong> of income</span>`;
    } else if (totalExpense > totalIncome && totalIncome > 0) {
      cashInsightEl.className = "insight-banner warning-insight";
      cashInsightEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>Spending exceeded income</span>`;
    } else {
      cashInsightEl.style.display = "none";
    }

    // Top Expenses
    const expensesListEl = document.getElementById("dashboard-expenses-list");
    expensesListEl.innerHTML = "";
    const sortedExpenses = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    let totalExpenseForPercentage = totalExpense > 0 ? totalExpense : 1;

    const expenseIcons = [
      "fa-hamburger",
      "fa-car",
      "fa-home",
      "fa-shopping-bag",
      "fa-bolt",
      "fa-ticket-alt",
    ];
    const expenseColors = [
      "#8bc34a",
      "#ff9800",
      "#f44336",
      "#3f51b5",
      "#00bcd4",
      "#9c27b0",
    ];

    sortedExpenses.forEach((exp, idx) => {
      const percent = Math.round((exp[1] / totalExpenseForPercentage) * 100);
      const icon = expenseIcons[idx % expenseIcons.length];
      const color = expenseColors[idx % expenseColors.length];
      expensesListEl.innerHTML += `
        <div class="expense-item-dash">
          <div class="expense-icon-wrap" style="color: ${color}; background: ${color}22">
            <i class="fas ${icon}"></i>
          </div>
          <span class="expense-name" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 80px;">${exp[0]}</span>
          <strong class="expense-percent ml-auto">${percent}%</strong>
        </div>
      `;
    });

    if (sortedExpenses.length === 0) {
      expensesListEl.innerHTML =
        '<div style="text-align:center; color:#999; font-size:12px; margin-top:10px;">No expenses yet</div>';
    }

    // Dynamic Insight Update
    const insightEl = document.getElementById("dynamic-insight");
    if (sortedExpenses.length > 0) {
      const topCat = sortedExpenses[0][0];
      insightEl.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i>
          <span>Your <strong>${topCat}</strong> expense is highest.</span>
          <i class="fas fa-chevron-right ml-auto"></i>
      `;
    } else {
      insightEl.style.display = "none"; // hide if no insight
    }

    // Recent Transactions
    const txListEl = document.getElementById("dashboard-transactions-list");
    txListEl.innerHTML = "";
    const recentTx = transactions.slice(0, 4);

    const txIconMap = {
      income: {icon: "fa-arrow-down", color: "#28a745", bg: "#e8f5e9"},
      expense: {icon: "fa-arrow-up", color: "#dc3545", bg: "#ffebee"},
      transfer: {icon: "fa-exchange-alt", color: "#007bff", bg: "#e3f2fd"},
    };

    recentTx.forEach((tx) => {
      const catInfo = txIconMap[tx.CATEGORY] || txIconMap["expense"];
      const isIncome = tx.CATEGORY === "income";
      const isTransfer = tx.CATEGORY === "transfer";
      let sign = isIncome ? "+" : "-";
      let amountClass = isIncome ? "tx-amount-green" : "tx-amount-red";

      if (isTransfer) {
        sign = "";
        amountClass = "tx-amount-blue";
      }
      let accountInfo = tx?.ACCOUNT || "--";
      if (tx?.CATEGORY === "transfer") {
        accountInfo = `${tx?.ACCOUNT} to ${tx?.TO}`;
      }
      let title = tx.DESCRIPTION || "Transaction";

      /* Format specific string date */
      let niceDate = "";
      if (typeof tx.DATE === "string" && tx.DATE.startsWith("Date")) {
        niceDate = formatCustomDate(tx.DATE);
      }

      const itemDiv = document.createElement("div");
      itemDiv.className = "recent-tx-item";
      itemDiv.onclick = function () {
        selectedTransaction = {...tx};
        loadPage(`add${capitalizeFirstLetter(tx?.CATEGORY)}`);
      };

      itemDiv.innerHTML = `
          <div class="tx-icon-wrap" style="background: ${catInfo.bg}; color: ${catInfo.color}">
            <i class="fas ${catInfo.icon}"></i>
          </div>
          <div class="tx-details-dash">
            <span class="tx-title">${title}</span>
            <span class="tx-date">${accountInfo}</span>
            <span class="tx-date">${niceDate}</span>
          </div>
          <strong class="${amountClass}">${sign}₹${formatNumber(tx.AMOUNT)}</strong>
      `;
      txListEl.appendChild(itemDiv);
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Call on load
loadDashboardData();
