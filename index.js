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
  expense: {
    pages: [["src/expense/expense.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/expense/expense.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [{ type: "text/javascript" }, { src: "src/expense/expense.js" }],
      },
    ],
  },
};

let pageHistory = []; // Initialize an empty history stack

async function loadPage(page, id, state) {
  if (mainRoutes?.[page]?.pages) {
    try {
      // Push the current page onto the history stack before loading the new page
      if (pageHistory[pageHistory.length - 1] !== page) {
        pageHistory.push(page);
      }
      localStorage.setItem("lastPage", page); // Save the current page
      // Clear previously loaded dynamic resources
      removeDynamicResources();
      // Fetch HTML content for the new page
      mainRoutes?.[page]?.pages?.forEach((ref) =>
        loadContent(ref?.[0], ref?.[1] || id)
      );

      // Dynamically load new styles and scripts
      mainRoutes?.[page]?.head?.forEach((ref) => loadToHead(ref));
      mainRoutes?.[page]?.tail?.forEach((ref) => loadToTail(ref));
    } catch (error) {
      document.getElementById(
        ref?.[1] || id
      ).innerText = `Error: ${error.message}`;
      console.error(error);
    }
  } else {
    loadContent("", id);
  }
}

async function loadHtmlBehind(url, id) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  const html = await response.text();
  document.getElementById(id).innerHTML = html;
}

function loadContent(url, id) {
  if (url) {
    req = new XMLHttpRequest();
    req.open("GET", url, false);
    req.send(null);
    document.getElementById(id).innerHTML = req.responseText;
  } else {
    document.getElementById(id).innerHTML = "";
  }
}

function loadToHead(ref) {
  const tag = document.createElement(`${ref?.tag}`);
  ref?.props?.map((prop) => {
    tag[Object.keys(prop)?.[0]] = prop[Object.keys(prop)?.[0]];
  });
  tag.setAttribute("data-dynamic", "true"); // Mark as dynamic
  document.head.appendChild(tag);
}

function loadToTail(ref) {
  const tag = document.createElement(`${ref?.tag}`);
  ref?.props?.map((prop) => {
    tag[Object.keys(prop)?.[0]] = prop[Object.keys(prop)?.[0]];
  });
  tag.setAttribute("data-dynamic", "true"); // Mark as dynamic
  document.body.appendChild(tag);
}

// Function to remove all dynamically loaded resources
function removeDynamicResources() {
  // Remove dynamic styles
  document.querySelectorAll('link[data-dynamic="true"]').forEach((link) => {
    link.parentNode.removeChild(link);
  });

  // Remove dynamic scripts
  document.querySelectorAll('script[data-dynamic="true"]').forEach((script) => {
    script.parentNode.removeChild(script);
  });
}

function loginCheck() {
  const storedData = localStorage.getItem("user");
  const userObject = storedData ? JSON.parse(storedData) : {};
  if (!userObject?.id) {
    localStorage.removeItem("user");
    loadPage("login");
  } else {
    const lastPage = localStorage.getItem("lastPage") || "expense"; // Default to 'expense'
    if (mainRoutes?.[lastPage]) {
      if (lastPage === "login") {
        loadPage("expense"); // Fallback if lastPage is invalid
      } else {
        loadPage(lastPage);
      }
    } else {
      loadPage("expense"); // Fallback if lastPage is invalid
    }
  }
}

loginCheck();

function logOutCheck() {
  const storedData = localStorage.getItem("user");
  const userObject = storedData ? JSON.parse(storedData) : {};
  if (!userObject?.id) {
    localStorage.removeItem("user");
    loadPage("login");
  }
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("lastPage"); // Clear last page data
  loadPage("login", "main-content");
}

function goBack() {
  if (pageHistory.length > 1) {
    pageHistory.pop(); // Remove the current page
    const previousPage = pageHistory.pop(); // Get the previous page
    if (mainRoutes?.[previousPage]) {
      loadPage(previousPage, "main-content");
    } else {
      loadPage("expense", "main-content"); // Fallback if the previous page is invalid
    }
  } else {
    console.log("No previous page in history.");
  }
}

function toggleDropdown() {
  const dropdown = document.getElementById("dropdown");
  dropdown.classList.toggle("active");
}

// Optional: Close the dropdown when clicking outside
document.addEventListener("click", function (event) {
  const button = document.querySelector(".options-button");
  const dropdown = document.getElementById("dropdown");
  if (!button.contains(event.target)) {
    dropdown.classList.remove("active");
  }
});
