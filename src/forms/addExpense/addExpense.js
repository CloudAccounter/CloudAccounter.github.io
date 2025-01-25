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
function formatCustomDate(input) {
  // Extract the values from the input string using a regular expression
  const match = input?.match(/Date\((\d+),\s*(\d+),\s*(\d+)\)/);
  let result = "";

  if (!!match) {
    // Destructure the extracted values into separate variables
    const [_, year, month, day] = match.map(Number); // Convert to numbers

    // Create a new Date object
    const date = new Date(year, month, day);

    // Format the date
    const dayNumber = date.getDate();
    const monthName = String(date.getMonth() + 1).padStart(2, "0"); // Get the short month name
    const yearNumber = date.getFullYear();

    result = `${yearNumber}-${monthName}-${dayNumber}`;
  }
  return result;
}

function formatCustomTime(input) {
  // Extract the values from the input string using a regular expression
  const match = input?.match(
    /Date\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/
  );

  let result = "";
  if (!!match) {
    // Destructure the extracted values into separate variables
    const [_, year, month, day, hour, minute] = match.map(Number); // Convert to numbers

    // Create a new Date object
    const date = new Date(year, month, day, hour, minute);

    // Format the time
    let hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    // const period = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    // hours = hours % 12 || 12;

    // Pad minutes with leading zero if needed
    // const formattedMinutes = minutes.toString().padStart(2, "0");

    result = `${hours}:${minutes}`;
  }

  return result;
}

function singleFetchTransaction(transactionData) {
  if (transactionData?.ID) {
    document.getElementById("id").value = transactionData?.ID;
  }
  if (transactionData?.DATE) {
    document.getElementById("date").value = formatCustomDate(
      transactionData?.DATE
    );
  }
  if (transactionData?.TIME) {
    document.getElementById("time").value = formatCustomTime(
      transactionData?.TIME
    );
  }
  if (transactionData?.ACCOUNT) {
    document.getElementById("account").value = transactionData?.ACCOUNT;
  }
  if (transactionData?.TO) {
    document.getElementById("account_to").value = transactionData?.TO;
  }
  if (transactionData?.CATEGORY) {
    document.getElementById("category").value = transactionData?.CATEGORY;
  }
  if (transactionData?.AMOUNT) {
    document.getElementById("amount").value = transactionData?.AMOUNT;
  }
  if (transactionData?.DESCRIPTION) {
    document.getElementById("description").value = transactionData?.DESCRIPTION;
  }
  if (transactionData?.CANCEL) {
    document.getElementById("cancel").value = transactionData?.CANCEL;
  }
  selectedTransaction = {};
}

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

  const accountToOptionsElement = document.getElementById("account_to");
  accountList.forEach((acc) => {
    const accountOption = document.createElement("option");
    accountOption.value = `${acc?.ACCOUNT_NAME}`;
    accountOption.innerHTML = `${acc?.ACCOUNT_NAME}`;
    accountToOptionsElement.appendChild(accountOption);
  });

  setTimeout(singleFetchTransaction(selectedTransaction), 1000);
}

loadAccountData();
