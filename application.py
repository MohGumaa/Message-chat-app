import os

from time import localtime, strftime
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, send, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

rooms = ["public"]
messages = {"Public":[]}

@app.route("/")
def index():
    return render_template("index.html", rooms=rooms)

# Listen to event send message
@socketio.on('message')
def handle_message(data):
    message_data = {'username': data['username'], 'msg': data['msg'], 'time': strftime('%I:%M %p', localtime())}

    # Check if messages in room is greate than 100 then delete first messages
    if len(messages[data['room']]) > 100:
        messages(data['room']).pop(0)

    messages[data['room']].append(message_data)
    send(message_data, room=data['room'])
    # {'time': strftime('%b-%d %H:%M', localtime())}

@socketio.on('delete-message')
def delete_message(message):
    data = {
        'username': message['username'],
        'msg': message['msg'],
        'time': message['time']
    }

    for i, value in enumerate(messages[message['room']]):
        if value == data:
            del messages[message['room']][i]
            break;
    emit("my event", messages[message['room']], broadcast = True);

@socketio.on('join')
def handle_join(data):
    join_room(data['room'])
    emit("my event", messages[data['room']]);
    send({'msg': data['username'] + " has joined the " + data['room'] + " room!", 'error': 'success-msg'}, room=data['room'])

@socketio.on('leave')
def handle_leave(data):
    leave_room(data['room'])
    send({'msg': data['username'] + " has left the " +
          data['room'] + " room!", 'error': 'error-msg'}, room=data['room'])

@socketio.on("new room")
def new_room(data):
    """Check if the room if exist return error else announced event
    "create room" event to everyone."""

    newRoom = data['new_room'].lower()
    if newRoom in rooms:
        emit("create room", {"success": False, "error": "Room name already exist!, Please type other name."});

    else:
        # try to add iit to messages
        rooms.append(newRoom)

        # Create list messages for new channel
        messages[newRoom.capitalize()] = []

        emit("create room", {"success": True, "username": data['username'], "room": newRoom.capitalize()}, broadcast=True)
        emit("join room", {"username": data['username'], "room": newRoom.capitalize()})

if __name__ == '__main__':
    app.run()
