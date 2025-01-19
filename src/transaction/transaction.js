function formatCustomDate(input) {
  // Extract the values from the input string using a regular expression
  const match = input.match(
    /Date\((\d+),\s*(\d+),\s*(\d+)\)/
  );

  // ,\s*(\d+),\s*(\d+),\s*(\d+) for time

  if (!match) {
    throw new Error("Invalid input format");
  }

  // Destructure the extracted values into separate variables
  const [_, year, month, day] = match.map(Number); // Convert to numbers

  // Create a new Date object
  const date = new Date(year, month, day);

  // Format the date
  const dayNumber = date.getDate();
  const monthName = date.toLocaleString("default", { month: "short" }); // Get the short month name
  const yearNumber = date.getFullYear();

  return `${dayNumber} ${monthName} ${yearNumber}`;
}

// Function to load transaction data
async function loadTransactionData() {
  transactionData = [];
  const SHEET_ID = "1piEdxdEJv8_vnKem-r1GP03cLG5tFM1M9ydwSTSx94A";
  const GID = "13882067";
  const QUERY = `SELECT *`;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);
  const columns = [...res?.table?.cols];
  res?.table?.rows?.map((item) => {
    const transactionObject = {};
    columns?.map((header, i) => {
      transactionObject[header?.label] = item?.c?.[i]?.v;
      return "";
    });
    transactionData?.push(transactionObject);
    return "";
  });
  const transactionList = document.getElementById("transaction-list");
  transactionData.forEach((transaction) => {
    const transactionItem = document.createElement("div");
    transactionItem.classList.add("transaction-item");

    transactionItem.innerHTML = `
            <span class="transaction-account">${transaction?.ACCOUNT}</span>
            <span class="transaction-description">${
              transaction?.TO
                ? `TO ${transaction?.TO}`
                : transaction?.DESCRIPTION || ""
            }</span>
            <span class="amount">${transaction?.AMOUNT}</span>
            <div style="display:block">${formatCustomDate(
              transaction?.DATE
            )}</div>
        `;
    transactionList.appendChild(transactionItem);
  });
}

loadTransactionData();
