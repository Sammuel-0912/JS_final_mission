const baseUrl = "https://livejs-api.hexschool.io";
const apiPath = "sam60320" ; 
const uid = "bp8rh3exsNXmyLDfzwRZamiVdH53";

const config = {
    headers: {
        Authorization: uid,
    }
};

// SweetAlert2 Toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  onOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});