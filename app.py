from flask import Flask, render_template, url_for
from flask_socketio import SocketIO, send, emit

from tensorstyle import TransformNet

import os

app = Flask(__name__, static_url_path='/public')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

emperor_penguin = TransformNet()
points = []

@app.route('/')
def get_index():
     return render_template('index.html')

@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)

def dated_url_for(endpoint, **values):
    if endpoint == 'static':
        filename = values.get('filename', None)
        if filename:
            file_path = os.path.join(app.root_path,
                                     endpoint, filename)
            values['q'] = int(os.stat(file_path).st_mtime)
    return url_for(endpoint, **values)

@socketio.on('connect')
def client_connected():
    print('A user connected!')
    emit('new data', points)


@socketio.on('clear')
def clear():
    print('ok')
    points = []
    emit('new data', points, broadcast=True)

@socketio.on('draw')
def update_drawing(data):
    print("We have", len(points), "points on the canvas")

    points.append(data)
    emit('draw', data, broadcast=True)

@socketio.on('image')
def receive_image(data):
    print('Received data!')
    base64_picture = data.split(',')[1]
    emperor_penguin.decode(base64_picture)


if __name__ == '__main__':
    print("all right, i ran")
    socketio.run(app)
