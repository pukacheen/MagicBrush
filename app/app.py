from flask import Flask, render_template, url_for
from flask_socketio import SocketIO, send, emit

import os

app = Flask(__name__, static_url_path='')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


default_style = 'rain_princess'
available_nets = ['rain_princess', 'wave']

library_loaded = False
def loadTransformNet(name):
    """Lazy loading of transform Net
    """
    global library_loaded

    if not library_loaded:
        from tensorstyle import TransformNet
        library_loaded = True
    
    return TransformNet(name)

#_ DEVELOPMENT PURPOSES ONLY
# set to None if you don't want to load the TransformNet
emperor_penguin = None
emperor_penguin = loadTransformNet(default_style)

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
    global points
    print('ok')
    points = []
    emit('new data', points, broadcast=True)

@socketio.on('draw')
def update_drawing(data):
    print("We have", len(points), "points on the canvas")

    points.append(data)
    emit('draw', data, broadcast=True)

@socketio.on('image')
def receive_image(package):
    i, data = package['image_id'], package['image']
    emit('ack', i)
    print('Received data {}!'.format(i))

    if emperor_penguin is not None:
        base64_picture = data.split(',')[1]
        original, result = emperor_penguin.decode(base64_picture)
        print('Sending...', 'data:image/png;base64,' + result[:10])
        emit('result', 'data:image/png;base64,' + result)
        emit('original', 'data:image/png;base64,' + original)


if __name__ == '__main__':
    print("all right, i ran")
    socketio.run(app)
