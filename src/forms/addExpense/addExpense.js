logOutCheck();

document
  .getElementById("add-expense-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const url =
      "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdDz4tiAMwdTxeyfXsLAQbs7yLaISgoYIrwaTJ9dJIF1xLO4g/formResponse";
    // Replace with your form action URL
    fetch(url, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    })
      .then((response) => {
        // showSnackbar1();
        document.getElementById("add-expense-form").reset();
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  });

// Function to load transaction data
async function loadAccountData() {
  accountList = [];
  const SHEET_ID = "1piEdxdEJv8_vnKem-r1GP03cLG5tFM1M9ydwSTSx94A";
  const GID = "779938159";
  const QUERY = `SELECT * `;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);
  const columns = [...res?.table?.cols];
  res?.table?.rows?.map((item) => {
    const accountObject = {};
    columns?.map((header, i) => {
      accountObject[header?.label] = item?.c?.[i]?.v;
      return "";
    });
    accountList?.push(accountObject);
    return "";
  });
  const accountOptionsElement = document.getElementById("account");
  accountList.forEach((acc) => {
    const accountOption = document.createElement("option");
    accountOption.value = `${acc?.ACCOUNT_NAME}`;
    accountOption.innerHTML = `${acc?.ACCOUNT_NAME}`;
    accountOptionsElement.appendChild(accountOption);
  });
}

loadAccountData();
