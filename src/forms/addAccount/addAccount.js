defaultTransaction = { ...getNewDateTime() };
document
  .getElementById("add-account-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const url =
      "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfFOxIIzl94hY1kwUTJqhriFM-tFTkJGgxgSIWs06akXPTswQ/formResponse";
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

