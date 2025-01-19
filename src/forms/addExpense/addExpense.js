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

