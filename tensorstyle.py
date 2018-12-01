
import base64

from io import BytesIO
from PIL import Image

import tensorflow as tf
import transform

import scipy.misc
import numpy as np
import os
import sys
from time import time

import matplotlib.pyplot as plt

def normalize(img):
    """Convert a [0,255] image to [0,1] image
    """
    img = np.clip(img, 0, 255).astype(np.uint8)
    return img / 255


def encode(pixels):
    """pixels is a (512, 512) array
    """
    # save the image to a bytes buffer
    buffered = BytesIO()
    image = Image.fromarray(pixels.astype('uint8'))
    image = image.convert('RGB')
    image.save(buffered, format="PNG")

    # decode the bytes as a string
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return img_str

class TransformNet:

    def __init__(self):

        batch_size = 1
        checkpoint_dir = 'checkpoints'

        self.img_shape = [512, 512, 3]
        self.batch_shape = [batch_size] + self.img_shape
        self.checkpoint_dir = checkpoint_dir

        # initialize session
        # Launch the graph in a session that allows soft device placement and
        # logs the placement decisions.
        sess = tf.Session(config=tf.ConfigProto(allow_soft_placement=True,
                                        log_device_placement=True))

        # create the network
        img_placeholder = tf.placeholder(tf.float32, shape=self.batch_shape, name='img_placeholder')
        preds = transform.net(img_placeholder)

        # load weights from checkpoint
        saver = tf.train.Saver()
        if os.path.isdir(checkpoint_dir):
            ckpt = tf.train.get_checkpoint_state(checkpoint_dir)
            if ckpt and ckpt.model_checkpoint_path:
                saver.restore(sess, ckpt.model_checkpoint_path)
            else:
                raise Exception("No checkpoint found...")
        else:
            saver.restore(sess, checkpoint_dir)

        # save these so we can use them later
        self.sess = sess
        self.preds = preds
        self.img_placeholder = img_placeholder

        print("yo, u got a transform net")
        self.i = 0
        # do stuff

    def run_network(self, image):
        X = np.zeros(self.batch_shape, dtype=np.float32)
        X[0] = image

        _preds = self.sess.run(self.preds, feed_dict={self.img_placeholder: X})
        _preds = np.clip(_preds[0], 0, 255).astype(np.uint8)
        return _preds

    def decode(self, base64img):

        # the bytes of the image ---> np array
        image_64_decode = base64.decodebytes(base64img.encode('utf-8'))
        image = Image.open(BytesIO(image_64_decode))

        # resize, and convert to RGB
        image = image.resize(self.img_shape[:2], Image.ANTIALIAS)
        image = image.convert('RGB')

        nparr = np.array(image)
        nparr = nparr[:,:,:3]

        start = time()
        result = self.run_network(nparr)
        elapsed = time() - start
        self.latest_time = elapsed

        print('Stylized picture took {} seconds:'.format(elapsed), result.shape)
        
        return encode(nparr), encode(result)


    def close(self):
        self.sess.close()
        print('Session closed!')
