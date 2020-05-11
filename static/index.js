document.addEventListener('DOMContentLoaded', () => {

  // Add event listener  to button click on small screen
  document.querySelector(".menu-btn").addEventListener('click', () => {
    // Add and remove class
    document.querySelector("#left").classList.toggle('show');
  });
});
