
// Design 
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
}) 

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

// Loaded data
xloadedData = new Array
yloadedData = new Array
// Response data
magResponse = new Array
phaseResponse = new Array
// Filtered data
yfilteredData = new Array

zeros = new Array // Zeros positions array
var zerosNumber = 0;
poles = new Array // Poles positions array
var polesNumber = 0;

//  Variables for mag and phase responses
var Z = new Array(100);
var freqAxis = new Array(100);

for(let i = 0; i < 100; i++){
    Z[i] = math.complex(Math.cos(Math.PI * (i/100)), Math.sin(Math.PI * (i/100)));
    freqAxis[i] = Math.PI * (i/100);
}

function getCol(matrix, col){
    var column = [];
    for(var i=0; i<matrix.length; i++){
       column.push(matrix[i][col]);
    }
    return column;
}

function linspace(startValue, stopValue, cardinality) {
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
}

function inRange(number, start, end){
    if (number >= start && number <= end) {
        return true;
    }
    return false;
}

function performClick(elemId) {
    var elem = document.getElementById(elemId);
    if(elem && document.createEvent) {
       var evt = document.createEvent("MouseEvents");
       evt.initEvent("click", true, false);
       elem.dispatchEvent(evt);
    }
    readCsv();
 }

function readCsv(){
    const input = document.getElementById("files");
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
        loadData(e.target.result);
    }

    input.onchange = (e) => {
        const [file] = e.target.files
        fileReader.readAsBinaryString(file)
    }
}

function loadData(results){

    finalArray = new Array
    resultsArray = results.split("\n");

    for (let i = 0; i < resultsArray.length; i++) {
        withoutSpace = resultsArray[i].replace('\r', '');
        withoutDel =  withoutSpace.split(",")
        finalRow = new Array
        for (let i = 0; i < 2; i++) {
            var element = parseFloat(withoutDel[i])
            if (!isNaN(element)) {
                finalRow.push(element);
            }else{
                break;
            }
        }
        if (finalRow.length >= 2) {
            finalArray.push(finalRow);
        }
    }    
    xloadedData = getCol(finalArray, 0);
    yloadedData = getCol(finalArray, 1);

    plotLoadedData();
}

// Clear all points
function clearAllPoints() {

    for (let i = 0; i < zerosNumber; i++) {
        var zeroDiv = document.getElementById('zero-' + i);
        zeroDiv.remove();
    }

    for (let i = 0; i < polesNumber; i++) {
        var poleDiv = document.getElementById('pole-' + i);
        poleDiv.remove();
    }

    poles = [];
    zeros = [];
    polesNumber = 0;
    zerosNumber = 0;
    drawZplane(poles, zeros);
}

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

// this var will hold the index of the selected point in zplane
var selectedPoint = -1;

