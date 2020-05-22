document.addEventListener("DOMContentLoaded", () => {
  // Select DOM
  const nameShow = document.querySelector("#username-show");
  const modal = document.querySelector("#modal");
  const usernameEntry = document.querySelector("#username");
  const roomSelect = document.querySelector("#room");
  const chatMessage = document.querySelector("#chat-messages");
  const inputMessage = document.querySelector("#msg");
  let room;
  let user;

  // Connect to websocket
  var socket = io.connect(
    location.protocol + "//" + document.domain + ":" + location.port
  );

  // Check name of user then send to chatting room last was in it
  if (!localStorage.getItem("user")) {
    showName();
  } else {
    user = JSON.parse(localStorage.getItem("user"));
    const name = user.username;
    room = user.room;
    nameShow.innerHTML = name;
    joinRoom(name, room);
    console.log(user);
  }

  // Listen to event for login out
  document.querySelector(".chat-header .btn").addEventListener("click", (e) => {

    const name = user.username;
    const room = user.room;
    leaveRoom(name, room);
    localStorage.clear();
    setTimeout(showName, 50);
    console.log(user);
    e.preventDefault();
  });

  // Display message from server
  socket.on("message", (data) => {
    user = JSON.parse(localStorage.getItem('user'));
    if (data.msg) {
      if (data.username === user.username) {
        const div = document.createElement("div");
        div.classList.add("message-mine");
        div.innerHTML = `<p class="message-name">${data.username} <span>${data.time}</span></p>
        <p class="text">${data.msg}</p>
        `;
        chatMessage.append(div);
      } else if (typeof data.username !== "undefined") {
        const div = document.createElement("div");
        div.classList.add("message");
        div.innerHTML = `<p class="message-name">${data.username} <span>${data.time}</span></p>
        <p class="text">${data.msg}</p>
        `;
        chatMessage.append(div);
      } else {
        printMsg(data.msg, data.error);
      }
    }
    chatMessage.scrollTop = chatMessage.scrollHeight;
  });

  //Listen to event send message
  document.querySelector("#chat-form").onsubmit = (e) => {
    user = JSON.parse(localStorage.getItem("user"));
    socket.send({
      username: user.username,
      msg: inputMessage.value,
      room: room,
    });

    inputMessage.value = "";
    inputMessage.focus();
    e.preventDefault();
  };

  // Room Selection
  document.querySelector("#rooms").addEventListener("click", (e) => {
    if (e.target && e.target.matches("li.select-room")) {
       let newRoom = e.target.innerHTML;
       if (newRoom === room){
         const msg = `You are already in ${room} room`;
         const error = "error-msg";
         printMsg(msg, error);
       } else {
         name = user.username
         leaveRoom(name, room);
         console.log('left',user.username,room)
         joinRoom(user.username, newRoom);
         console.log('join',user.username,room)
         room = newRoom;
         const userUpdate = {
           username: name,
           room: newRoom
         }
        localStorage.setItem('user',JSON.stringify(userUpdate));
         console.log("diff", newRoom, room, user);
       }
    }
  });

  // Listen to button click on small screen to toggle class "show"
  document.querySelector(".menu-btn").addEventListener("click", () => {
    document.querySelector(".chat-sidebar").classList.toggle("show");
  });

  // Listen to submit button to emit a "new room" event
  document.querySelector("#new-channel").onclick = () => {
    user = JSON.parse(localStorage.getItem('user'));
    const channelName = document.querySelector("#channel-name");
    socket.emit("new room", {'username': user.username, 'new_room' : channelName.value});
    channelName.value = "";
  };

  // When a new room is announced,check add to the unordered list
  socket.on("create room", (data) => {

    // If response success the add new room to list else print error
    if (data.success) {
      const li = document.createElement('li');
      li.classList.add("select-room");
      li.innerHTML = data.room;
      document.querySelector('#rooms').append(li);
    } else {
      const error = "error-msg";
      printMsg(data.error, error);
    }
  });

  // join my own room create
  socket.on('join room', data => {
    const name = user.username;
    leaveRoom(name, room);
    console.log('left',name,room, data.room)
    const createRoom = data.room
    joinRoom(name, createRoom);
    console.log('join',name,room, createRoom)
    room = createRoom;
    const userUpdate = {
      username: name,
      room: createRoom
    }
   localStorage.setItem('user',JSON.stringify(userUpdate));
    console.log("diff", createRoom, room, JSON.parse(localStorage.getItem('user')));
  })

  // Functions Part

  // Leave room function
  function leaveRoom(name, room) {
    socket.emit("leave", {'username': name, 'room': room });
    // remove bg of slecet room
  }

  // Join room function
  function joinRoom(name, room) {
    // add bg color
    document.querySelector("#room-name").innerHTML = room;
    chatMessage.innerHTML = "";
    inputMessage.focus();
    socket.emit("join", { 'username': name, 'room': room });
  }

  // Print Message
  function printMsg(msg, error) {
    const div = document.createElement("div");
    div.classList.add("message-mine");
    div.innerHTML = `<p class="${error} text">${msg}</p>`;
    chatMessage.append(div);
    chatMessage.scrollTop = chatMessage.scrollHeight;
  }

  // Check Name
  function showName() {
    /*
    When page loadeded check username if not exist asked user for
    his or she name and choose chatting room to join, else join he
    or she to last channel exist in localStorage
   */

    modal.style.display = "block";
    modal.style.opacity = 1;

    // listen to submit of name and room choose form
    document.querySelector("#join-form").onsubmit = (e) => {
      // Store username and room in localStorage and send user to room chat
      const userDetail = {
        username: usernameEntry.value,
        room: roomSelect.value,
      };
      localStorage.setItem("user", JSON.stringify(userDetail));
      modal.style.opacity = 0;
      modal.style.display = "none";
      nameShow.innerHTML = usernameEntry.value;
      document.querySelector('#room-name').innerHTML= roomSelect.value;
      room = roomSelect.value;
      joinRoom(usernameEntry.value, roomSelect.value);

      // Prevent form submit
      e.preventDefault();
    };
  }
});
