// Initilize variable
// Z-plane plot
var $zPlane = $("#z-plane");
var canvasOffset = $zPlane.offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
var scrollX = $zPlane.scrollLeft();
var scrollY = $zPlane.scrollTop();

zeros = new Array // Zeros positions array
var zerosNumber = 0;
poles = new Array // Poles positions array
var polesNumber = 0;

// Clear all zeros
function clearZeros() {

    for (let i = 0; i < zerosNumber; i++) {
        var zeroDiv = document.getElementById('zero-' + i);
        zeroDiv.remove();
    }

    zeros = [];
    zerosNumber = 0;
    drawZplane(poles, zeros);
}

// Clear all poles
function clearPoles() {

    for (let i = 0; i < polesNumber; i++) {
        var poleDiv = document.getElementById('pole-' + i);
        poleDiv.remove();
    }

    poles = [];
    polesNumber = 0;
    drawZplane(poles, zeros);
}

// Add new pole to Z plane
function addNewPole() {
    points = document.getElementById("poles");
    var div = document.createElement("div");
    div.id = 'pole-' + polesNumber;
    points.appendChild(div);
    poles.push([0, 0]);
    polesNumber = polesNumber + 1;
    drawZplane(poles, zeros);
}

function addNewZero() {
    points = document.getElementById("zeros");
    var div = document.createElement('div');
    div.id = 'zero-' + zerosNumber;
    points.appendChild(div);
    zeros.push([0, 0]);
    zerosNumber = zerosNumber + 1;
    drawZplane(poles, zeros);
}


// Draw Z plane
function drawZplane(poles, zeros) {

	var radius = 100;	// radius of unit circle
	var pSize = 5;		// size of pole
	var zSize = 5;      // size of zero

	var zPlane = document.getElementById("z-plane"); // Get z Plane canvas element
	var ctx = zPlane.getContext("2d");
	
    // Clear the canvas
	ctx.clearRect(0, 0, zPlane.width, zPlane.height);

	var pad = (zPlane.width - 2 * radius) / 2; // padding on each side
	
	// unit circle
	ctx.beginPath();
	ctx.strokeStyle="red";
	ctx.arc(radius+pad,radius+pad,radius,0,2*Math.PI);
	ctx.stroke();

	// y axis
	ctx.beginPath(); 
	ctx.strokeStyle="lightgray";
	ctx.moveTo(radius+pad,0);
	ctx.lineTo(radius+pad, zPlane.height);
	ctx.font = "italic 8px sans-serif";
	ctx.fillText("Im", radius+pad+2, pad-2);

	// x axis
	ctx.moveTo(0,radius+pad);
	ctx.lineTo(zPlane.width,radius+pad);
	ctx.fillText("Re", radius+radius+pad+2, radius+pad-2);
	ctx.stroke(); // Draw it

	// poles
	ctx.strokeStyle="blue";
	var idx;
	for (idx = 0; idx < poles.length; idx++) {
		let x = radius + Math.round(radius * poles[idx][0]);
		let y = radius - Math.round(radius * poles[idx][1]);
		ctx.beginPath();
		ctx.moveTo(x - pSize + pad, y - pSize + pad);
		ctx.lineTo(x + pSize + pad, y + pSize + pad);
		ctx.moveTo(x - pSize + pad, y + pSize + pad);
		ctx.lineTo(x + pSize + pad, y - pSize + pad);
		ctx.stroke();
	}
	
	// zeros
	for (idx = 0; idx < zeros.length; idx++) {
		let x = radius + Math.round(radius * zeros[idx][0]);
		let y = radius - Math.round(radius * zeros[idx][1]);
		ctx.beginPath();
		ctx.arc(x + pad, y + pad, zSize, 0, 2*Math.PI);
		ctx.stroke();
	}

    drawResponse();
}

// Draw Z plane
drawZplane(poles, zeros);
