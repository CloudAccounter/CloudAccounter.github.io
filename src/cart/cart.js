console.clear();

// if (document.cookie.indexOf(",counter=") >= 0) {
//   let counter = document.cookie.split(",")[1].split("=")[1];
//   document.getElementById("badge").innerHTML = counter;
// }

let cartContainer = document.getElementById("cartContainer");

let boxContainerDiv = document.createElement("div");
boxContainerDiv.id = "boxContainer";

// DYNAMIC CODE TO SHOW THE SELECTED ITEMS IN YOUR CART
function dynamicCartSection(ob) {
  let boxDiv = document.createElement("div");
  boxDiv.id = "box";
  boxContainerDiv.appendChild(boxDiv);

  let boxImg = document.createElement("img");
  boxImg.src = ob.preview;
  boxDiv.appendChild(boxImg);

  let boxh3 = document.createElement("h3");
  let h3Text = document.createTextNode(ob.name + " × " + ob.QUANTITY);
  // let h3Text = document.createTextNode(ob.name)
  boxh3.appendChild(h3Text);
  boxDiv.appendChild(boxh3);

  let boxh4 = document.createElement("h4");
  let h4Text = document.createTextNode("Price: Rs " + ob.PRICE);
  boxh4.appendChild(h4Text);
  boxDiv.appendChild(boxh4);

  // let boxh5 = document.createElement("h4");
  // let h5Text = document.createTextNode("Total: Rs " + Number(ob.QUANTITY) * Number(ob.PRICE));
  // boxh5.appendChild(h5Text);
  // boxDiv.appendChild(boxh5);

  buttonLink.appendChild(buttonText);
  cartContainer.appendChild(boxContainerDiv);
  cartContainer.appendChild(totalContainerDiv);
  // let cartMain = document.createElement('div')
  // cartmain.id = 'cartMainContainer'
  // cartMain.appendChild(totalContainerDiv)

  return cartContainer;
}

let totalContainerDiv = document.createElement("div");
totalContainerDiv.id = "totalContainer";

let totalDiv = document.createElement("div");
totalDiv.id = "total";
totalContainerDiv.appendChild(totalDiv);

let totalh2 = document.createElement("h2");
let h2Text = document.createTextNode("Total Amount");
totalh2.appendChild(h2Text);
totalDiv.appendChild(totalh2);

// TO UPDATE THE TOTAL AMOUNT
// function amountUpdate(amount) {
//   let totalh4 = document.createElement("h4");
//   // let totalh4Text = document.createTextNode(amount)
//   let totalh4Text = document.createTextNode("Amount: Rs " + amount);
//   totalh4Text.id = "toth4";
//   totalh4.appendChild(totalh4Text);
//   totalDiv.appendChild(totalh4);
//   totalDiv.appendChild(buttonDiv);
//   console.log(totalh4);
// }

let buttonDiv = document.createElement("div");
buttonDiv.id = "button";
totalDiv.appendChild(buttonDiv);

let buttonTag = document.createElement("button");
buttonDiv.appendChild(buttonTag);

let buttonLink = document.createElement("a");
// buttonLink.href = "/orderPlaced.html?";
buttonTag.appendChild(buttonLink);

buttonText = document.createTextNode("Place Order");
buttonTag.onclick = function () {
  console.log("clicked");
};
//dynamicCartSection()
// console.log(dynamicCartSection());

// BACKEND CALL
let orderList = [];
async function getOrdersList() {
  const SHEET_ID = "1X9MNBQpWpv8wlLJrmZ133TQ8REO9s1OHHiYS1_bzlvQ";
  const GID = "118662811";
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
    });
    orderList?.push(productObj);
    return "";
  });
  console.log("===orderList", orderList);
  orderList?.map((ob) => {
    dynamicCartSection(ob);
  });
  //   if (this.readyState === 4) {
  //     if (this.status == 200) {
  // console.log('call successful');
  //   contentTitle = JSON.parse(this.responseText);

  //   let counter = Number(document.cookie.split(",")[1].split("=")[1]);
  //   document.getElementById("totalItem").innerHTML = "Total Items: " + counter;

  //   let item = document.cookie.split(",")[0].split("=")[1].split(" ");
  //   console.log(counter);
  //   console.log(item);

  //   let i;
  //   let totalAmount = 0;
  //   for (i = 0; i < counter; i++) {
  //     let itemCounter = 1;
  //     for (let j = i + 1; j < counter; j++) {
  //       if (Number(item[j]) == Number(item[i])) {
  //         itemCounter += 1;
  //       }
  //     }
  //     totalAmount += Number(contentTitle[item[i] - 1].price) * itemCounter;
  const ob = {
    id: 1,
    name: "Honey",
    preview:
      "https://drive.google.com/thumbnail?id=15t2LzyeH7qfLET3kkfQ59Y7HWxX6jCOz&sz=s4000",
    photos: [
      "https://drive.google.com/thumbnail?id=15t2LzyeH7qfLET3kkfQ59Y7HWxX6jCOz&sz=s4000",
      "https://drive.google.com/thumbnail?id=15IY-tlM8SVDg_kOUE4o_wSKHkojcxGFx&sz=s4000",
      "https://drive.google.com/thumbnail?id=15Ah9ONS5T5mayyqMXI5CbHwamwEqDrBw&sz=s4000",
      "https://drive.google.com/thumbnail?id=1g2XA5uCIEuRRZHR2iLXdxWXDXjnYjv__&sz=s4000",
      "https://drive.google.com/thumbnail?id=1n5wI2iRw8u5AuCBhP-dlFRR5JtCfp0yI&sz=s4000",
    ],
    description: "Honey",
    size: ["1", " 1", " 0", " 1", " 0"],
    isAccessory: false,
    brand: "1lr",
    price: 450,
  };

  //   }
  //       amountUpdate(totalAmount);
  //     }
  //   } else {
  //     console.log("call failed!");
  //   }
}

getOrdersList();
