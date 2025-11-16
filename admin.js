const orderList = document.querySelector(".orderList");
const sectionTitle = document.querySelector(".section-title");
const changeChartBtn = document.querySelector(".changeChartBtn");
const discardAllBtn = document.querySelector(".discardAllBtn");

const baseUrl = "https://livejs-api.hexschool.io";
const apiPath = "sam60320" ; 

let orderData = [];
let chartContentType = "全品項";

//取得訂單資料

async function getOrderData() {
    try {
        const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`;
        const response = await axios.get(url,config);
        orderData = response.data.orders;
        renderOrderList(orderData);
        renderC3();

    } catch (error) {
        Toast.fire({
            icon: "error",
            title: error.response.data.message || "無法取得訂單資料",
        });
    }
}

//渲染C3圖表
function renderC3() {

    let total = [];
    let newData = [];

    //全品項資料
    if(chartContentType === "全品項") {
        orderData.forEach((order) => {
            order.products.forEach((product) => {
                if(!total[product.title]) {
                    total[product.title] = product.price * product.quantity;
                } else {
                    total[product.title] += product.price * product.quantity;
                }
            });
        });

        newData = Object.entries(total);
        newData.sort((a,b) => b[1] - a[1]);

        if(newData.length > 3) {
            let orderTotal = 0;
            newData.forEach((item,index) => {
                orderTotal += newData[index][1];
            });
            newData.splice(3);
            newData.push(["其他",orderTotal]);
        }

        //全產品類別資料

    } else if (chartContentType === "全產品類別") {
        orderData.forEach((order) => {
            order.products.forEach((product) => {
                if(!total[product.category]) {
                    total[product.category] = product.price * product.quantity;
                } else {
                    total[product.category] += product.price * product.quantity;
                }
            });
        });

        newData = Object.entries(total);
    }
    
    //C3 圖表

    const chart = renderC3.generate({
        bindto: "#chart", //元素綁定
        data: {
            type: "pie",
            columns: newData,
        },
        color: {
            pattern: ["#DACBFF","#9D7FEA","#5434A7","#301E5F"],
        },
    });
}

//圖表切換
changeChartBtn.addEventListener("click",(e) => {
    if (chartContentType === "全品項") {
        chartContentType = "全產品類別";
        sectionTitle.textContent = `${chartContentType}營收比重`;
    } else if (chartContentType === "全產品類別") {
        chartContentType = "全品項" ;
        sectionTitle.textContent = `${chartContentType}營收比重`;
    }
    renderC3();
});

//渲染訂單列表

function renderOrderList(orders) {
    let str = "";
    orders.forEach((order) => {
        //時間字串
        const timeStamp = new Date(order.createdAt * 1000);
        const orderTime = `${timeStamp.getFullYear()} / ${timeStamp.getMonth() + 1} / ${timeStamp.getDate()}`;

        //訂單列表

         str += `<tr>
        <td>${order.id}</td>
        <td>
          <p>${order.user.name}</p>
          <p>${order.user.tel}</p>
        </td>
        <td>${order.user.address}</td>
        <td>${order.user.email}</td>
        <td>
          ${order.products
            .map((item) => `<p>${item.title} x ${item.quantity}</p>`)
            .join("")}
        </td>
        <td>${orderTime}</td>
        <td class="orderStatus">
          <a href="#" class="orderStatusBtn ${
            order.paid ? "" : "active"
          }" data-id=${order.id} data-status=${order.paid}>${
      order.paid ? "已處理" : "未處理"
    }</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" data-id=${
            order.id
          } value="刪除" />
        </td>
      </tr>`;
    });
    orderList.innerHTML = str; 
}

//修改訂單

orderList.addEventListener("click",(e) => {
    e.preventDefault();

    const delOrderBtn = e.target.closest(".delSingleOrder-Btn");
    const orderStatusBtn = e.target.closest(".orderStatusBtn");
    const id = e.target.dataset.id;

    if(delOrderBtn && orderList.contains(delOrderBtn)) {
        deleteOrderItem(id);
    } else if(orderStatusBtn && orderList.contains(orderStatusBtn)) {
        const status = e.target.status;
        changeOrderStatus(status,id);
    }
});

//刪除訂單
async function deleteOrderItem(id) {
    try {
        const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders/${id}`;
        const response = await axios.delete(url,config);
        Toast.fire({
            icon: "success",
            title: "成功刪除訂單",

        });
        getOrderData();

    } catch (error) {
        Toast.fire({
            icon: "error",
            title: error.response.data.message || "無法刪除訂單",
        });
    }
}

async function changeOrderStatus(status,id) {
    try {
        const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`;
        const isPaid = status === "true";
        
        const data = {
            data: {
                id,
                paid: !isPaid,
            },
        };
        const response = await axios.put(url,data,config);

        Toast.fire({
            icon: "success",
            title: "成功修改訂單狀態",
        });
        getOrderData();

    } catch (error) {
        Toast.fire({
            icon: "error",
            title: error.response.data.message || "無法修改訂單狀態",
        });
    }
}

//刪除所有訂單

discardAllBtn.addEventListener("click",deleteAllOrder);

async function deleteAllOrder(e) {
    e.preventDefault();

    try {
        const url = `${baseUrl}/api/livejs/v1/admin/${apiPath}/orders`;
        const response = await axios.delete(url,config);
        Toast.fire({
            icon: "success",
            title: "成功刪除所有訂單",
        });
        getOrderData();
    } catch (error) {
        Toast.fire({
            icon: "error",
            title: error.response.data.message || "無法刪除訂單",
        });
    }
}


function init() {
    getOrderData();
}
init();