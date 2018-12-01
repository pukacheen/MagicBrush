# socketio-paint-demo

A sample app for Learn Teach Code that lets users paint on a collaborative canvas in real time over a WebSocket connection. Built with NodeJS, Express and SocketIO.

# Todo!!
We want to stream canvas data to the server, apply style transfer, and get a resulting stream back

Capturing the entire canvas as an image, and then using a timer to send this periodically to the server turned out to be bad! It's actually more efficient to stream this data as video.

Once it's on the server, though, there are two ways of dealing with this data:
1. use ffmpeg to make it into a video, style-encode the entire video
  * can we style-encode only the last X frames?
2. use ffmpeg to make it into an image, style-encode this image
  * can we get continuity loss here?

Extract a raw frame:
https://stackoverflow.com/questions/32142925/its-possibile-to-extract-a-raw-frame-from-an-h264-file

Example of fast style transfer, but reading and writing to a video:
https://github.com/lengstrom/fast-style-transfer/blob/c77c028fe4412ce0bbb0e9f281a5970ab90fc7a5/evaluate.py#L22
* can we do style transfer in real time?
