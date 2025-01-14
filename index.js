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
  products: {
    pages: [
      ["src/products/products.html", "main-content"],
      ["src/slider/slider.html", 2],
      ["src/content/content.html", 3],
      ["src/footer/footer.html", 4],
    ],
    head: [
      {
        tag: "link",
        props: [{ href: "src/products/products.css" }, { rel: "stylesheet" }],
      },
      {
        tag: "link",
        props: [{ href: "src/header/header.css" }, { rel: "stylesheet" }],
      },
      {
        tag: "link",
        props: [{ href: "src/footer/footer.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/products/products.js" },
        ],
      },
      {
        tag: "script",
        props: [{ type: "text/javascript" }, { src: "src/slider/slider.js" }],
      },
      {
        tag: "script",
        props: [{ type: "text/javascript" }, { src: "src/content/content.js" }],
      },
    ],
  },
  productDetails: {
    pages: [["src/product-details/product-details.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [
          { href: "src/product-details/product-details.css" },
          { rel: "stylesheet" },
        ],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [
          { type: "text/javascript" },
          { src: "src/product-details/product-details.js" },
        ],
      },
    ],
    state: {},
  },
  cart: {
    pages: [["src/cart/cart.html", "main-content"]],
    head: [
      {
        tag: "link",
        props: [{ href: "src/cart/cart.css" }, { rel: "stylesheet" }],
      },
    ],
    tail: [
      {
        tag: "script",
        props: [{ type: "text/javascript" }, { src: "src/cart/cart.js" }],
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
      document.getElementById(ref?.[1] || id).innerText = `Error: ${error.message}`;
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
    loadPage("products");
    // loadPage("login");
  } else {
    const lastPage = localStorage.getItem("lastPage") || "products"; // Default to 'products'
    if (mainRoutes?.[lastPage]) {
      if (lastPage === "login") {
        loadPage("products"); // Fallback if lastPage is invalid
      } else {
        loadPage(lastPage);
      }
    } else {
      loadPage("products"); // Fallback if lastPage is invalid
    }
  }
}


loginCheck();

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
      loadPage("products", "main-content"); // Fallback if the previous page is invalid
    }
  } else {
    console.log("No previous page in history.");
  }
}
