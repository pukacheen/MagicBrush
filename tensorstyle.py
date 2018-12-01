
import numpy as np
import base64

from io import BytesIO
from PIL import Image

class TransformNet:

    def __init__(self):
        print("yo, u got a transform net")
        self.i = 0
        # do stuff

    def decode(self, base64img):

        # the bytes of the image ---> np array
        image_64_decode = base64.decodebytes(base64img.encode('utf-8'))
        image = Image.open(BytesIO(image_64_decode))

        # resize the image to a reasonable size
        # (512 x 512)?
        image = image.resize((512, 512), Image.ANTIALIAS)
        nparr = np.array(image)

        # print how big the image is
        print(nparr.shape)
