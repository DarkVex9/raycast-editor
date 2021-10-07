//======Notes to Self======
/*
add transparency toggle (t), add to rendering

*/

console.log("start");
var map = [[]];
var cursor = { x: 2, y: 1, clipBoard: {}, palette: [] };
for (let i = 0; i < 9; i++) {
	cursor.palette[i] = {};
}
var mode = "map";
var paletteFull = false;
var paletteLeft = false;
var paletteRight = false;
var reference = false;
var mapcanvas = document.getElementById("canvas1");
var mapctx = mapcanvas.getContext("2d");
var canvas2 = document.getElementById("canvas2");
var ctx2 = canvas2.getContext("2d");
var textbox = document.getElementById("textbox");
var tileData = document.getElementById("tileData");
var texture;
var textureSheet;
var camera = { x: 1.5, y: 0.5, gridSize: 30, speed: 1 };
var mapData = { width: 1, height: 1 };
let mapCell = {
	colide: false,
	floorHeight: 0,
	ceilingHeight: 0,
	rayScript: "example",
	enterScript: "example",
	exitScript: "example",
	updateScript: "example",
	textureTop: "",
	textureBottom: "",
	textureLeft: "",
	textureRight: ""
};
var cellScripts = {
	example: function () {}
};
var textures = document.getElementById("textures");
var textureData = { wall1: { x: 0, y: 0, width: 40, height: 40 } };

