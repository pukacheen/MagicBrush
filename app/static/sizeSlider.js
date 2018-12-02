slider = document.getElementById("myRange");
slider.oninput = function() {
	changeBrushSize(this.value);
}
