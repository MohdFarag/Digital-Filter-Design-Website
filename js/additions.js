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


function complexArrayToArray(inputList){
    outputList = new Array

    inputList.forEach(element => {
        real = element[0];
        outputList.push(real);
    });

    return outputList
}