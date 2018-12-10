# MagicBrush

🎬Demo Video 🎬: https://www.youtube.com/watch?v=splMEzd4ClU&feature=youtu.be

🔥Live Demo 🔥: ~~http://35.247.115.136:5000~~ (We don't have our VM instance running anymore, but contact us if you want to see it live!)

Want to paint like a real artist? MagicBrush can help you! You can interactively draw in the web browser and have your painting transformed into the style of your favorite masterpiece in real time!

Neural Style Transfer is a (3 years) old magic which has become quite popular, but we want to make it better: interactive and real-time. The original algorithm from L. A. Gatys et. al. (2015) only allows you to transfer one image to one style at a time, and takes up to an hour to obtain a single frame of output even on a powerful machine. We use a faster neural network inspired by J. Johnson. et al. (2016) to make this application interactive and real-time, allowing users to actually engage with the transformation in the browser.

<img src="docs/hi3.png">

# To get started, check out these wiki pages!
[Setting up and using our app with a Virtual Machine on Google Cloud Platform](https://github.com/pukacheen/MagicBrush/wiki/Setting-up-and-using-a-Virtual-Machine-on-Google-Cloud-Platform)

# Todo

## Multiple users making style requests
- done!

## Making the network faster
- done!

## Making the network better
- done!

## For our own record
It's 5:15AM, Sunday 12/02/2018. Our app is finally on the internet! http://35.247.115.136:5000/
The tricks are:
- Have a static external IP adress associated with the VM.
- Add firewal rules to allow ingress traffic on port 80, 443, and 5000.
- Make sure there's a default route whose next hop is "Default internet gateway" and allows destination IP ranges 0.0.0.0/0.
- Run "FLASK_APP=app.py flask run --host=0.0.0.0" (note the host flag)
