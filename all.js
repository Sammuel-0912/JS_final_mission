const baseUrl = "https://livejs-api.hexschool.io";
const apiPath = "sam60320" ; 

const title = document.querySelector(".title");
const productImg = document.querySelector('.productImg');
const category = document.querySelector(".category");
const originPrice = document.querySelector(".originPrice");
const price = document.querySelector('.nowPrice');
const productList = document.querySelector('.productWrap');
const cartList = document.querySelector(".cartList");
const delAllCartBtn = document.querySelector('.discardAllBtn');
const addCardBtn = document.querySelectorAll('.addCardBtn');

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
})

let products = []; 

function init() {
  // 1. 取得產品列表並渲染畫面
  getProduct();

  // 2. 取得購物車資料並渲染購物車內容
  getCart();

  // 3. 綁定購物車刪除全部的按鈕事件
  delAllCartBtn.addEventListener('click', delAllCart);

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

  //監聽「加入購物車」按鈕事件（事件委派）
    let addCardBtn = document.querySelectorAll('.addCart');
    addCardBtn.forEach(function(item){
      item.addEventListener('click', function(e){
        addCart(e.target.dataset.id);
      });
  })
    // 9. 加上刪除按鈕的操作
  let alldelSingleBtn = document.querySelectorAll('.delSingleBtn');
  alldelSingleBtn.forEach(function(item){
    item.addEventListener('click', function(e){
      e.preventDefault();
      delSingleCart(e.target.dataset.id);
    });
});
  const cartList = document.querySelector('.cartList');
  cartList.innerHTML = str;

 // 🔹 監聽「刪除單筆」按鈕
  const delSingleBtns = document.querySelectorAll('.delSingleBtn');
  delSingleBtns.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      delSingleCart(e.target.dataset.id);
    });
  });
}

let data = [];
let url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/products`;
axios.get(url
)
  .then(function(res) {
   data = res.data.products;
   render(data); 
  })
  .catch(function() {
    console.log("發生錯誤"); 
  })
  .finally(function(){
    console.log(`資料回傳成功`); 
  })

// 4. 加入購物車（此解答固定數量為 1，沒有累加）
// function addCart(id){
//   let url = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
//   let data = {
//     "data":{
//       "productId": id,
//       "quantity": 1
//     }
//   }
//   axios.post(url, data)
//     .then(function(res){
//       getCart();
//     })
//     .catch(function(err){
//       console.log(err)
//     })
// }

function getCart() {
  axios.get(`${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`)
  .then(res => {
    renderCart(res.data.carts);
  })
  .catch(err => console.log('取得購物車失敗:',err));
}

function renderCart(cartData) {
    // if(cartData.length === 0) {
    //     cartList.innerHTML = '目前購物車沒有商品';
    //     discardAllBtn.classList.add('disabled');
    //     allPrice.textContent = totalPrice;
    //     return;
    // } else {
    //     discardAllBtn.classList.remove('disabled');
    // }
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
                <td>NT$${(item.product.price)}</td>
                <td><button type="button" class="minusEdit" data-id ="${item.id}">-</button>
                ${item.quantity}
                <button type="button" class="plusEdit" data-id ="${item.id}">+</button>
                </td>
                <td>NT$${(item.quantity * item.product.price)}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons delOneProduct" data-id ="${item.id}">
                        clear
                    </a>
                </td>
            </tr>`
  });
  cartList.innerHTML = str; 

  let alldelSingleBtn = document.querySelectorAll('.discardBtn');
  alldelSingleBtn.forEach(function(item) {
    item.addEventListener('click', function(e){
      e.preventDefault();
      delSingleCart(e.target.dataset.id);
    })
  })
let cartNumEdit = document.querySelectorAll('.cartAmount-icon');
cartNumEdit.forEach(function(item) {
    item.addEventListener('click', function(e){
      e.preventDefault();
      editCartNum(e.target.dataset.num, e.target.dataset.id);
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
      alert('成功刪除所有訂單'); },1000);
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
      setTimeout(function(){ alert("成功刪除此筆訂單"); }, 1000);
    })
    .catch(function(error){
      console.log(error);
    })

    
}