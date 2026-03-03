// Function to load ledger account data
async function loadLedgerAccountData() {
  selectedAccount = {};
  localStorage.removeItem("selectedAccount");
  accountData = [];
  const SHEET_ID = JSON.parse(localStorage.getItem("user"))?.id;
  const GID = JSON.parse(localStorage.getItem("user"))?.SP_ACC_BALANCES;
  const QUERY = `SELECT C,D,N ORDER BY D`;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);
  const columns = [...res?.table?.cols];
  res?.table?.rows?.map((item) => {
    const accountObject = {};
    columns?.map((header, i) => {
      accountObject[header?.label] = item?.c?.[i]?.v;
      return "";
    });
    accountData?.push(accountObject);
    return "";
  });

  const ledgerAccounts = accountData;
  // .filter(
  //   (account) => account.ACCOUNT_TYPE === "LEDGER",
  // );

  const uniqueTypes = [
    ...new Set(ledgerAccounts.map((account) => account.ACCOUNT_TYPE)),
  ];
  const accountList = document.getElementById("ledger-account-balances");
  accountList.innerHTML = "";
  uniqueTypes.forEach((type) => {
    const totalBalance = ledgerAccounts
      ?.filter((account) => account?.ACCOUNT_TYPE === type)
      .reduce((sum, account) => sum + account?.BALANCE, 0);
    // Type Header
    const typeHeader = document.createElement("div");
    typeHeader.style.padding = "16px 0 8px 0";
    typeHeader.style.fontSize = "15px";
    typeHeader.style.fontWeight = "700";
    // typeHeader.style.color = "#adb5bd";
    // typeHeader.style.textTransform = "uppercase";
    typeHeader.style.letterSpacing = "2px";
    // typeHeader.style.display = "flex";
    // typeHeader.style.justifyContent = "space-between";
    // typeHeader.style.borderBottom = "1px solid #f1f3f5";
    // typeHeader.style.marginBottom = "12px";
    typeHeader.classList.add("fas");
    typeHeader.classList.add("fa-users");
    typeHeader.classList.add("account-icon-header");
    typeHeader.classList.add("widget-header");

    typeHeader.innerHTML = `
      <span>${type || "Other"}</span>
      <span>₹${formatNumber(totalBalance) || 0}</span>
    `;
    accountList.appendChild(typeHeader);

    // Default icon mapping
    const typeIconMap = {
      CASH: {icon: "fa-money-bill-wave", color: "#28a745", bg: "#e8f5e9"},
      BANK: {icon: "fa-briefcase", color: "#007bff", bg: "#e3f2fd"},
      CREDIT: {icon: "fa-credit-card", color: "#dc3545", bg: "#f8d7da"},
      LEDGER: {icon: "fa-book", color: "#ff9800", bg: "#fff3e0"},
      DEFAULT: {icon: "fa-folder", color: "#6c757d", bg: "#f8f9fa"},
    };

    const mapping =
      typeIconMap[(type || "DEFAULT").toUpperCase()] || typeIconMap["DEFAULT"];

    ledgerAccounts
      ?.filter((account) => account?.ACCOUNT_TYPE === type)
      ?.forEach((account) => {
        const accountItem = document.createElement("div");
        accountItem.className = "account-item-dash";
        accountItem.onclick = function () {
          selectedAccount = {...account};
          loadPage("ledgerDashboard");
        };
        accountItem.innerHTML = `
          <div class="account-icon-wrap" style="color: ${mapping.color}; background: ${mapping.bg}; width: 36px; height: 36px; font-size: 16px;">
            <i class="fas ${mapping.icon}"></i>
          </div>
          <div class="account-info" style="margin-left: 8px;">
            <span class="account-name-short" style="font-size: 15px;">${account?.ACCOUNT_NAME || ""}</span>
          </div>
          <strong class="account-bal">₹${formatNumber(account?.BALANCE) || 0}</strong>
        `;
        accountList.appendChild(accountItem);
      });
  });
}

loadLedgerAccountData();
