function dynamicDetailSection(ob) {
  let boxDiv = document.createElement("div");
  boxDiv.id = "box";
  boxDiv.onclick = function () {
    mainRoutes.productDetails = {
      ...mainRoutes?.productDetails,
      state: { data: ob },
    };
    loadPage("productDetails", "main-content");
  };

  let boxLink = document.createElement("div");
  // boxLink.href = "/product-detail?" + ob.id;
  let imgTag = document.createElement("img");
  if (ob?.preview) {
    imgTag.src = ob?.preview;
  }
  let detailsDiv = document.createElement("div");
  detailsDiv.id = "details";

  let h3 = document.createElement("h3");
  let h3Text = document.createTextNode(ob.name);
  h3.appendChild(h3Text);

  let h4 = document.createElement("h4");
  let h4Text = document.createTextNode(ob.brand);
  h4.appendChild(h4Text);

  let h2 = document.createElement("h2");
  let h2Text = document.createTextNode("rs  " + ob.price);
  h2.appendChild(h2Text);

  boxDiv.appendChild(boxLink);
  boxLink.appendChild(imgTag);
  boxLink.appendChild(detailsDiv);
  detailsDiv.appendChild(h3);
  detailsDiv.appendChild(h4);
  detailsDiv.appendChild(h2);

  return boxDiv;
}

async function productsListApi() {
  const productsArray = [];
  let mainContainer = document.getElementById("mainContainer");
  let containerClothing = document.getElementById("containerClothing");
  let containerAccessories = document.getElementById("containerAccessories");
  const SHEET_ID = "1X9MNBQpWpv8wlLJrmZ133TQ8REO9s1OHHiYS1_bzlvQ";
  const GID = "1144256468";
  const QUERY = `SELECT * `;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);
  const columns = [...res?.table?.cols];
  res?.table?.rows?.map((item) => {
    const productObj = {};
    columns?.map((header, i) => {
      if (header?.label === "photos" || header?.label === "size") {
        productObj[header?.label] = item?.c?.[i]?.v?.split(",");
      } else {
        productObj[header?.label] = item?.c?.[i]?.v;
      }
      return "";
    });
    productsArray?.push(productObj);
    return "";
  });
  for (let i = 0; i < productsArray?.length; i++) {
    if (productsArray?.[i].isAccessory) {
      containerAccessories.appendChild(
        dynamicDetailSection(productsArray?.[i])
      );
    } else {
      containerClothing.appendChild(dynamicDetailSection(productsArray?.[i]));
    }
  }
}

productsListApi();
