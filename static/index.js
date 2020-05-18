document.addEventListener('DOMContentLoaded', () => {
  // Check name of customer
  showName();

  // Connect to websocket
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // When connected, Listen to form creation submit
  socket.on('connect', () => {
    // Creating New Channel
    document.querySelector("#channelCreation").onsubmit = () => {
      // Emit the channel creation event using the input from User
      const channelName = document.querySelector("#new-channel").value;
      socket.emit("new_channel", channelName);
      console.log(channelName)
      // Prevent Form Submission
      return false;
    };
  });

  socket.on("channel list", data => {
    if(data.success){
      let output= '';
      data.channels.forEach(channel => {
        output += `<button>${channel}</button>`
      });
      document.querySelector("#left .drop-contents").innerHTML = output;
    } else {
      document.querySelector("#left b.text-danger").innerHTML = data.error;
      document.querySelector("#left b.text-danger").style.display = "block";
      console.log(data.error)
      setTimeout(() => {
        document.querySelector("#left b.text-danger").style.display = "none";
      },3000);
    }
  });


  // Add event listener  to button click on small screen
  document.querySelector(".menu-btn").addEventListener('click', () => {
    // Add and remove class
    document.querySelector("#left").classList.toggle('show');
  });
});

// Function name
function showName() {
  // Select DOM
  const name = document.querySelector("#name");

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
     document.querySelector("#modal").style.opacity = 0;
     document.querySelector("#modal").style.display = "none";
     document.querySelector("#left p.mt-2 strong").innerHTML = localStorage.getItem("username");
     return false;
   }
  } else {
    document.querySelector("#left p.mt-2 strong").innerHTML = localStorage.getItem("username");
  }
}
