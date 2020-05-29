document.addEventListener("DOMContentLoaded", () => {
  // Select DOM
  const nameShow = document.querySelector('#username-show');
  const modal = document.querySelector('#modal');
  const usernameEntry = document.querySelector('#username');
  const roomSelect = document.querySelector('#room');
  const chatMessage = document.querySelector('#chat-messages');
  const inputMessage = document.querySelector('#msg');
  const roomName = document.querySelector('#room-name');
  let room;
  let user = JSON.parse(localStorage.getItem('user'));
  let name;

  // Listen to button click on small screen to toggle class "show"
  document.querySelector(".menu-btn").addEventListener("click", () => {
    document.querySelector(".chat-sidebar").classList.toggle("show");
    console.log('cilck')
  });


  // Connect to websocket
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  // When connected, check username localstorage and Join Room
  socket.on('connect', () => {

    // Check if username is exist in localstorage
    if (!localStorage.getItem('user')) {
      showName();
    } else {
      name = user.username;
      room = user.room;
      nameShow.innerHTML = name;
      joinRoom(name, room);
    }
  });

  // Display message
  socket.on('message', data => {
    if (data.username === user.username) {
      const div = document.createElement("div");
      div.classList.add("message-mine");
      div.innerHTML = `<p class="message-name">${data.username} <span>${data.time}</span></p>
      <p class="text">${data.msg}</p>
      `;
      chatMessage.append(div);
    } else if (typeof data.username !== 'undefined'){
      const div = document.createElement("div");
      div.classList.add("message");
      div.innerHTML = `<p class="message-name">${data.username} <span>${data.time}</span></p>
      <p class="text">${data.msg}</p>
      `;
      chatMessage.append(div);
    } else {
      printMsg(data.msg, data.error);
    }

    chatMessage.scrollTop = chatMessage.scrollHeight;
  });


  // Listen to event for login out
  document.querySelector(".chat-header .btn").addEventListener("click", (e) => {

    leaveRoom(user.username, user.room);
    localStorage.clear();
    setTimeout(showName, 50);
    e.preventDefault();
  });

  // Listen to send message event
  document.querySelector('#chat-form').onsubmit = e => {
    socket.send({'username': user.username, 'msg': inputMessage.value, 'room': room});
    inputMessage.value = '';
    inputMessage.focus();
    e.preventDefault();
  }

  // Listen to submit button to emit a "new room" event
  document.querySelector("#new-channel").onclick = () => {
    user = JSON.parse(localStorage.getItem('user'));
    const channelName = document.querySelector("#channel-name");
    socket.emit("new room", {'username': user.username, 'new_room' : channelName.value});
    channelName.value = "";
  };

  // function for enter key
  document.querySelector('#channel-name').addEventListener('keyup', e => {
    e.preventDefault();
    if(e.keyCode === 13){
      document.querySelector('#new-channel').click();
    }
  });

  // When a new room is announced,check add to the unordered list
  socket.on("create room", (data) => {

    // If response success the add new room to list else print error
    if (data.success) {
      const li = document.createElement('li');
      li.classList.add("select-room");
      li.innerHTML = data.room;
      document.querySelector('#rooms').append(li);
      const opt = document.createElement('option');
      opt.value = data.room;
      opt.innerHTML = data.room;
      document.querySelector('#room').append(opt);
    } else {
      const error = "error-msg";
      printMsg(data.error, error);
    }
  });


  // join my own room create
  socket.on('join room', data => {
    const name = user.username;
    leaveRoom(name, room);
    const createRoom = data.room;
    joinRoom(name, createRoom);
    room = createRoom;
    const userUpdate = {
      username: name,
      room: createRoom
    }
   localStorage.setItem('user',JSON.stringify(userUpdate));
  })

  // Room Selection
  document.querySelector("#rooms").addEventListener("click", (e) => {
    if (e.target && e.target.matches("li.select-room")) {
       let newRoom = e.target.innerHTML;
       if (newRoom === room){
         const msg = `You are already in ${room} room`;
         const error = "error-msg";
         printMsg(msg, error);
       } else {
         leaveRoom(user.username, room);
         joinRoom(user.username, newRoom);
         room = newRoom;
         const userUpdate = {
           username: name,
           room: newRoom
         }
        localStorage.setItem('user',JSON.stringify(userUpdate));
       }
    }
  });

  // Display pervious messages
  socket.on("my event", messages => {
    messages.forEach((data) => {
      if (data.username === user.username) {
        const div = document.createElement("div");
        div.classList.add("message-mine");
        div.innerHTML = `<p class="message-name">${data.username} <span>${data.time}</span></p>
        <p class="text">${data.msg}</p>
        `;
        chatMessage.append(div);
      } else if (typeof data.username !== 'undefined'){
        const div = document.createElement("div");
        div.classList.add("message");
        div.innerHTML = `<p class="message-name">${data.username} <span>${data.time}</span></p>
        <p class="text">${data.msg}</p>
        `;
        chatMessage.append(div);
      }
    });
  });


  //*** Functions Parts ***//

  // Leave room function
  function leaveRoom(name, room) {
    socket.emit("leave", {'username': name, 'room': room });
  }

  // Join room function
  function joinRoom(name, room) {

    socket.emit("join", { 'username': name, 'room': room });
    roomName.innerHTML = room;
    chatMessage.innerHTML = "";
    inputMessage.focus();
  }

  // Print Message
  function printMsg(msg, error) {
    const div = document.createElement("div");
    div.classList.add("message-mine");
    div.innerHTML = `<p class="${error} text">${msg}</p>`;
    chatMessage.append(div);
  }

  function showName(){
    /*
    When page loadeded check username if not exist asked user for
    his or she name and choose chatting room to join, else join he
    or she to last channel exist in localStorage
    */

    modal.style.display = 'block';
    modal.style.opacity = 1;

    // listen to submit of name and room choose form
    document.querySelector("#join-form").onsubmit = (e) => {
      // Store username and room in localStorage and send user to room chat
      const userDetail = {
        username: usernameEntry.value,
        room: roomSelect.value,
      };
      localStorage.setItem("user", JSON.stringify(userDetail));
      user = JSON.parse(localStorage.getItem('user'));
      modal.style.opacity = 0;
      modal.style.display = "none";
      nameShow.innerHTML = user.username;
      room = user.room;
      joinRoom(usernameEntry.value, roomSelect.value);
      // Prevent form submit
      e.preventDefault();
    };
  }

});
