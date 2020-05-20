document.addEventListener("DOMContentLoaded", () => {

  // Check name of user then send to chatting room
  showName();

  // Add event listener  to button click on small screen
  document.querySelector(".menu-btn").addEventListener("click", () => {
    // Add and remove class
    document.querySelector(".chat-sidebar").classList.toggle("show");
  });
});

function showName() {
   /*
    When page loadeded check username if not exist asked user for
    his or she name and choose chatting room to join, else join he
    or she to last channel exist in localStorage
   */

   // Select DOM
   const nameShow = document.querySelector('#username-show');
   const modal = document.querySelector('#modal');
   const usernameEntry = document.querySelector('#username');
   const room = document.querySelector('#room');

  if (!localStorage.getItem('username')) {
    // show modal
    modal.style.display = 'block';
    modal.style.opacity = 1;

    // listen to submit of name and room choose form
    document.querySelector('#join-form').onsubmit = (e) => {

      // Store username and room in localStorage and send user to room chat
      const user = {
        username: usernameEntry.value,
        room: room.value
      }
      localStorage.setItem('username', JSON.stringify(user));
      modal.style.opacity = 0;
      modal.style.display = 'none';
      nameShow.innerHTML = usernameEntry.value;

      // Run Join Room function
      // joinRoom(room.value);

      // Prevent form submit
      e.preventDefault();
    };
  } else {
    const user = JSON.parse(localStorage.getItem('username'));
    nameShow.innerHTML = user.username;
    console.log(user.room);
    // Run Join Room function
    // joinRoom(room.value);
  }
}

// function for enter key
// const msg = document.querySelector('#message-input');
// msg.addEventListener('keyup', e => {
//   e.preventDefault();
//   if(e.keyCode === 13){
//     document.querySelector('.form-submit');
//   }
// })
