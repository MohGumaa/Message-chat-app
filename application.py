import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
#os.getenv("SECRET_KEY")
app.config["SECRET_KEY"] ="secert!"
socketio = SocketIO(app)

channels = []

@app.route("/")
def index():
    return render_template("index.html", channels=channels)

@socketio.on("new_channel")
def new_channel(channelName):
    """Check if the channel if exist return error else add to list."""
    if channelName in channels:
        emit("channel list", {"success": False, "error":"Channel already exist!"})
    else:
        channels.append(channelName)
        emit("channel list", {"success": True, "channels":channels}, broadcast=True)
