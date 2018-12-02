# MagicBrush

Want to paint like a real artist? MagicBrush can help you! You can interactively draw in the web browser and have your painting transformed into the style of your favorite masterpiece in real time!

Neural Style Transfer is a (3 years) old magic which has become quite popular, but we want to make it better: interactive and real-time. The original algorithm from L. A. Gatys et. al. (2015) only allows you to transfer one image to one style at a time, and takes up to an hour to obtain a single frame of output even on a powerful machine. We use a faster neural network inspired by J. Johnson. et al. (2016) to make this application interactive and real-time, allowing users to actually engage with the transformation in the browser.

<img src="docs/hi3.png">

# Set up a Virtual Machine on Google Cloud Platform
We used a VM on GCP to train and run this project. To ensure that you have the same experience, you can set up your own VM to be similar to ours. Setting up a VM is hard if you're doing it for the first time. Google has a sort-of-good documentation [here](https://cloud.google.com/deep-learning-vm/docs/quickstart-marketplace), which gets you a VM with Tensorflow already installed.

### 1. Create a GCP project

<img src="docs/VMsetup-step1.png">

### 2. Create a VM based on Deep Learning VM

From the main menu, under "Compute", choose "Compute Engine" then "VM instances".
<img src="docs/VMsetup-step2-1.png">

Click on "Create Instance" from the top bar, then choose "Marketplace" from the left bar.
<img src="docs/VMsetup-step2-2.png">

Search for and choose "Deep Learning VM". Click "Launch on Compute Engine".
<img src="docs/VMsetup-step2-3.png">

Configure the VM as below, then click "Deploy".
<img src="docs/VMsetup-step2-4.png">

Wait for a minute or two, then you will have your VM ready!

### 3. Set up Cloud SDK

The Cloud SDK (`gcloud`) is the preferred command line tool for interfacing with your instance. [Download it here.](https://cloud.google.com/sdk/install)

### 4. Create an SSH connection to your machine

From the main menu, under "Tools", choose "Deployment Manager" then "Deploy". Note that you can pin this category for quick access.
<img src="docs/VMsetup-step3-1.png">

Click on your VM instance, then under "Suggested next steps" on the right bar, copy the command line to SSH into the VM and forward port 8080 on the VM to port 8080 on your local machine. Modify the command so that it forward port 5000 on the VM to port 5000 on your local machine instead (because we are using a Flask app, which by default runs on port 5000 in development). Run that command line.
<img src="docs/VMsetup-step3-2.png">

Congratulations! Your GCP VM is now ready.

# Train and run the program on your GCP VM

Once you SSH'ed into your GCP VM:

### 1. `git clone` the project

### 2. Install all requirements
Note: You *have* to use `pip3`! Otherwise flask will complain.
```
pip3 install -r MagicBrush/app/requirements.txt
```

### 3. Get our training checkpoints
Get our training checkpoints from Google Cloud and put them in the directory.
```
cd MagicBrush/app
mkdir checkpoints
gsutil cp -r gs://transformer-results-bucket/MagicBrush/* checkpoints
```
### 4. Run the webserver
```
FLASK_APP=app.py flask run
```

### 5. Play with the app
You should be able to see MagicBrush at `localhost:5000`!

# Todo

## Multiple users making style requests
Right now, the webpage keeps track of the server ack (the # of images that have been processed so far) as a way to not spam the server too much. However, if multiple users connect and send "image" data with *different image_id's* (and this does happen, because the `image_id`'s are not tied to each other in any way), then the whole synchronization thing can be messed up!!
- find a good way to solve this

## Making the network faster
This would mean more real-time feels. <3 How do we do this???? Run on a GPU
Right now, it's 1.7s on a CPU.

## Making the network better
It doesn't look *great*, as to be expected. We took an image style thing, and *did absolutely no customization* to make it process sketches. A more sketch-aware solution would do wonders on this front!!

## For our own record
It's 5:15AM, Sunday 12/02/2018. Our app is finally on the internet! http://35.247.115.136:5000/
The tricks are:
- Have a static external IP adress associated with the VM.
- Add firewal rules to allow ingress traffic on port 80, 443, and 5000.
- Make sure there's a default route whose next hop is "Default internet gateway" and allows destination IP ranges 0.0.0.0/0.
- Run "FLASK_APP=app.py flask run --host=0.0.0.0" (note the host flag)
