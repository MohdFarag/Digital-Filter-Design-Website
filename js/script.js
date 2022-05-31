// Draw Z plane
let zplane = new Zplane(350, 350);

let allPassValues = [];
// Your beautiful D3 code will go here
zplane.plot_axis();

let plt = new Plot(250, 250);
// update plot 
let charts = plt.plot([], [], [], [], "Magnitude", "Phase");

// Zeros & Poles
zeros = zplane.get_zeros() // Zeros positions array
var zerosNumber = 0;

poles = zplane.get_poles() // Poles positions array
var polesNumber = 0;

var allPassFilter = [[1,0.5],[0.5,1],[0,0.5],[0.7,0]] // Default Values


const addPoint = (type) => {
    let re = 0;
    let im = 0;
    if (type == "allPass") {
        //add to our lib
        let c = math.complex(re, im);
        var sel = document.getElementById('allPass');
        // create new option element
        var opt = document.createElement('option');
        // create text node to add to option element (opt)
        opt.appendChild(document.createTextNode(c.toString()));
        // set value property of opt
        opt.value = c.toString();
        sel.appendChild(opt);
    }else{
        conjugate = document.getElementById('conjugate').checked;

        if (conjugate) {
            type = "conj" + type
        }else{
            type = "nonConj" + type
        }
    }

    zplane.add_point([re, im], type);
    drawResponse();
}

zplane.function_during_drag = drawResponse;
zplane.function_during_delete = drawResponse;

const delete_poles = () => {
    zplane.delete_poles();
    drawResponse();
}
const delete_zeros = () => {
    zplane.delete_zeros();
    drawResponse();
}
const delete_all = () => {
    zplane.delete_all();
    drawResponse();
}

{/*
<div class="col-1">
    <img id="filter-a" class="img-thumbnail" height="43" width="43" src="" />
    <label style="font-size: 23px;" for="filter-a">1+0.5j</label>
</div> 
*/}
const addAllPassFiltersList = () => {
    for (let i = 0; i < allPassFilter.length; i++) {
        addPassFilter(i,allPassFilter[i][0],allPassFilter[i][1])
    }
}

const addPassFilter = (i, real, imag ) => {

    allPassFilterMenu = document.getElementById("allPass-filter-menu");
    
    var newPassDiv = document.createElement('div');
    newPassDiv.classList.add('col-1');

    var newPasslink = document.createElement('a');
    newPasslink.href = "#"
    newPasslink.id = `pass-${i}`;
    var newPassImg = document.createElement('img');
    newPassImg.src = './images/a.png';
    newPassImg.width = '43';
    newPassImg.height = '43';
    newPassImg.classList.add('img-thumbnail');
    newPasslink.appendChild(newPassImg)
    
    var newPassLabel = document.createElement('label');
    newPassLabel.style = 'font-size: 23px;padding-left:5px';
    newPassLabel.innerHTML = `${real}+${imag}j`

    newPassDiv.appendChild(newPasslink)
    newPassDiv.appendChild(newPassLabel)
    
    var target = document.getElementById('form-add-pass');

    target.parentNode.insertBefore(newPassDiv, target)       

    newPasslink.addEventListener("click", function(){
        if (newPassImg.getAttribute('src') == "./images/a.png") {
            // Set style
            newPassImg.src = "./images/ared.png";
            newPassLabel.style.color = "red";
            
            real = allPassFilter[i][0]
            imag = allPassFilter[i][1]

            zplane.add_point([real, imag], zplane.types.allPass);
            drawResponse();

        }else{
            newPassImg.src = "./images/a.png";
            newPassLabel.style.color = "black";
        }
    });
}

const addNewPassFilter = () =>{

    // Add Html
    if (allPassFilter.length >= 8) {

        return
    }
    var passReal = document.getElementsByName('passReal')[0].value
    var passImag = document.getElementsByName('passImag')[0].value
    if (passReal == "") {
        passReal = 0;
    }
    if (passImag == "") {
        passImag = 0;
    }
    addPassFilter(allPassFilter.length, passReal, passImag)
    
    // Add to Js list
    allPassFilter.push([passReal,passImag])

}


addAllPassFiltersList()