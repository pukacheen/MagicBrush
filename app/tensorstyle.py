
import base64

from io import BytesIO
from PIL import Image

import tensorflow as tf
import transform
import vgg

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


def decode(base64img, size):
    """returns an np array of the specified size
    """
    # the bytes of the image ---> np array
    image_64_decode = base64.decodebytes(base64img.encode('utf-8'))
    image = Image.open(BytesIO(image_64_decode))

    # resize, and convert to RGB
    image = image.resize(size, Image.ANTIALIAS)
    image = image.convert('RGB')

    nparr = np.array(image)
    nparr = nparr[:,:,:3]
    return nparr

class VGGNet:
    """Loads VGG, and gives you the option to get the style features from an image
    """

    def __init__(self):
        batch_size = 1

        self.img_shape = [224, 224, 3]
        self.batch_shape = [batch_size] + self.img_shape
        
        # we'll download VGG into the /data folder
        vgg_path = 'data/imagenet-vgg-verydeep-19.mat'
      
        self.STYLE_LAYERS = ('relu1_1', 'relu2_1', 'relu3_1', 'relu4_1', 'relu5_1')
        self.CONTENT_LAYER = 'relu4_2'
       
        # load VGG network
        self.graph = tf.Graph()
        self.sess = tf.Session(graph=self.graph)
        with self.graph.as_default():
            img_placeholder = tf.placeholder(tf.float32, shape=self.batch_shape, name='style_img_placeholder')
            style_image_pre = vgg.preprocess(img_placeholder)
            
            # vgg.py gives us a dictionary of tensorflow ops
            net = vgg.net(vgg_path, style_image_pre)
            
            # define operations to get the feature gram matrices
            self.style_grams = []
            for f in self.STYLE_LAYERS:
                layer = net[f]
                bs, height, width, filters = map(lambda i:i.value, layer.get_shape())
                size = height * width * filters
                feats = tf.reshape(layer, (bs, height * width, filters))
                feats_T = tf.transpose(feats, perm=[0,2,1])
                grams = tf.matmul(feats_T, feats) / size
                self.style_grams.append(grams)

            self.content_grams = [net[self.CONTENT_LAYER]]

            # save these so we can use them later
            self.img_placeholder = img_placeholder

            print("yo, got a VGG network!")


    def get_gram_values(self, img):
        X = np.zeros(self.batch_shape, dtype=np.float32)
        X[0] = img

        gram_values = self.sess.run(self.style_grams + self.content_grams, \
                feed_dict={self.img_placeholder: X})
        return gram_values
        
    
    def run(self, img):
        img = decode(img, self.img_shape[:2])
        grams = self.get_gram_values(img)
        return grams

class TransformNet:

    def __init__(self, name='wave'):

        batch_size = 1
        checkpoint_dir = 'checkpoints/{}'.format(name)

        self.img_shape = [512, 512, 3]
        self.batch_shape = [batch_size] + self.img_shape
        self.checkpoint_dir = checkpoint_dir
        
        # initialize session
        # Launch the graph in a session that allows soft device placement and
        # logs the placement decisions.
        self.graph = tf.Graph()
        self.sess = tf.Session(graph=self.graph,
            config=tf.ConfigProto(allow_soft_placement=True))

        # create the network
        with self.graph.as_default():
            img_placeholder = tf.placeholder(tf.float32, shape=self.batch_shape, name='img_placeholder')
            preds = transform.net(img_placeholder)

            # load weights from checkpoint
            saver = tf.train.Saver()
            if os.path.isdir(checkpoint_dir):
                ckpt = tf.train.get_checkpoint_state(checkpoint_dir)
                if ckpt and ckpt.model_checkpoint_path:
                    saver.restore(self.sess, ckpt.model_checkpoint_path)
                else:
                    print("No checkpoint found...")
            else:
                print("No model found!")

            # save these so we can use them later
            self.preds = preds
            self.img_placeholder = img_placeholder

            print("yo, u got a transform net")            
    

    def run_network(self, image):
        """
        image - np.array

        Returns:
        - predictions from the neural network
        """
        X = np.zeros(self.batch_shape, dtype=np.float32)
        X[0] = image

        _preds = self.sess.run(self.preds, feed_dict={self.img_placeholder: X})
        _preds = np.clip(_preds[0], 0, 255).astype(np.uint8)
        return _preds


    def decode(self, base64img):
        nparr = decode(base64img, self.img_shape[:2])

        start = time()
        result = self.run_network(nparr)
        elapsed = time() - start
        self.latest_time = elapsed

        # print('Stylized picture took {} seconds:'.format(elapsed), result.shape)
        
        return encode(nparr), encode(result)

if __name__ == "__main__":
    # test VGGNet
    net = VGGNet()
    print("successfully loaded!")

