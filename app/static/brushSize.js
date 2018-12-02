// Brush size
window.brush_size = 8;

function changeBrushSize(brush_size) {
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
};

changeBrushSize({id: "small"});
window.changeBrushSize = changeBrushSize;
