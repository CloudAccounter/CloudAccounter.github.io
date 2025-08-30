// const API_KEY = "AIzaSyANrbBPpULgkZG_jMuXhtD6erv-8dM1G-k";
// const SHEET_ID = "1X9MNBQpWpv8wlLJrmZ133TQ8REO9s1OHHiYS1_bzlvQ"; // Extract from the Google Sheet URL
// const RANGE = "Form responses 1!A:F"; // Define the range of cells you want to read

// let productsData = [];

async function readGsheetData(SHEET_ID, GID, QUERY) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${GID}&tq=${encodeURIComponent(
    QUERY
  )}`;

  try {
    const response = await fetch(url);

    // Check if the response is ok
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const text = await response.text(); // Get response as text
    const jsonResponse = text
      .replace("/*O_o*/", "")
      .replace(/google\.visualization\.Query\.setResponse\(/, "")
      .replace(/\);$/, ""); // Clean up the string

    // Parse the cleaned string to JSON
    const jsonData = JSON.parse(jsonResponse);

    return jsonData; // Return the customerId
  } catch (error) {
    console.error("Fetch error:", error);
    return null; // Return null or handle the error as needed
  }
}

async function login(event) {
  event.preventDefault(); // Prevent form submission

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("error-message");

  // Clear previous error message
  errorMessage.textContent = "";

  // Simple validation
  if (username === "" || password === "") {
    errorMessage.textContent = "Please fill in both fields.";
    return;
  }
  const SHEET_ID = "1piEdxdEJv8_vnKem-r1GP03cLG5tFM1M9ydwSTSx94A";
  const GID = "1619426406";
  const QUERY = `SELECT * WHERE A="${username}"  AND B="${password}"`;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);

  const columns = [...res?.table?.cols];
  const rows = res?.table?.rows;
  const tableData=[];
  const tableObject = {};
  rows.forEach((item) => {
    columns.forEach((header, i) => {
      tableObject[header?.label?.trim()] = item?.c?.[i]?.v;
    });
  });
  tableData.push(tableObject);

  // Access the desired data
  const customerId = tableData?.[0]?.SHEET_ID; // Safely access the customerId
  if (customerId) {
    document.getElementById("side-menu").classList.remove("hide");
    // alert("Login successful!");
    const user = {
      ...tableData?.[0],
      B:null,
      name: username,
      id: customerId,
      time: new Date()
    };
    localStorage.setItem("user", JSON.stringify(user));
    // window.location.href = "/products";
    // loadPage("products", "main-content");
    const lastPage = localStorage.getItem("lastPage") || "dashboard"; // Default to 'dashboard'
    if (mainRoutes?.[lastPage]) {
      if (lastPage === "login") {
        loadPage("dashboard"); // Fallback if lastPage is invalid
      } else {
        loadPage(lastPage);
      }
    } else {
      loadPage("dashboard"); // Fallback if lastPage is invalid
    }
  } else {
    errorMessage.textContent = "Invalid username or password.";
  }
}
