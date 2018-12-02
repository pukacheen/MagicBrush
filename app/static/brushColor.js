//Color palette
window.brush_color = "";
function changeColors(palette) {
	if (palette.className && palette.className.includes("palette")) {
		switch(palette.id) {
			case "red":
				brush_color = "#FF0000";
				break;
			case "red1":
				brush_color = "#F16161";
				break;
			case "red2":
				brush_color = "#F69FA0";
				break;
			case "orange":
				brush_color = "#FFA500";
				break;
			case "orange1":
				brush_color = "#F99F62";
				break;
			case "orange2":
				brush_color = "#FBB57B";
				break;
			case "blue":
				brush_color = "#09C2DB";
			break;
			case "blue1":
				brush_color = "#8BD3DC";
				break;
			case "blue2":
				brush_color = "#B9E3E8";
				break;
			case "indigo":
				brush_color = "#0E38AD";
				break;
			case "indigo1":
				brush_color = "#546AB2";
				break;
			case "indigo2":
				brush_color = "#9C96C9";
				break;
			case "green":
				brush_color = "#008000";
				break;
			case "green1":
				brush_color = "#97CD7E";
				break;
			case "green2":
				brush_color = "#C6E2BB";
				break;
			case "black":
				brush_color = "#000000";
				break;
			case "black1":
				brush_color = "#333333";
				break;
			case "black2":
				brush_color = "#666666";
				break;
			case "yellow":
				brush_color = "#FFFF00";
				break;
			case "yellow1":
				brush_color = "#F7F754";
				break;
			case "yellow2":
				brush_color ="#F7F4B1";
				break;
			case "purple":
				brush_color = "#B9509E";
				break;
			case "purple1":
				brush_color = "#D178B1";
				break;
			case "purple2":
				brush_color = "#E3ABCE";
				break;
			case "grey":
				brush_color = "#999999";
			break;
			case "grey1":
				brush_color = "#CCCCCC";
				break;
			case "white":
				brush_color = "#FFFFFF";
				break;
		}
	} else {
		brush_color = "#" + palette;	
	}
	document.getElementById("current_brush").style.backgroundColor = brush_color;
};

changeColors({id: "red"});
window.changeColors = changeColors;
