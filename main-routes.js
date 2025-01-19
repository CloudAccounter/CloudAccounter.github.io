const mainRoutes = {
  login: {
    pages: [["src/login/login.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/login/login.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/utility-functions/google-sheet-api.js" },
        ],
      },
    ],
  },
  dashboard: {
    pages: [["src/dashboard/dashboard.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/dashboard/dashboard.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/dashboard/dashboard.js" },
        ],
      },
    ],
  },
  transaction: {
    pages: [["src/transaction/transaction.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [
          { href: "src/transaction/transaction.css" },
          { rel: "stylesheet" },
        ],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/transaction/transaction.js" },
        ],
      },
    ],
  },
  addExpense: {
    pages: [["src/forms/addExpense/addExpense.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/forms/forms.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/forms/addExpense/addExpense.js" },
        ],
      },
    ],
  },
  addIncome: {
    pages: [["src/forms/addExpense/addIncome.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/forms/forms.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/forms/addExpense/addExpense.js" },
        ],
      },
    ],
  },
  addTransfer: {
    pages: [["src/forms/addExpense/addTransfer.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/forms/forms.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/forms/addExpense/addExpense.js" },
        ],
      },
    ],
  },
  addAccount: {
    pages: [["src/forms/addAccount/addAccount.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/forms/forms.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/forms/addAccount/addAccount.js" },
        ],
      },
    ],
  },
};
