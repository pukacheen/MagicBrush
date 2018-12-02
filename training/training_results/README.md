# Details
Running `./run_train.sh` gives the following:
<img src="Screen Shot 2018-11-27 at 1.45.09 AM.png">

The training ran for:
* 2 epochs (full runs through the entirety of the dataset)
* 4000 iterations per epoch
* 56 minutes for every checkpoint (1000 iterations)
* on a K80 on Google Cloud.

For checkpoints, see the Google Storage Bucket
* https://console.cloud.google.com/storage/browser/transformer-results-bucket

# Epoch 0

<div>
  <img src = '0_1000.png' height = '246px'>
  <img src = '0_2000.png' height = '246px'>
</div>

<div>
  <img src = '0_3000.png' height = '246px'>
  <img src = '0_4000.png' height = '246px'>
</div>

# Epoch 1

<div>
  <img src = '1_1000.png' height = '246px'>
  <img src = '1_2000.png' height = '246px'>
</div>

<div>
  <img src = '1_3000.png' height = '246px'>
  <img src = '1_4000.png' height = '246px'>
</div>

# Resuming training on your own

Clone the project, and download the checkpoints from the link above (or here!):
* [checkpoint](https://storage.googleapis.com/transformer-results-bucket/training/fast_style_transfer-1/checkpoint)
* [fns.ckpt.data-00000-of-00001 (19.2 MB)](https://storage.googleapis.com/transformer-results-bucket/training/fast_style_transfer-1/fns.ckpt.data-00000-of-00001)
* [fns.ckpt.index](https://storage.googleapis.com/transformer-results-bucket/training/fast_style_transfer-1/fns.ckpt.index)
* [fns.ckpt.meta (157 MB)](https://storage.googleapis.com/transformer-results-bucket/training/fast_style_transfer-1/fns.ckpt.meta)

Run `run_train.sh` to continue training. It'll save to the same checkpoint. If you've done this, you can contribute your compute cycles to this project! Just open a new issue, and tell me about it! We can work together to make it into the repository.
