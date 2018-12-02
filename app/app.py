from flask import Flask, render_template, url_for
from flask_socketio import SocketIO, send, emit
from tensorstyle import TransformNet

import os

app = Flask(__name__, static_url_path='')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

#_ DEVELOPMENT PURPOSES ONLY
# set to None if you don't want to load the TransformNet (ie, for fast testing of the front end)
emperor_penguin = 1

availableStyles = ['rain_princess', 'wave']

currentStyle = 'rain_princess'
stylizers = {}

def loadTransformNet(name):
    if emperor_penguin is not None:
        print("Loading {}...".format(name))
        stylizers[name] = TransformNet(name)

def populateStyles():
    if emperor_penguin is not None:
        for t in availableStyles:
            loadTransformNet(t)

populateStyles()
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
    i, data, uid = package['image_id'], package['image'], package['uid']
    emit('ack', {
        'i': i,
        'uid': uid
    })

    if currentStyle not in stylizers or stylizers[currentStyle] is None:
        loadTransformNet(currentStyle)

    if emperor_penguin is not None:
        base64_picture = data.split(',')[1]
        original, result = stylizers[currentStyle].decode(base64_picture)
        print('Sending...', 'data:image/png;base64,' + result[:10])
        emit('result', 'data:image/png;base64,' + result)
        emit('original', 'data:image/png;base64,' + original)

@socketio.on('change_style')
def update_style(data):
    global currentStyle
    
    styleName = data['style_name']

    if styleName in availableStyles:
        print('Changing the style to {}'.format(styleName))
        currentStyle = styleName
    else:
        print("Don't hack the front end to send me bogus styles")
        

if __name__ == '__main__':
    print("all right, i ran")
    socketio.run(app)
