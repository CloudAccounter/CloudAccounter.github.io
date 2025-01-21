// Function to load account data
async function loadAccountData() {
  accountData = [];
  const SHEET_ID = "1piEdxdEJv8_vnKem-r1GP03cLG5tFM1M9ydwSTSx94A";
  const GID = "211994317";
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

  const uniqueTypes = [
    ...new Set(accountData.map((account) => account.ACCOUNT_TYPE)),
  ];
  const accountList = document.getElementById("account-balances");
  uniqueTypes.forEach((type) => {
    const totalBalance = accountData
      ?.filter((account) => account?.ACCOUNT_TYPE === type)
      .reduce((sum, account) => sum + account?.BALANCE, 0);
    const accountHeader = document.createElement("div");
    accountHeader.classList.add("account-list");
    accountHeader.innerHTML = `
            <span class="account-name">${type || ""}</span>
            <span class="balance">${totalBalance || 0}</span>
        `;
    const accountItems = document.createElement("div");
    accountData
      ?.filter((account) => account?.ACCOUNT_TYPE === type)
      ?.forEach((account) => {
        const accountItem = document.createElement("div");
        accountItem.classList.add("account-item");
        accountItem.innerHTML = `
            <span class="account-name">${account?.ACCOUNT_NAME || ""}</span>
            <span class="balance">${account?.BALANCE || 0}</span>
        `;
        accountItems.appendChild(accountItem);
      });
    accountList.appendChild(accountHeader);
    accountList.appendChild(accountItems);
  });
}

loadAccountData();
