from flask import Flask, render_template, url_for
from flask_socketio import SocketIO, send, emit
from tensorstyle import TransformNet
import time, os
import numpy as np

app = Flask(__name__, static_url_path='')
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

availableStyles = ['rain_princess', 'wave', 'lion', 'miro', 'spectacle', 'vangogh']
currentStyle = 'rain_princess'
stylizers = {}

# for the visualization page
vgg = None

# set to False if you don't want to load the neural networks
tf_enabled = True


def lazyload(name):
    if name not in stylizers or stylizers[name] is None:
        print("Loading {}...".format(name))
        stylizers[name] = TransformNet(name)
    return stylizers[name]


def lazyload_VGG():
    global vgg
    if vgg is None:
        from tensorstyle import VGGNet
        vgg = VGGNet()
    return vgg

def preloadNetworks():
    for t in availableStyles:
        try:
            lazyload(t)
        except:
            print('{} does not exist')

lazyload('rain_princess')
lazyload_VGG()

known_users = []
def get_user(id):
    global known_users
    if id not in known_users:
        known_users.append(id)

    return known_users.index(id)


points = []
def clear_points():
    global points
    points = []


def undo_last_points(uid):
    global points
    x = [p for p in reversed(points) if p['uid'] == uid]
    last_points_by_user = x[:10]
    points = [p for p in points if p not in last_points_by_user]


def update_status(msg):
    print(msg)
    emit('trivia', msg, broadcast=True)


# pages of the app

@app.route('/')
def get_index():
    return render_template('index.html')


@app.route('/vis')
def get_visualization():
    return render_template('visualization.html')


# listens to these events

@socketio.on('connect')
def client_connected():
    print('A user connected!')
    emit('new data', points)


@socketio.on('clear')
def clear():
    clear_points()
    emit('new data', points, broadcast=True)


@socketio.on('undo')
def undo(data):
    user = get_user(data['uid'])
    update_status('user {} used UNDO'.format(user))
    
    undo_last_points(data['uid'])
    emit('new data', points, broadcast=True)


@socketio.on('draw')
def update_drawing(data):
    user = get_user(data['uid'])
    update_status("user {} drew on the canvas [{} total points]".format(user, len(points)))

    points.append(data)
    emit('draw', data, broadcast=True)


@socketio.on('image')
def receive_image(package):
    i, data, uid = package['image_id'], package['image'], package['uid']
    emit('ack', {
        'i': i,
        'uid': uid
    })

    if tf_enabled:
        base64_picture = data.split(',')[1]
        original, result = lazyload(currentStyle).decode(base64_picture)
        
        # print('Sending...', 'data:image/png;base64,' + result[:10])
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
       

@socketio.on('vis_upload_image')
def visualization_image_upload(data):
    img, uid = data['image'], data['uid']
    
    # transforms the image, runs it thorugh VGG, computes the loss
    if tf_enabled:
        base64_picture = img.split(',')[1]
        original, result = lazyload(currentStyle).decode(base64_picture)
        
        # compute losses
        v = lazyload_VGG()
        start = time.time()
        losses1, losses2 = v.run(original), v.run(result)
        losses = [np.linalg.norm(a - b) / a.size for a,b in zip(losses1, losses2)]
        print(losses, time.time() - start)
        
        emit('vis_image_result', 'data:image/png;base64,' + result)
        emit('vis_loss_result', losses)


# appending the time to resources avoids the flask bug of using cached resources

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



if __name__ == '__main__':
    print("all right, i ran")
    socketio.run(app)
