
// Initilize variable

// Z-plane plot
var $zPlane = $("#z-plane");
var canvasOffset = $zPlane.offset();
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
var scrollX = $zPlane.scrollLeft();
var scrollY = $zPlane.scrollTop();


// Magnitude plot
var $magnitudePlot = $("#magnitude-plot");
// Phase plot
var $phasePlot = $("#phase-plot");

zeros = new Array // Zeros positions array
poles = new Array // Poles positions array
zeros.push([0.5, 0]);
zeros.push([0, 0.5]);

poles.push([0.5, 0.5]);
poles.push([0.75, 0]);

var zerosNumber = 0;
var polesNumber = 0;


// Clear all points
function clearAllPoints() {
    poles = [];
    zeros = [];
    polesNumber = 0;
    zerosNumber = 0;
    drawZplane(poles, zeros);
}

// Clear All Zeros
function clearZeros() {
    zeros = [];
    zerosNumber = 0;
    setZplane(poles, zeros);
}

// Clear All Poles
function clearPoles() {
    poles = [];
    polesNumber = 0;
    setZplane(poles, zeros);
}


// this var will hold the index of the selected point in zplane
var selectedPoint = -1;

// test if x,y is inside the bounding box of texts[textIndex]
function pointHittest(x, y, textIndex) {
    console.log("poles.length is " + poles.length);
    if(textIndex >= polesNumber){
        console.log("check some zero!");
        return (x >= zeros[textIndex - polesNumber][0] - 0.2 && x <= zeros[textIndex - polesNumber][0] + 0.2 && y >= zeros[textIndex - polesNumber][1] - 0.2 && y <= zeros[textIndex - polesNumber][1] + 0.2);
    }
    if(textIndex < polesNumber){
        console.log("check some pole!");
        return (x >= poles[textIndex][0] - 0.05 && x <= poles[textIndex][0] + 0.05 && y >= poles[textIndex][1] - 0.05 && y <= poles[textIndex][1] + 0.05);
    }
}

// handle mousedown events
// iterate through texts[] and see if the user
// mousedown'ed on one of them
// If yes, set the selectedText to the index of that text
function handleMouseDown(e) {
    e.preventDefault();
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    console.log("you selected point [" + startX + ", " + startY + "]");
    console.log("which is point [" + (startX+70)/100 + ", " + -(startY-150)/100 + "]");

    console.log("poles number is " + poles.length);
    console.log("zeros number is " + zeros.length);
    totalLength = polesNumber + zerosNumber;
    // Put your mousedown stuff here
    for (var i = 0; i < totalLength; i++) {
        if (pointHittest((startX+70)/100, -(startY-150)/100, i)) {
            selectedPoint = i;
            if(i >= polesNumber){
                console.log("selected zero" + (i - polesNum));
            }else if(i < polesNumber){
                console.log("selected pole" + (i));
            }
        }
    }
}

// handle mousemove events
// calc how far the mouse has been dragged since
// the last mousemove event and move the selected text
// by that distance
function handleMouseMove(e) {
    if (selectedPoint < 0) {
        return;
    }
    // console.log("Mouse is Moving!...");
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    // Put your mousemove stuff here
    var dx = (mouseX - startX)/100;
    var dy = -(mouseY - startY)/100;
    
    startX = mouseX;
    startY = mouseY;
    
    if(selectedPoint >= poles.length){
        zeros[selectedPoint - poles.length][0] += dx;
        zeros[selectedPoint - poles.length][1] += dy;
    }else if(selectedPoint < poles.length){
        poles[selectedPoint][0] += dx;
        poles[selectedPoint][1] += dy;
    }
    // addNewPole([dx, dy]);
    drawZplane(poles, zeros);
}

// done dragging
function handleMouseUp(e) {
    e.preventDefault();
    selectedPoint = -1;
}

// also done dragging
function handleMouseOut(e) {
    e.preventDefault();
    selectedPoint = -1;
}

// clicked pole or zero -> delete it
function handleMouseClick(e) {
    // e.preventDefault();
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    console.log("you selected point [" + startX + ", " + startY + "]");
    console.log("which is point [" + (startX+70)/100 + ", " + -(startY-150)/100 + "]");

    console.log("poles number is " + poles.length);
    console.log("zeros number is " + zeros.length);
    totalLength = polesNumber + zerosNumber;
    // Put your mousedown stuff here
    for (var i = 0; i < totalLength; i++) {
        if (pointHittest((startX+70)/100, -(startY-150)/100, i)) {
            if(i >= polesNumber){
                zeros.splice(i - polesNumber, 1);
                zerosNumber = zerosNumber -1;
                console.log("selected zero" + (i - polesNum));
            }else if(i < polesNumber){
                poles.splice(i, 1);
                polesNumber = polesNumber -1;
                console.log("selected pole" + (i));
            }
        }
    }

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

// Draw magnitude & phase response
function drawResponse(){
    var magnitudeData = {
        x: [1, 2, 3, 4],
        y: [10, 15, 13, 17],
        type: 'scatter'
        };
        
    var phaseData = {
        x: [1, 2, 3, 4],
        y: [10, 15, 13, 17],
        type: 'scatter'
    };
        
            
    Plotly.newPlot('magnitude-plot', [magnitudeData]);
    Plotly.newPlot('phase-plot', [phaseData]);
        
}



// listen for mouse events
$zPlane.mousedown(function (e) {
    handleMouseDown(e);
});
$zPlane.mousemove(function (e) {
    handleMouseMove(e);
});
$zPlane.mouseup(function (e) {
    handleMouseUp(e);
});
$zPlane.mouseout(function (e) {
    handleMouseOut(e);
});
$zPlane.dblclick(function (e) {
    handleMouseClick(e);
});

// Draw Z plane
drawZplane(poles, zeros);