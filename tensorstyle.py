
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

def save_img(out_path, img):
    img = np.clip(img, 0, 255).astype(np.uint8)
    scipy.misc.imsave(out_path, img)

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
        return _preds

    def decode(self, base64img):

        # the bytes of the image ---> np array
        image_64_decode = base64.decodebytes(base64img.encode('utf-8'))
        image = Image.open(BytesIO(image_64_decode))

        # resize the image to a reasonable size
        # (512 x 512)?
        image = image.resize((512, 512), Image.ANTIALIAS)
        nparr = np.array(image, dtype=np.float32)
        nparr = nparr[:,:,:3] # skip the fourth channel

        # print how big the image is
        print(nparr.shape)

        start = time()
        result = self.run_network(nparr)
        elapsed = time() - start
        print('Stylized picture took {} seconds:'.format(elapsed), result.shape)

        plt.subplot(1,2,1)
        plt.imshow(nparr)
        plt.subplot(1,2,2)
        plt.imshow(result[0])
        plt.savefig('hello{}.png'.format(self.i))

        self.i += 1

        if self.i == 10:
            print("that's it!")
            self.close()


    def close(self):
        self.sess.close()
        print('Session closed!')