// handle mousedown events
// iterate through texts[] and see if the user
// mousedown'ed on one of them
// If yes, set the selectedText to the index of that text
function handleMouseDown(e) {
    e.preventDefault();
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    // // console.log("you selected point [" + startX + ", " + startY + "]");
    // // console.log("which is point [" + (startX+70)/100 + ", " + -(startY-150)/100 + "]");

    // // console.log("poles number is " + poles.length);
    // // console.log("zeros number is " + zeros.length);
    totalLength = polesNumber + zerosNumber;
    // Put your mousedown stuff here
    for (var i = 0; i < totalLength; i++) {
        if (pointHittest((startX+70)/100, -(startY-150)/100, i)) {
            selectedPoint = i;
            if(i >= polesNumber){
                // console.log("selected zero" + (i - polesNum));
            }else if(i < polesNumber){
                // console.log("selected pole" + (i));
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
    // // console.log("Mouse is Moving!...");
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
    // console.log("you selected point [" + startX + ", " + startY + "]");
    // console.log("which is point [" + (startX+70)/100 + ", " + -(startY-150)/100 + "]");

    // console.log("poles number is " + poles.length);
    // console.log("zeros number is " + zeros.length);
    totalLength = polesNumber + zerosNumber;
    // Put your mousedown stuff here
    for (var i = 0; i < totalLength; i++) {
        if (pointHittest((startX+70)/100, -(startY-150)/100, i)) {
            if(i >= polesNumber){
                zeros.splice(i - polesNumber, 1);
                zerosNumber = zerosNumber -1;
                // console.log("selected zero" + (i - polesNum));
            }else if(i < polesNumber){
                poles.splice(i, 1);
                polesNumber = polesNumber -1;
                // console.log("selected pole" + (i));
            }
        }
    }

    drawZplane(poles, zeros);
}

// test if x,y is inside the bounding box of texts[textIndex]
function pointHittest(x, y, textIndex) {
    
    // Edit
    x -= 2.71 ;
    y += 0.55;

    console.log(x,y);

    if(textIndex >= polesNumber){
        return insideElement(x, y, zeros[textIndex - polesNumber]);
    }

    if(textIndex < polesNumber){
        return insideElement(x, y, poles[textIndex]);
    }
}

// Check if click inside the point
function insideElement(x, y, point) {
    
    padd = 0.1
    xPoint = point[0]
    yPoint = point[1]

    if ((x > xPoint - padd) && (x <= xPoint + padd) && (y > yPoint - padd) && (y <= yPoint + padd)) {
            return true
    }

    return false;
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

    magResponse = [];
    phaseResponse = [];

    for(let i = 0; i < 100; i++){

        let magPoint = math.complex(1,0); // Initial value (1+0j)
        let phasePoint = math.complex(1,0); // Initial value (1+0j)

        // Calc. zeros
        for(let j = 0; j < zeros.length; j++){
            if(!(inRange(zeros[j][0], -0.01, 0.01) && inRange(zeros[j][1], -0.01, 0.01))){
                let temp = math.subtract(Z[i], math.complex(zeros[j][0], zeros[j][1]));
                magPoint *= temp.abs();
                phasePoint *= temp.arg();
            }else{
                magPoint *= 1;
                phasePoint *= 1;
            }
        }
        
        // Calc. poles
        for(let j = 0; j < poles.length; j++){
            if(!(inRange(poles[j][0], -0.01, 0.01) && inRange(poles[j][1], -0.01, 0.01))){                
                let temp = math.subtract(Z[i], math.complex(poles[j][0], poles[j][1]));
                magPoint /= temp.abs();
                phasePoint /= temp.arg();
            }else{
                magPoint /= 1;
                phasePoint /= 1;
            }
        }

        magResponse.push(magPoint);
        phaseResponse.push(phasePoint);
    }
    
    var magnitudeData = {
        x: freqAxis,
        y: magResponse,
        type: 'scatter',
        name:'magnitude response',
        line: {shape: 'spline'}
        };
    
    var layoutMagnitude = {
        title: 'Magnitude response',
        showlegend: true
    };

    var phaseData = {
        x: freqAxis,
        y: phaseResponse,
        type: 'scatter',
        name:'phase response',
        line: {shape: 'spline'}
    };

    var layoutPhase = {
        title: 'Phase response',
        showlegend: true
    };
    
    Plotly.newPlot('magnitude-plot', [magnitudeData], layoutMagnitude);
    Plotly.newPlot('phase-plot', [phaseData], layoutPhase);

    plotLoadedData();
}

function calcFilterData(){
    coefSysY = new Array(poles.length);
    coefSysX = new Array(zeros.length);

    for (let i = 0; i < coefSysX.length; i++) {
        coefSysX[i] = 0;
    }

    for (let i = 0; i < coefSysY.length; i++) {
        coefSysY[i] = 0;
    }

    for (let i = 0; i < yfilteredData.length; i++) {
        for (let j = 1; j < coefSysX.length; j++) {
            if (i-j >= 0) {
                yfilteredData[i] += yloadedData[i-j] * coefSysX[j];     
            }
        }
    }

    for (let i = 0; i < yfilteredData.length; i++) {
        for (let j = 0; j < coefSysY.length; j++) {
            if (i-j >= 0) {
                yfilteredData[i] += yfilteredData[i-j] * coefSysY[j];     
            }else{
                yfilteredData[i] = 0;
            }
        }
    }

    return yfilteredData
}

// Draw loaded and filtered data
function plotLoadedData(){

    var originalData = {
        x: xloadedData,
        y: yloadedData,
        type: 'scatter',
        name:'Your Data',
        line: {shape: 'spline'}
        };
    
    var originalLayout = {
        title: 'Your Data',
        showlegend: true
    };

    /////////////////////////////////////////

    yfilteredData = calcFilterData();
    var filteredData = {
        x: xloadedData,
        y: yfilteredData,
        type: 'scatter',
        name:'Filtered Data',
        line: {shape: 'spline'}
    };

    var filteredLayout = {
        title: 'Filtered Data',
        showlegend: true
    };  
            
    Plotly.newPlot('original-signal-plot', [originalData], originalLayout);
    Plotly.newPlot('filtered-signal-plot', [filteredData], filteredLayout);
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
// Draw Data
plotLoadedData();