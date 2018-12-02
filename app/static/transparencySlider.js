// Brush Transparency
window.brush_transparency = 0.2;

function changeBrushTransparency(transparency){
    window.brush_transparency = transparency;
}

window.changeBrushTransparency = changeBrushTransparency;

// Slider
slider = document.getElementById("myTransparency");
slider.oninput = function() {
	changeTransparency(this.value);
}

