defaultTransaction = { ...getNewDateTime() };
document
  .getElementById("add-account-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const formID=JSON.parse(localStorage.getItem("user"))?.ACC_MASTER_FORM
    const url =
      `https://docs.google.com/forms/u/0/d/e/${formID}/formResponse`;
    // Replace with your form action URL
    fetch(url, {
      method: "POST",
      mode: "no-cors",
      body: formData,
    })
      .then((response) => {
        // showSnackbar1();
        document.getElementById("add-account-form").reset();
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
      });
  });

