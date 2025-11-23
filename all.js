const orderInfoForm = document.querySelector(".orderInfo-form");
const title = document.querySelector(".title");
const productImg = document.querySelector('.productImg');
const category = document.querySelector(".category");
const originPrice = document.querySelector(".originPrice");
const price = document.querySelector('.nowPrice');
const productList = document.querySelector('.productWrap');
const cartList = document.querySelector(".cartList");
const delAllCartBtn = document.querySelector('.discardAllBtn');
const addCardBtn = document.querySelectorAll('.addCardBtn');
const orderInfoBtn = document.querySelector('.orderInfo-btn');
const productSelect = document.querySelector(".productSelect");
const cartTotal = document.querySelector(".cart-total");
const inputs = document.querySelectorAll("input[name]");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const customerTradeWay = document.querySelector("#tradeWay");

// 驗證規則
const constraints = {
  姓名: {
    presence: {
      message: "^必填",
    },
  },
  電話: {
    presence: {
      message: "^必填",
    },
    numericality: {
      message: "^電話格式不正確",
    },
  },
  Email: {
    presence: {
      message: "^必填",
    },
    email: {
      message: "^Email 格式不正確",
    },
  },
  寄送地址: {
    presence: {
      message: "^必填",
    },
  },
};

let products = []; 
let errors = validate(orderInfoForm,constraints);

