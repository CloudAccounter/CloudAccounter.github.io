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



//   Account Name: account_name
// Account Type: account_type
// Account Number: account_number
// Bank Name: bank_name
// Account Holder Name: account_holder_name
// Balance: balance
// Currency: currency
// Opening Date: opening_date
// Status: status
// Description/Notes: description