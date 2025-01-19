// Function to load account data
function loadAccountData() {
  const accountList = document.getElementById("account-list");
  accountData.forEach((account) => {
    const accountItem = document.createElement("div");
    accountItem.classList.add("account-item");

    accountItem.innerHTML = `
            <span class="account-name">${account.name}</span>
            <span class="balance">${account.balance} ${account.currency}</span>
        `;
    accountList.appendChild(accountItem);
  });
}

// Function to load loan data
function loadLoanData() {
  const loanList = document.getElementById("loan-list");
  loanData.forEach((loan) => {
    const loanItem = document.createElement("div");
    loanItem.classList.add("loan-item");

    loanItem.innerHTML = `
            <span class="loan-name">${loan.name}</span>
            <span class="remaining-loan">${loan.remainingLoan} ${loan.currency}</span>
        `;
    loanList.appendChild(loanItem);
  });
}

// Function to load transaction data
function loadTransactionData() {
  const transactionList = document.getElementById("transaction-list");
  transactionData.forEach((transaction) => {
    const transactionItem = document.createElement("div");
    transactionItem.classList.add("transaction-item");

    transactionItem.innerHTML = `
            <span class="transaction-description">${transaction.description}</span>
            <span class="amount">${transaction.amount} USD</span>
            <span class="transaction-date">${transaction.date}</span>
        `;
    transactionList.appendChild(transactionItem);
  });
}

// Initialize the dashboard page
// document.addEventListener("DOMContentLoaded", () => {

loadAccountData();
loadLoanData();
loadTransactionData();
// });
