// Brush size
window.brush_size = 8;

function changeBrushSize(brush_size) {
	if (brush_size.id) {
		switch(brush_size.id) {
			case "small":
				window.brush_size = 5;
				break;
			case "medium":
				window.brush_size = 10;
				break;
			case "large":
				window.brush_size = 15;
				break;
		}
	} else {
		window.brush_size = brush_size / 2;
	}
};

changeBrushSize(30);
window.changeBrushSize = changeBrushSize;
