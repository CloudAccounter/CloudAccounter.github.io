function formatNumber(value, options = { locale: 'en-IN' }) {
  const {
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  if (typeof value !== 'number') {
    value = parseFloat(value);
    if (isNaN(value)) return '';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
}


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
    const monthName = date.toLocaleString("default", { month: "short" }); // Get the short month name
    const yearNumber = date.getFullYear();

    result = `${dayNumber} ${monthName} ${yearNumber}`;
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
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12 || 12;

    // Pad minutes with leading zero if needed
    const formattedMinutes = minutes.toString().padStart(2, "0");

    result = `${hours}:${formattedMinutes} ${period}`;
  }

  return result;
}

// Function to format date as YYYY-MM-DD
function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure two digits
  const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits
  return `${year}-${month}-${day}`;
}

function capitalizeFirstLetter(word) {
  if (!word) return ""; // Handle empty or invalid input
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}


// Function to adjust the date
function adjustDate(days) {
  const currentDate = new Date(datePicker.value);
  currentDate.setDate(currentDate.getDate() + days);
  datePicker.valueAsDate = currentDate;
  filter.DATE = currentDate;
  loadTransactionData();
}
