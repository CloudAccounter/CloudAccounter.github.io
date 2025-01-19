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
