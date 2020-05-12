// Select DOM
const name = document.querySelector("#name");

document.addEventListener('DOMContentLoaded', () => {

  // When page is loaded check username if exist
  if (!localStorage.getItem("username")) {

    document.querySelector("#modal").style.display = "block";

    // By default, submit button is disabled
    document.querySelector('#submitUser').disabled = true;

    // Enable button only if there is text in the input field
    name.onkeyup = () => {
        if (name.value.length > 0) {
          document.querySelector('#submitUser').disabled = false;
        } else {
          document.querySelector('#submitUser').disabled = true;
        }
   };

   // listen when user submit Name
   document.querySelector("#userRegister").onsubmit = () => {
     localStorage.setItem("username", name.value);
     console.log(localStorage.getItem('username'))
     return false;
   }

  } else {
    document.querySelector("#left p.mt-2 strong").innerHTML = localStorage.getItem("username");
  }

  // Add event listener  to button click on small screen
  document.querySelector(".menu-btn").addEventListener('click', () => {
    // Add and remove class
    document.querySelector("#left").classList.toggle('show');
  });
});
