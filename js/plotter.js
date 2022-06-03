
// Design 
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
}) 

var slider = document.getElementById("speedSignal");
var speedLabel = document.getElementById("speedLabel");
speedLabel.innerHTML = slider.value; // Display the default slider value

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
var Z = new Array(50);
var freqAxis = new Array(50);

for(let i = 0; i < 50; i++){
    Z[i] = math.complex(Math.cos(Math.PI * (i/50)), Math.sin(Math.PI * (i/50)));
    freqAxis[i] = (Math.PI * (i/50)).toFixed(2);
}

unitArr = new Array

for (let i = 0; i < 1000; i++) {
    unitArr.push(1);
}

var homeNav = document.getElementById("home-nav")
var homeTab = document.getElementById("menu-tab")
var menuDiv = document.getElementById("menu")

var signalNav = document.getElementById("signal-nav");
var signalTab = document.getElementById("signal-tab");
var signalDiv = document.getElementById("signal");

var speed = 400;
var running = false;

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    speedLabel.innerHTML = this.value;
    speed = this.value;
}

// Plot for responses
class Plot {
    constructor(w, h) {
        this.width = w;
        this.height = h;
    }

    plot = (x1, y1, x2, y2, label1, label2) => {
        this.freq = d3.select("#plot1").append("div")
            .attr("id", "freqResp")
            .attr("style",`position: relative;margin: auto;height: ${this.height}px`)
        this.canvas = d3.select("#freqResp").append("canvas")
            .attr("id", "myChart1");

        this.phase = d3.select("#plot2").append("div")
            .attr("id", "phaseResp")
            .attr("style",`position: relative;margin: auto;height: ${this.height}px`)
        this.canvas = d3.select("#phaseResp").append("canvas")
            .attr("id", "myChart2");

        this.ctx1 = document.getElementById('myChart1');
        this.ctx2 = document.getElementById('myChart2');

        let data1 = {
            labels: x1,
            datasets: [{
                label: label1,
                data: y1,
                fill: false,
                borderColor: '#1191ed'
            }]
        }

        let data2 = {
            labels: x2,
            datasets: [{
                label: label2,
                data: y2,
                fill: false,
                borderColor: '#3d11ed'
            }]
        }

        let options = {
            maintainAspectRatio: false,
            animation: false,
            scales : {
                x : {
                    ticks : {
                        sampleSize : 5
                    }
                }
                
            }

        }
        var myChart1 = new Chart(this.ctx1, {
            type: 'line',
            options: options,
            data: data1
        });

        var myChart2 = new Chart(this.ctx2, {
            type: 'line',
            options: options,
            data: data2
        });

        return {myChart1 , myChart2 };
    }
    
