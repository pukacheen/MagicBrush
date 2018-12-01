
//Color palette
window.colors = "";
function changeColors(palette) {
	switch(palette.id) {
		case "red":
			colors = "#FF0000";
			break;
		case "red1":
			colors = "#F16161";
			break;
		case "red2":
			colors = "#F69FA0";
			break;
		case "orange":
			colors = "#FFA500";
			break;
		case "orange1":
			colors = "#F99F62";
			break;
		case "orange2":
			colors = "#FBB57B";
			break;
		case "blue":
			colors = "#09C2DB";
			break;
		case "blue1":
			colors = "#8BD3DC";
			break;
		case "blue2":
			colors = "#B9E3E8";
			break;
		case "indigo":
			colors = "#0E38AD";
			break;
		case "indigo1":
			colors = "#546AB2";
			break;
		case "indigo2":
			colors = "#9C96C9";
			break;
		case "green":
			colors = "#00FF00";
			break;
		case "green1":
			colors = "#97CD7E";
			break;
		case "green2":
			colors = "#C6E2BB";
			break;
		case "black":
			colors = "#000000";
			break;
		case "black1":
			colors = "#333333";
			break;
		case "black2":
			colors = "#666666";
			break;
		case "yellow":
			colors = "#FFFF00";
			break;
		case "yellow1":
			colors = "#F7F754";
			break;
		case "yellow2":
			colors ="#F7F4B1";
			break;
		case "purple":
			colors = "#B9509E";
			break;
		case "purple1":
			colors = "#D178B1";
			break;
		case "purple2":
			colors = "#E3ABCE";
			break;
		case "grey":
			colors = "#999999";
			break;
		case "grey1":
			colors = "#CCCCCC";
			break;
		case "white":
			colors = "#FFFFFF";
			break;
	}
};

changeColors({id: "red"});
window.changeColors = changeColors;
