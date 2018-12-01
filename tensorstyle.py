
import numpy as np
import base64

class TransformNet:

    def __init__(self):
        print("yo, u got a transform net")
        self.i = 0
        # do stuff

    def decode(self, base64img):
        image_64_decode = base64.decodebytes(base64img.encode('utf-8'))

        filename = "imageToSave{}.png".format(self.i)
        with open(filename, "wb") as fh:
            print('saved to {}'.format(filename))
            fh.write(image_64_decode)
            self.i += 1
