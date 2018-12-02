# Variables to set:
# - GPUS - tells which GPU to run on
# - IMG - title of the image

# train it for this
STYLE_IMG=examples/style/$IMG.jpg
CKPT_DIR=checkpoints/$IMG

# path to save test images in
TEST_DIR=..
IMG_TEST=examples/content/chicago.jpg

CUDA_VISIBLE_DEVICES=$GPUS python style.py --style $STYLE_IMG \
	--checkpoint-dir $CKPT_DIR \
	--test $IMG_TEST \
	--test-dir $TEST_DIR \
	--content-weight 4.5e0 \
	--checkpoint-iterations 500 \
	--batch-size 18 \