//functions
function createMap(width, height) {
	mapData.width = width;
	mapData.height = height;
	for (let y = 0; y < height; y++) {
		map[y] = [];
		for (let x = 0; x < width; x++) {
			map[y][x] = {};
		}
	}
}
function output() {
	document.getElementById("textbox").value = JSON.stringify(map) + "\n";
}
document.getElementById("canvas1").addEventListener("click", function (event) {
	render();
});
document.getElementById("textures").addEventListener("click", function (event) {
	let x = event.offsetX;
	let y = event.offsetY;
	let door = texture["textures/brick/castle/door"];
	for (let entry in texture) {
		if (texture.hasOwnProperty(entry)) {
			let data = texture[entry];
			if (data.x < x && data.y < y && data.x + data.w > x && data.y + data.h > y) {
				console.log(entry);
				cursor.palette[0] = {};
				cursor.palette[0].texture = entry;
				return entry;
			}
		}
	}
	render();
});
document.addEventListener("keydown", function (event) {
	if (event.key === "f") {
		if (paletteFull) {
			paletteFull = false;
		} else {
			paletteFull = true;
			paletteLeft = false;
			paletteRight = false;
		}
	}
	if (event.key === "g") {
		if (paletteLeft) {
			paletteLeft = false;
		} else {
			paletteLeft = true;
			paletteFull = false;
			paletteRight = false;
		}
	}
	if (event.key === "h") {
		if (paletteRight) {
			paletteRight = false;
		} else {
			paletteRight = true;
			paletteLeft = false;
			paletteFull = false;
		}
	}
	//console.log("keydown " + event.key);
	if (mode === "map") {
		//console.log(event.key);
		if (event.key === "ArrowUp" || event.key === "i") {
			event.preventDefault();
			if (camera.y > 0) {
				camera.y -= camera.speed;
			}
		}
		if (event.key === "ArrowDown" || event.key === "k") {
			event.preventDefault();
			if (camera.y < mapData.height - 1) {
				camera.y += camera.speed;
			}
		}
		if (event.key === "ArrowLeft" || event.key === "j") {
			event.preventDefault();
			if (camera.x > 0) {
				camera.x -= camera.speed;
			}
		}
		if (event.key === "ArrowRight" || event.key === "l") {
			event.preventDefault();
			if (camera.x < mapData.width - 1) {
				camera.x += camera.speed;
			}
		}
		if (event.key === "PageUp" || event.key === "u") {
			event.preventDefault();
			camera.gridSize *= 1.25;
			//console.log(camera.gridSize);
		}
		if (event.key === "PageDown" || event.key === "o") {
			event.preventDefault();
			if (camera.gridSize > 10) {
				camera.gridSize /= 1.25;
				//console.log(camera.gridSize);
			}
		}
		if (event.key === "w") {
			if (cursor.y > 0) {
				cursor.y--;
			}
		}
		if (event.key === "s") {
			if (cursor.y < mapData.height - 1) {
				cursor.y++;
			}
		}
		if (event.key === "a") {
			if (cursor.x > 0) {
				cursor.x--;
			}
		}
		if (event.key === "d") {
			if (cursor.x < mapData.width - 1) {
				cursor.x++;
			}
		}
		if (event.key === "r") {
			cursor.palette[0] = JSON.parse(JSON.stringify(map[cursor.y][cursor.x]));
		}
		if (event.key === "p") {
			output();
		}
		if (event.key === "=") {
			mapcanvas.width += 20;
			mapcanvas.height += 20;
		}
		if (event.key === "-") {
			mapcanvas.width -= 20;
			mapcanvas.height -= 20;
		}
		if (event.key === "[") {
			if (textbox.value) {
				try {
					JSON.parse(textbox.value);
					map = JSON.parse(textbox.value);
					mapData.width = map[0].length;
					mapData.height = map.length;
				} catch {
					console.log("Error inputing map data - Cannot parse");
				}
			} else {
				try {
					mapData.width = document.getElementById("newWidth").value;
				} catch {
					console.log(
						"Invalid new map width: ",
						document.getElementById("newWidth").value
					);
					document.getElementById("newWidth").value = "error";
				}
				try {
					mapData.height = document.getElementById("newHeight").value;
				} catch {
					console.log(
						"Invalid new map height: ",
						document.getElementById("newHeight").value
					);
					document.getElementById("newHeight").value = "error";
				}
				for (let y = 0; y < mapData.height; y++) {
					map[y] = [];
					for (let x = 0; x < mapData.width; x++) {
						map[y][x] = {};
					}
				}
			}
		}
		if (event.key === " ") {
			event.preventDefault();
			if (reference) {
				map[Math.floor(cursor.y)][Math.floor(cursor.x)] = cursor.palette[0];
			} else {
				map[Math.floor(cursor.y)][Math.floor(cursor.x)] = JSON.parse(
					JSON.stringify(cursor.palette[0])
				);
			}
			render();
		}
		if (isNormalInteger(event.key)) {
			if (paletteFull) {
				cursor.palette[event.key] = JSON.parse(JSON.stringify(cursor.palette[0]));
			} else if (paletteLeft) {
				cursor.palette[event.key].textureNS = JSON.parse(
					JSON.stringify(cursor.palette[0].texture)
				);
			} else if (paletteRight) {
				cursor.palette[event.key].textureEW = JSON.parse(
					JSON.stringify(cursor.palette[0].texture)
				);
			} else {
				if (reference) {
					map[Math.floor(cursor.y)][Math.floor(cursor.x)] = cursor.palette[event.key];
				} else {
					map[Math.floor(cursor.y)][Math.floor(cursor.x)] = JSON.parse(
						JSON.stringify(cursor.palette[event.key])
					);
				}
			}
			console.log("palette:", cursor.palette);
		}
		if (event.key === "`") {
			map[Math.floor(cursor.y)][Math.floor(cursor.x)] = {};
		}
		if (event.key === "n") {
			if (cursor.palette[0].mirrorNS) {
				delete cursor.palette[0].mirrorNS;
			} else {
				cursor.palette[0].mirrorNS = true;
			}
		}
		if (event.key === "m") {
			if (cursor.palette[0].mirrorEW) {
				delete cursor.palette[0].mirrorEW;
			} else {
				cursor.palette[0].mirrorEW = true;
			}
		}
		if (event.key === "t") {
			if (cursor.palette[0].transparent) {
				delete cursor.palette[0].transparent;
			} else {
				cursor.palette[0].transparent = true;
			}
		}
	} else if (mode === "texture") {
	}
	if (event.key === "c") {
		cursor.clipBoard = map[cursor.y][cursor.x];
	}
	if (event.key === "v") {
		map[cursor.y][cursor.x] = cursor.clipBoard;
	}
	if (event.key === "Escape") {
		clearInterval(interval);
	}
	render();
});
function isNormalInteger(str) {
	var n = Math.floor(Number(str));
	return n !== Infinity && String(n) === str && n >= 0;
}
function canvasMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
function drawGrid() {
	for (let y = 0; y <= mapData.height; y++) {
		drawLineGrid(0, y, mapData.width, y);
	}
	for (let x = 0; x <= mapData.width; x++) {
		drawLineGrid(x, 0, x, mapData.height);
	}

	for (let y = 0; y < mapData.height; y++) {
		for (let x = 0; x < mapData.width; x++) {}
	}
}
function drawLineGrid(x1, y1, x2, y2) {
	mapctx.beginPath();
	mapctx.moveTo(xGridToScreen(x1), yGridToScreen(y1));
	mapctx.lineTo(xGridToScreen(x2), yGridToScreen(y2));
	mapctx.stroke();
}
function drawCircle(x, y, r) {
	mapctx.beginPath();
	mapctx.arc(x, y, r, 0, 2 * Math.PI);
	mapctx.stroke();
}
function drawCircleGrid(x, y, r, highlight) {
	mapctx.beginPath();
	mapctx.arc(xGridToScreen(x), yGridToScreen(y), r * camera.gridSize, 0, 2 * Math.PI);
	if (highlight) {
		mapctx.globalAlpha = 0.3;
		mapctx.fillStyle = highlight;
		mapctx.fill();
		mapctx.globalAlpha = 1.0;
	}
	mapctx.stroke();
}
function drawImageGrid(x, y, name, offsetX = 0, offsetY = 0, cropWidth, cropHeight) {}
function render() {
	mapctx.clearRect(0, 0, mapcanvas.width, mapcanvas.height);
	ctx2.clearRect(0, 0, mapcanvas.width, mapcanvas.height);
	drawGrid();
	for (let y = 0; y < mapData.height; y++) {
		for (let x = 0; x < mapData.width; x++) {
			mapDrawTexture(map[y][x], x, y);
		}
	}
	for (let i = 0; i < 9; i++) {
		if (i == 0) {
			mapDrawTexture(cursor.palette[0], 0, 1, true);
			if (paletteFull) {
				ctx2.globalAlpha = 0.2;
				ctx2.fillStyle = "#FF0";
				ctx2.fillRect(0, 64, 64, 64);
				ctx2.globalAlpha = 1.0;
			}
			if (paletteLeft) {
				ctx2.globalAlpha = 0.2;
				ctx2.fillStyle = "#FF0";
				ctx2.fillRect(0, 64, 32, 64);
				ctx2.globalAlpha = 1.0;
			}
			if (paletteRight) {
				ctx2.globalAlpha = 0.2;
				ctx2.fillStyle = "#FF0";
				ctx2.fillRect(32, 64, 32, 64);
				ctx2.globalAlpha = 1.0;
			}
		} else {
			mapDrawTexture(cursor.palette[i], i - 1, 0, true);
		}
	}
	drawCircle(mapcanvas.width / 2, mapcanvas.height / 2, 1);
	drawCircleGrid(cursor.x + 0.5, cursor.y + 0.5, 0.25, "#fff");
	tileData.innerHTML = JSON.stringify(cursor.palette[0]);
	/*for (let y = 0; y < mapData.height; y++) {
    for (let x = 0; x < mapData.width; x++) {
      let texture = "";
      if (map[y][x].hasOwnProperty("texture")) {
        texture = map[y][x].texture;
      } else if (map[y][x].hasOwnProperty("textureTop")) {
        texture = map[y][x].textureTop;
      }
      if (texture.type === "string") {
      }
    }
  }*/
}
function xGridToScreen(value) {
	return value * camera.gridSize - camera.x * camera.gridSize + mapcanvas.width / 2;
}
function yGridToScreen(value) {
	return value * camera.gridSize - camera.y * camera.gridSize + mapcanvas.height / 2;
}
function mapDrawTexture(cell, x, y, palette = false) {
	let data;
	let data2;
	let drawWidth = 1;
	if (cell.hasOwnProperty("textureNS")) {
		data = texture[cell.textureNS];
		drawWidth = 0.5;
		if (cell.hasOwnProperty("textureEW")) {
			data2 = texture[cell.textureEW];
		} else {
			if (data.hasOwnProperty("texture")) {
				data2 = texture[cell.texture];
			} else {
				data2 = texture["error"];
			}
		}
	} else if (cell.hasOwnProperty("textureEW")) {
		if (data.hasOwnProperty("texture")) {
			data = texture[cell.texture];
		} else {
			data = texture["error"];
		}
		drawWidth = 0.5;
		data2 = texture[cell.textureEW];
	} else if (cell.hasOwnProperty("texture")) {
		data = texture[cell.texture];
	} else {
		return;
	}
	if (palette) {
		ctx2.drawImage(
			textureSheet,
			data.x,
			data.y,
			data.w,
			data.h,
			x * 64,
			y * 64,
			64 * drawWidth,
			64
		);
		if (data2) {
			ctx2.drawImage(
				textureSheet,
				data2.x,
				data2.y,
				data2.w,
				data2.h,
				(x + 1 - drawWidth) * 64,
				y * 64,
				64 * drawWidth,
				64
			);
		}
	} else {
		mapctx.drawImage(
			textureSheet,
			data.x,
			data.y,
			data.w,
			data.h,
			xGridToScreen(x),
			yGridToScreen(y),
			camera.gridSize * drawWidth,
			camera.gridSize
		);
		if (data2) {
			mapctx.drawImage(
				textureSheet,
				data2.x,
				data2.y,
				data2.w,
				data2.h,
				xGridToScreen(x + 0.5),
				yGridToScreen(y),
				camera.gridSize * drawWidth,
				camera.gridSize
			);
		}
	}
	/*
  let data;
  let textureName;
  let mirror = false;
  if (cell.hasOwnProperty("textureNS")) {
    if (cell.mirror || cell.mirrorNS) {
      mirror = true;
    }
    textureName = cell.textureNS;
    if (cell.hasOwnProperty("textureEW")) {
      textureName = cell.textureNS;
    } else {
    }
  } else {
    textureName = cell.texture;
  }
  if (cell.mirror === true || cell.mirrorNS) {
    // || (!NS && cell.mirrorEW)) {
    textureX = 1 - textureX;
  }
  if (texture.hasOwnProperty(textureName)) {
    if (typeof texture[textureName] === "function") {
      data = texture[textureName]();
    } else {
      data = texture[textureName];
    }
  } else {
    data = texture["error"];
  }*/
}

function loadFile(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status == 200) {
		result = xmlhttp.responseText;
	}
	return result;
}
//test code
window.addEventListener("DOMContentLoaded", testCode());
//window.addEventListener("load", testCode);
function testCode() {
	textureSheet = document.getElementById("textures");
	texture = JSON.parse(loadFile("textures.json"));
	textures.cavasTexture = document.getElementById("canvas2").toDataURL();
	createMap(10, 10);
	render();
	/*
  var intervalCount = 21;
  var interval = setInterval(function () {
    camera.x *= 1.05;
    render();
    if (intervalCount <= 0) {
      clearInterval(interval);
      camera.x = Math.floor(camera.x) + 0.5;
      render();
    }
    intervalCount--;
  }, 100);
  */
	/*
var intervalCount = 20;
var interval = setInterval(function () {
  camera.y++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  if (intervalCount <= 0) {
    clearInterval(interval);
  }
  intervalCount--;
}, 100);*/
}