//轉換成千分位
function NumberWithCommas(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function init() {
  // 1. 取得產品列表並渲染畫面
  getProduct();

  // 2. 取得購物車資料並渲染購物車內容
  getCart();

  // 4. 綁定加入購物車按鈕事件（使用事件委派）
  productList.addEventListener('click', function(e){
    e.preventDefault();

    // 確認點擊的是否為「加入購物車」按鈕
    if (!e.target.classList.contains('addCardBtn')) return;

    const productId = e.target.dataset.id;
    let cartNum = 1;

    function addCart(id,num) {
        let url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
        let data = {
            "data": {
            "productId": id,
            "quantity": 1
            }
        }
        axios.post(url, data)
        .then(function(res) {
        getCart();
        })
        .catch(function(error) {
        });
    }

    // 先取得現有購物車資料，若已有同商品則數量+1
    axios.get(`${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`)
      .then(res => {
        const cartData = res.data.carts;
        cartData.forEach(item => {
          if(item.product.id === productId){
            cartNum = item.quantity + 1;
          }
        });
        addCart(productId, cartNum);
        Toast.fire({
          icon: "success",
          title: "已加入購物車"
        });
      });
  });

  console.log("✅ 初始化完成，產品與購物車已渲染");
}

// 🔹 呼叫初始化函式
init();

// 2-1. 取資料 get：取得產品列表
function getProduct(){
  let url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/products`;
  
  axios.get(url)
    .then(function(res){
      products = res.data.products;
      renderProduct(products);
      
    })
    .catch(function(error){
      console.log(error);
    })
}

function renderProduct(dataList) {
  let str = "";
  dataList.forEach(item => {
    str += `
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="${item.title}">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
      </li>
    
    `;
  });
  productList.innerHTML = str; 

    // 9. 加上刪除按鈕的操作
  let alldelSingleBtn = document.querySelectorAll('.delSingleBtn');
  alldelSingleBtn.forEach(function(item){
    item.addEventListener('click', function(e){
      e.preventDefault();
      delSingleCart(e.target.dataset.id);
    });
});
  
  

 // 🔹 監聽「刪除單筆」按鈕
  const delSingleBtns = document.querySelectorAll('.delSingleBtn');
  delSingleBtns.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      delSingleCart(e.target.dataset.id);
    });
  });
}

async function getCart() {
  try {
    const url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
    const response = await axios.get(url);
    cartTotal.textContent = NumberWithCommas(response.data.finalTotal);
    cartData = response.data.carts;
    renderCart(cartData);
  } catch (error) {
    Toast.fire({
      icon: "error",
      title: error.response.data.message || "無法取得購物車資料",
    });
  }
}

function renderCart(cartData) {
  let str = '';
  cartData.forEach(item => {
    str += `               
            <tr>
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${NumberWithCommas(item.product.price)}</td>
                <td>
                <button type="button" class="plusCartBtn" data-id ="${item.id}" data-num=${item.quantity + 1}><span class="material-symbols-outlined"> add </span></button>
                <span class="quantity">${item.quantity}</span>
                <button type="button" class="subCartBtn" data-id ="${item.id}" data-num=${item.quantity - 1}><span class="material-symbols-outlined">remove</span></button>
                </td>
                <td>
                NT$${NumberWithCommas(item.quantity * item.product.price)}
                </td>
                <td class="discardBtn">
                    <a href="#" class="material-icons delOneProduct" data-id ="${item.id}">
                        clear
                    </a>
                </td>
            </tr>`
  });
  

  let alldelSingleBtn = document.querySelectorAll('.discardBtn');
  alldelSingleBtn.forEach(function(item) {
    item.addEventListener('click', function(e){
      e.preventDefault();
      delSingleCart(e.target.dataset.id);
    })
  })
//點擊加入購物車
    productList.addEventListener('click', e => {
        e.preventDefault();
        if(!e.target.classList.contains('addCardBtn')) {
            return;
        }
        let productId = e.target.getAttribute('data-id');
        let cartNum = 1;
        cartData.forEach(item => {
            if(item.product.id === productId){
                cartNum = item.quantity += 1;
            }
        })
        // addCart(productId,cartNum);
        Toast.fire({
            icon: "success",
            title: "已加入購物車"
        });
    })
    function addCart(id,num) {
        let url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
        let data = {
            "data": {
            "productId": id,
            "quantity": 1
            }
        }
        axios.post(url, data)
        .then(function(res) {
        getCart();
        })
        .catch(function(error) {
        });
    }
    //刪除全部
}
delAllCartBtn.addEventListener('click', delAllCart);
function delAllCart() {
  let url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`
  axios.delete(url)
  .then(function(res) {
    getCart();
    setTimeout(function() {
      alert('成功刪除購物車內商品'); },1000);
    })
  .catch(function(error) {
    console.log(error);
  })
}

// 9. 刪除功能製作
function delSingleCart(id){
  let url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts/${id}`;
  axios.delete(url)
    .then(function(res){
      getCart();
      Toast.fire({
        icon: "success",
        title: "成功刪除購物車商品",
      });
      setTimeout(function(){ alert("成功刪除此筆訂單"); }, 1000);
    })
    .catch(function(error){
      Toast.fire({
        icon: "error",
        title: error.response.data.message || "無法刪除商品",
      });
    }) 
}

//送出訂單
orderInfoBtn.addEventListener("click", summitOrder);

async function summitOrder(e) {
  e.preventDefault();

  //購物車沒有商品
  if(cartData.length ===0) {
    Toast.fire({
      icon: "warning",
      title: "請將商品加入購物車",
    });
    return;
  }
    //表單驗證
    errors = validate(orderInfoForm,constraints);
    if (errors) return;

    const name = customerName.value.trim();
    const tel = customerPhone.value.trim();
    const email = customerEmail.value.trim();
    const address = customerAddress.value.trim();
    const payment = customerTradeWay.value;

    orderInfoBtn.classList.add("disabled");
    //送出請求

    try {
      const url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/orders`;
      const data = {
        data: {
          user: {
            name,
            tel,
            email,
            address,
            payment,
          },
        },
      };
      const response = await axios.post(url,data);

      Toast.fire({
        icon: "success",
        title: "訂單建立成功",
      });
      orderInfoBtn.classList.remove("disabled");
      getCart();
      orderInfoForm.reset();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error.response.data.message || "訂單建立失敗",
      });
      orderInfoBtn.classList.remove("disabled");
    }
}

//篩選產品列表

productSelect.addEventListener("click", filterProducts);

function filterProducts(e) {
  const category = e.target.value;
  let filterData = [];

  if(category === "全部") {
    filterData = products;
  } else {
    filterData = products.filter((product) => product.category === category);
  }
  renderProduct(filterData);
}

//修改購物車商品數量
cartList.addEventListener("click",(e) => {
  const btn = e.target.closest(".plusCartBtn, .subCartBtn");
  if(!btn) return ;

  const id = btn.dataset.id;
  const num = Number(btn.dataset.num);
  editCartNum(num,id);
})

async function editCartNum(num,id) {
  if (num < 1){
    delSingleCart(id);
    return;
  }
    try {
      const url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
      const data = {
        data: {
          id,
          quantity: num,
        },
      };
      await axios.patch(url,data);
      getCart();
    } catch(error) {
      Toast.fire({
        icon: "error",
        title: error.response?.data?.message || "無法修改購物車數量",
      });
    } 
}
