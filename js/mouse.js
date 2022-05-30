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
    
    totalLength = polesNumber + zerosNumber;
    // Put your mousedown stuff here
    for (var i = 0; i < totalLength; i++) {
        if (pointHittest((startX+70)/100, -(startY-150)/100, i)) {
            selectedPoint = i;
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

    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);
    
    totalLength = polesNumber + zerosNumber;
    // Put your mousedown stuff here
    for (var i = 0; i < totalLength; i++) {
        if (pointHittest((startX+70)/100, -(startY-150)/100, i)) {
            if(i >= polesNumber){
                zeros.splice(i - polesNumber, 1);
                zerosNumber = zerosNumber -1;
            }else if(i < polesNumber){
                poles.splice(i, 1);
                polesNumber = polesNumber -1;
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

// Listen for mouse events
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