    destroy = () => {
        d3.select("#myChart1").remove();
        d3.select("#freqResp").remove()
        d3.select("#myChart2").remove();
        d3.select("#phaseResp").remove()
    }
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

// Draw magnitude & phase response
function drawResponse(){
    
    plt.destroy();
    
    let poles = zplane.get_poles();
    let zeros = zplane.get_zeros();
    let allPass = zplane.get_allPass();

    console.table(allPass);

    magResponse = [];
    phaseResponse = [];

    for(let i = 0; i < 50; i++){

        let magPoint = math.complex(1,0); // Initial value (1+0j)
        let phasePoint = math.complex(1,0); // Initial value (1+0j)

        // Calc. zeros
        for(let j = 0; j < zeros.length; j++){
            let temp = math.subtract(Z[i], math.complex(zeros[j][0], zeros[j][1]));
            if(!(inRange(zeros[j][0], -0.01, 0.01) && inRange(zeros[j][1], -0.01, 0.01))){
                magPoint *= temp.abs();
            }else{
                magPoint *= 1;
            }
            phasePoint *= temp.arg();
        }
        
        // Calc. poles
        for(let j = 0; j < poles.length; j++){
            let temp = math.subtract(Z[i], math.complex(poles[j][0], poles[j][1]));
            if(!(inRange(poles[j][0], -0.01, 0.01) && inRange(poles[j][1], -0.01, 0.01))){                
                magPoint /= temp.abs();
            }else{
                magPoint /= 1;
            }
            phasePoint /= temp.arg();
        }

        // Calc. AllPass
        for(let j = 0; j < allPass.length; j++){                           
            let temp = math.subtract(Z[i], math.complex(allPass[j][0], allPass[j][1]));
            phasePoint /= temp.arg();
        }

        magResponse.push(magPoint);
        phaseResponse.push(phasePoint);
    }

    charts = plt.plot(freqAxis, magResponse, freqAxis, phaseResponse, "Magnitude", "Phase");

}

const drawResponseOfAllPass = () => {
    let poles = zplane_allPass.get_poles();
    let zeros = zplane_allPass.get_zeros();

    phaseResponse = [];


    for(let i = 0; i < 50; i++){

        let phasePoint = math.complex(1,0); // Initial value (1+0j)

        // Calc. zeros
        for(let j = 0; j < zeros.length; j++){
            let temp = math.subtract(Z[i], math.complex(zeros[j][0], zeros[j][1]));
            phasePoint *= temp.arg();
        }
        
        // Calc. poles
        for(let j = 0; j < poles.length; j++){
            let temp = math.subtract(Z[i], math.complex(poles[j][0], poles[j][1]));
            phasePoint /= temp.arg();
        }

        phaseResponse.push(phasePoint);
    }

    var allPassData = {
        x: freqAxis,
        y: phaseResponse,
        type: 'scatter',
        name: 'AllPass',
        line: {shape: 'spline'}
    };

    var Layout = {
        title: 'AllPass',
        showlegend: true
    };
       
    Plotly.newPlot('allpass-signal-plot', [allPassData], Layout);

}

// Plot loaded data
function plotLoadedData(){
    var originalData = {
        x: xloadedData,
        y: yloadedData,
        type: 'scatter',
        name:'Your Data',
        line: {shape: 'spline'}
        };
       
    Plotly.newPlot('original-signal-plot', [originalData]);
}

// Get filtered data
async function getFilteredData(){
    // Get zeros & poles
    let poles = zplane.get_poles();
    let zeros = zplane.get_zeros();
    
    infoDict = {
        "loadedData": JSON.stringify(yloadedData),
        "zeros": JSON.stringify(zeros),
        "poles": JSON.stringify(poles)
    };

    var { 'filteredData': yFilteredData } = await sendToServer(
        `${BASE_URL}/filter`, infoDict
    );

    return yFilteredData
}

// Plot filtered data
async function plotFilteredData(){

    yFilteredData = await getFilteredData();
    
    if (!running) {
        Plotly.newPlot('original-signal-plot', [{
            y: [yloadedData[0]],
            mode: 'lines',
            line: {color: '#80CAF6'}
        }]);
    
        Plotly.newPlot('filtered-signal-plot', [{
            y: [yFilteredData[0]],
            mode: 'lines',
            line: {color: '#80CAF6'}
        }]);
        updateData(yloadedData, yFilteredData, 50);
        document.getElementById("running").classList.add("hidden")
    }else{
        document.getElementById("running").classList.remove("hidden")
    }
}

function updateData(yOriginal, yFiltered, lengthStart){    
    running = true;
    slider.disabled = true;

    var cnt = 0;
    var i = 1;

    var interval = setInterval(function() {      
        Plotly.extendTraces('original-signal-plot', {
            y: [[yOriginal[i]]]
        }, [0]);

        Plotly.extendTraces('filtered-signal-plot', {
            y: [[yFiltered[i]]]
        }, [0]);

        if (i <= yOriginal.length) {
            cnt++;
        }else{
            clearInterval(interval);
            running = false;
            slider.disabled = false;
        }
        
        if(cnt > lengthStart) {
            Plotly.relayout('original-signal-plot',{
                xaxis: {
                    range: [cnt-lengthStart,cnt]
                }
            });

            Plotly.relayout('filtered-signal-plot',{
                xaxis: {
                    range: [cnt-lengthStart,cnt]
                }
            });
        };

        i++;
    }, speed);

}

function plotFirstTime(title,divId){

    var Data = {
        y: unitArr,
        type: 'scatter',
        name: title,
        line: {shape: 'spline'}
        };
    
    var Layout = {
        title: title,
        showlegend: true
    };
            
    Plotly.newPlot(divId, [Data], Layout);
}

plotFirstTime('Original Data', 'original-signal-plot');
plotFirstTime('Filtered Data', 'filtered-signal-plot');
plotFirstTime('AllPass', 'allpass-signal-plot');