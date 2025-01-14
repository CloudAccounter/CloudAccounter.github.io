let data = mainRoutes?.productDetails?.state?.data;
let id = data?.id;

// if (document.cookie.indexOf(",counter=") >= 0) {
//   let counter = document.cookie.split(",")[1].split("=")[1];
//   document.getElementById("badge").innerHTML = counter;
// }

function dynamicContentDetails(ob) {
  console.log("===ob", ob);
  let mainContainer = document.createElement("div");
  mainContainer.id = "containerD";
  document.getElementById("containerProduct").appendChild(mainContainer);

  let imageSectionDiv = document.createElement("div");
  imageSectionDiv.id = "imageSection";

  let imgTag = document.createElement("img");
  imgTag.id = "imgDetails";
  //imgTag.id = ob.photos
  imgTag.src = ob.preview;

  imageSectionDiv.appendChild(imgTag);

  let productDetailsDiv = document.createElement("div");
  productDetailsDiv.id = "productDetails";

  let h1 = document.createElement("h1");
  let h1Text = document.createTextNode(ob.name);
  h1.appendChild(h1Text);

  let h4 = document.createElement("h4");
  let h4Text = document.createTextNode(ob.brand);
  h4.appendChild(h4Text);

  let detailsDiv = document.createElement("div");
  detailsDiv.id = "details";

  let h3DetailsDiv = document.createElement("h3");
  let h3DetailsText = document.createTextNode("Rs " + ob.price);
  h3DetailsDiv.appendChild(h3DetailsText);

  let h3 = document.createElement("h3");
  let h3Text = document.createTextNode("Description");
  h3.appendChild(h3Text);

  let para = document.createElement("p");
  let paraText = document.createTextNode(ob.description);
  para.appendChild(paraText);

  let productPreviewDiv = document.createElement("div");
  productPreviewDiv.id = "productPreview";

  let h3ProductPreviewDiv = document.createElement("h3");
  let h3ProductPreviewText = document.createTextNode("Product Preview");
  h3ProductPreviewDiv.appendChild(h3ProductPreviewText);
  productPreviewDiv.appendChild(h3ProductPreviewDiv);

  let i;
  for (i = 0; i < ob.photos.length; i++) {
    let imgTagProductPreviewDiv = document.createElement("img");
    imgTagProductPreviewDiv.id = "previewImg";
    imgTagProductPreviewDiv.src = ob.photos[i];
    imgTagProductPreviewDiv.onclick = function (event) {
      imgTag.src = ob.photos[i];
      document.getElementById("imgDetails").src = this.src;
    };
    productPreviewDiv.appendChild(imgTagProductPreviewDiv);
  }

  let buttonDiv = document.createElement("div");
  buttonDiv.id = "button";

  let buttonTag = document.createElement("button");
  buttonDiv.appendChild(buttonTag);

  buttonText = document.createTextNode("Add to Cart");
  buttonTag.onclick = function () {
    let order = id + " ";
    let counter = 1;
    if (document.cookie.indexOf(",counter=") >= 0) {
      order = id + " " + document.cookie.split(",")[0].split("=")[1];
      counter = Number(document.cookie.split(",")[1].split("=")[1]) + 1;
    }
    document.cookie = "orderId=" + order + ",counter=" + counter;
    document.getElementById("badge").innerHTML = counter;
  };
  buttonTag.appendChild(buttonText);

  mainContainer.appendChild(imageSectionDiv);
  mainContainer.appendChild(productDetailsDiv);
  productDetailsDiv.appendChild(h1);
  productDetailsDiv.appendChild(h4);
  productDetailsDiv.appendChild(detailsDiv);
  detailsDiv.appendChild(h3DetailsDiv);
  detailsDiv.appendChild(h3);
  detailsDiv.appendChild(para);
  productDetailsDiv.appendChild(productPreviewDiv);

  productDetailsDiv.appendChild(buttonDiv);

  return mainContainer;
}

// BACKEND CALLING

const productsArray = [];
async function productsListApi() {
  const SHEET_ID = "1X9MNBQpWpv8wlLJrmZ133TQ8REO9s1OHHiYS1_bzlvQ";
  const GID = "1144256468";
  const QUERY = `SELECT * WHERE A=${id}`;
  const res = await readGsheetData(SHEET_ID, GID, QUERY);
  const columns = [...res?.table?.cols];
  res?.table?.rows?.map((item) => {
    const productObj = {};
    columns?.map((header, i) => {
      if (header?.label === "photos") {
        productObj[header?.label] = [
          data?.preview,
          ...item?.c?.[i]?.v?.split(","),
        ];
      } else if (header?.label === "size") {
        productObj[header?.label] = item?.c?.[i]?.v?.split(",");
      } else {
        productObj[header?.label] = item?.c?.[i]?.v;
      }
      return "";
    });
    productsArray?.push(productObj);
    return "";
  });
  dynamicContentDetails(productsArray?.[0]);
}

productsListApi();
