
BASE_URL = "http://127.0.0.1:9000"

// Design 
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
}) 

// Magnitude plot
var $magnitudePlot = $("#magnitude-plot");
// Phase plot
var $phasePlot = $("#phase-plot");

// Initilize variable

// Loaded data
xloadedData = new Array
yloadedData = new Array

// Filtered Data
yFilteredData = new Array

// Response data
magResponse = new Array
phaseResponse = new Array


//  Variables for mag and phase responses
var Z = new Array(100);
var freqAxis = new Array(100);

var homeNav = document.getElementById("home-nav")
var homeTab = document.getElementById("menu-tab")
var menuDiv = document.getElementById("menu")

var signalNav = document.getElementById("signal-nav");
var signalTab = document.getElementById("signal-tab");
var signalDiv = document.getElementById("signal");


for(let i = 0; i < 100; i++){
    Z[i] = math.complex(Math.cos(Math.PI * (i/100)), Math.sin(Math.PI * (i/100)));
    freqAxis[i] = Math.PI * (i/100);
}

// Get the click on browse
function performClick(elemId) {
    var elem = document.getElementById(elemId);
    if(elem && document.createEvent) {
       var evt = document.createEvent("MouseEvents");
       evt.initEvent("click", true, false);
       elem.dispatchEvent(evt);
    }
    readCsv();
}

// Read Csv
function readCsv(){
    const input = document.getElementById("files");
    const fileReader = new FileReader()
    fileReader.onload = (e) => {
        convertData(e.target.result);
    }

    input.onchange = (e) => {
        const [file] = e.target.files
        fileReader.readAsBinaryString(file)
    }
}

// Convert Data to js list
function convertData(results){

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
    
    signalNav.classList.add('visible')
    signalNav.classList.remove('hidden')

    signalTab.classList.add('active')
    homeTab.classList.remove('active')

    signalDiv.classList.add('show','active')
    menuDiv.classList.remove('show','active')

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
            
    Plotly.newPlot('original-signal-plot', [originalData], originalLayout);
}


async function sendToServer(url = '', data = {}) {
    var response = await fetch(url, {
        method: 'POST',
        mode: "cors",
        body: JSON.stringify(data),
    })

    return response.json()
}

async function plotFilteredData(){

    infoDict = {
        "loadedData": JSON.stringify(yloadedData),
        "zeros": JSON.stringify(zeros),
        "poles": JSON.stringify(poles)
    };

    console.log(infoDict)

    var { 'filteredData': yFilteredData } = await sendToServer(
        `${BASE_URL}/filter`, infoDict
    );

    var filteredData = {
        x: xloadedData,
        y: yFilteredData,
        type: 'scatter',
        name:'Filtered Data',
        line: {shape: 'spline'}
    };

    var filteredLayout = {
        title: 'Filtered Data',
        showlegend: true
    };  
    Plotly.newPlot('filtered-signal-plot', [filteredData], filteredLayout);
}

function updatePlotData(){
    var arrayLength = 30
    var newArray = []

    for(var i = 0; i < arrayLength; i++) {
        var y = Math.round(Math.random()*10) + 1
        newArray[i] = y
    }

    Plotly.newPlot('myDiv', [{
    y: newArray,
    mode: 'lines',
    line: {color: '#80CAF6'}
    }]);

    var cnt = 0;

    var interval = setInterval(function() {

    var y = Math.round(Math.random()*10) + 1
    newArray = newArray.concat(y)
    newArray.splice(0, 1)

    var data_update = {
        y: [newArray]
    };

    Plotly.update('myDiv', data_update)

    if(++cnt === 100) clearInterval(interval);
    }, 1000); 
}

// Draw Data
plotLoadedData();
plotFilteredData();
