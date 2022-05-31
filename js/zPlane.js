class Zplane {

    // Constructor => needs width and height
    constructor(width, height) {
        
        // Equation x**2 + y**2 = 1
        this.w = width;
        this.h = height;

        this.padding = 30;
        this.dataSet = [];

        // Get middle of the circle
        this.middlePointOf_x = width / 2;
        this.middlePointOf_y = height / 2;

        // add svg element 
        this.svg = d3.select("#circle")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "zPlane");

        // set our scale
        // scale x
        this.xNegativScale = d3.scaleLinear().domain([-1, 0]).range([this.padding, this.middlePointOf_x]);
        this.xPositiveScale = d3.scaleLinear().domain([0, 1]).range([this.middlePointOf_x, this.w - this.padding]);
        //scale y 
        this.yNegativScale = d3.scaleLinear().domain([0, -1]).range([this.middlePointOf_y, this.h - this.padding]);
        this.yPositiveScale = d3.scaleLinear().domain([0, 1]).range([this.middlePointOf_y, this.padding]);

        // set up x axis
        this.xPositiveAxis = d3.axisBottom(this.xPositiveScale).tickValues([0.2, 0.4, 0.6, 0.8])
        this.xNegativeAxis = d3.axisBottom(this.xNegativScale).tickValues([-0.2, -0.4, -0.6, -0.8]);
        // set up y axis
        this.yPositiveAxis = d3.axisLeft(this.yPositiveScale).tickValues([0.2, 0.4, 0.6, 0.8]);
        this.yNegativeAxis = d3.axisLeft(d3.scaleLinear().domain([0, -1]).range([this.middlePointOf_y, this.h - this.padding]))
            .tickValues([-0.2, -0.4, -0.6, -0.8]);
        // draw tha main circle
        this.svg.append("circle").attr("cx", this.middlePointOf_x).attr("cy", this.middlePointOf_y).attr("r", this.middlePointOf_x - this.padding)
            .attr("stroke", "rgb(115, 115, 115)")
            .attr("stroke-width", "1.8")
            .attr("fill", "none");

        this.types = {
            nonConjPole: "nonConjPole",
            nonConjZero: "nonConjZero",
            conjPole: "conjPole",
            conjZero: "conjZero",
            allPass: "allPass"
        };

        this.function_during_drag = undefined;
        this.function_during_delete = undefined;
    }

    // get all zeros
    get_zeros = () => {
        let points = this.dataSet.filter((point) => (point.type === this.types.nonConjZero) || (point.type === this.types.conjZero));
        return points.map((point) => point["point"]);
    }
    
    // get all poles
    get_poles = () => {
        let points = this.dataSet.filter((point) => (point.type === this.types.nonConjPole) || (point.type === this.types.conjPole));
        return points.map((point) => point["point"]);
    }
	
    // get all pass
    get_allPass = () => {
        let points = this.dataSet.filter((point) => point.type === this.types.allPass);
        return points.map((point) => point["point"]);

    }

    // delete all zeros 
    delete_zeros = () => {
        //delete all zeros from dataSet
        for (let i = 0; i < this.dataSet.length; i++) {
            if ((this.dataSet[i].type === this.types.nonConjZero) || (this.dataSet[i].type === this.types.conjZero)) {
                this.dataSet.splice(i, 1);
                i--;
            }
        }
        // get all points with type nonConjZero and conjZero in dom and delete it 
        document.querySelectorAll(".point").forEach(node => {
            if ((node.getAttribute("type") === this.types.nonConjZero) ||
                (node.getAttribute("type") === this.types.conjZero)) {
                node.remove();
            }
        });
    }
	
    // delete all poles
    delete_poles = () => {
        //delete all poles from dataSet
        for (let i = 0; i < this.dataSet.length; i++) {
            if ((this.dataSet[i].type === this.types.nonConjPole) || (this.dataSet[i].type === this.types.conjPole)) {
                this.dataSet.splice(i, 1);
                i--
            }
        }
        // get all points with type nonConjZero and conjZero in dom and delete it 
        document.querySelectorAll(".point").forEach(node => {
            if ((node.getAttribute("type") === this.types.nonConjPole) ||
                (node.getAttribute("type") === this.types.conjPole)) {
                node.remove();
            }
        });
    }

	// delete all
    delete_all = () => {
        this.dataSet = [];
        d3.selectAll(".point").data(this.dataSet).exit().remove();
    }
    
    //check if a point is inside the z-plane
    isInside = (xElement, yElement) => {
        let firstPart = (xElement - this.middlePointOf_x) * (xElement - this.middlePointOf_x);
        let secondPart = (yElement - this.middlePointOf_y) * (yElement - this.middlePointOf_y);
        let thirdPart = (this.middlePointOf_x - this.padding) * (this.middlePointOf_x - this.padding);
        let ch = firstPart + secondPart - thirdPart;
        if (ch > 1) return false;
        return true;
    }

    plot_axis() {
        //plot x
        this.svg.append("g").call(this.xPositiveAxis).attr("class", "axis")
            .attr("transform", "translate(0," + this.middlePointOf_y + ")");
        this.svg.append("g").call(this.xNegativeAxis).attr("class", "axis")
            .attr("transform", "translate(0," + this.middlePointOf_y + ")");
        //plot y
        this.svg.append("g").call(this.yPositiveAxis).attr("class", "axis")
            .attr("transform", "translate(" + this.middlePointOf_x + ",0)");
        this.svg.append("g").call(this.yNegativeAxis).attr("class", "axis")
            .attr("transform", "translate(" + this.middlePointOf_x + ",0)");
    }
    add_point = (point, type) => {
        //check if the point exist 
        this.dataSet.push({
            point: point,
            type: type
        });
        let points = this.svg.selectAll(".point").data(this.dataSet);
        if (type == this.types.nonConjPole) {
            points.enter().append("text").text("X").attr("x", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]) - 4;
                } else {
                    v = this.xNegativScale(d["point"][0]) - 4;
                }
                return v;
            }).attr("y", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]) + 6;
                } else {
                    v = this.yNegativScale(d["point"][1]) + 6;
                }
                return v;
            }).attr("class", "point")
                .attr("font-family", "sans-serif")
                .attr("font-size", "15px")
                .attr("fill", "blue")
                .on("mouseover", function (ev) {
                    d3.select(ev.target).attr("fill", "red");
                })
                .on("mouseout", function (ev) {
                    d3.select(ev.target).attr("fill", "blue");
                })
                .on("mousedown", (ev) => {
                    this.isMouseDown = true;
                    this.downElement = ev.target;
                })
                .on("click", (ev) => {
                    //delete point
                    //get point 
                    let xElement = ev.layerX;
                    let yElement = ev.layerY;
                    let point = this.mapFromElementToPlaneCor(xElement, yElement);
                    let pIndex = this.getIndexFromPoint(point);
                    this.dataSet.splice(pIndex, 1);
                    // update 
                    d3.select(ev.target).remove();
                    // generate outside function
                    if (this.function_during_delete !== undefined) {
                        this.function_during_delete();
                    }
                })
                .call(d3.drag()
                    .on("drag", (ev) => {
                        // get value in dataSet
                        let point = ev.subject.point;
                        //change value in current label                        
                        let pIndex = -1;
                        // get point index
                        for (let i = 0; i < this.dataSet.length; i++) {
                            if (this.dataSet[i]["point"] === point) {
                                pIndex = i;
                                break;
                            }
                        }
                        //change value in dataset
                        let xElement = ev.x;
                        let yElement = ev.y;
                        let mPoint = this.mapFromElementToPlaneCor(xElement, yElement);
                        // boundry conditions
                        // if (mPoint[0] < -1) mPoint[0] = -1;
                        // if (mPoint[0] > 1) mPoint[0] = 1;
                        this.dataSet[pIndex].point = [mPoint[0], mPoint[1]];
                        // update position on plan
                        this.update_point(this.dataSet[pIndex].type);
                        // generate outside function
                        if (this.function_during_drag !== undefined) {
                            this.function_during_drag();
                        }
                        d3.select("#current_x").text(mPoint[0].toFixed(3));
                        d3.select("#current_j").text(mPoint[1].toFixed(3));
                    })
                )
                .attr("id", this.dataSet.length - 1)
                .attr("style", "cursor: default;")
                .attr("xPlan", point[0])
                .attr("yPlan", point[1])
                .attr("type", type)
                .merge(points);
        } else if (type == this.types.nonConjZero) {
            points.enter().append("circle").attr("cx", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]);
                } else {
                    v = this.xNegativScale(d["point"][0]);
                }
                return v;
            }).attr("cy", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]);
                } else {
                    v = this.yNegativScale(d["point"][1]);
                }
                return v;
            })
                .attr("r", 5).attr("class", "point")
                .attr("stroke", "blue")
                .attr("stroke-width", "1")
                .attr("fill", "none")
                .on("mouseover", function (ev) {
                    d3.select(ev.target).attr("fill", "red");
                })
                .on("mouseout", function (ev) {
                    d3.select(ev.target).attr("fill", "none");
                })
                .on("click", (ev) => {
                    //delete point
                    //get point 
                    let xElement = ev.layerX;
                    let yElement = ev.layerY;
                    let point = this.mapFromElementToPlaneCor(xElement, yElement);
                    let pIndex = this.getIndexFromPoint(point);
                    this.dataSet.splice(pIndex, 1);
                    // update 
                    d3.select(ev.target).remove();
                    // generate outside function
                    if (this.function_during_delete !== undefined) {
                        this.function_during_delete();
                    }
                })
                .call(d3.drag()
                    .on("drag", (ev) => {
                        // get value in dataSet
                        let point = ev.subject.point;

                        let pIndex = -1;
                        // get point index
                        for (let i = 0; i < this.dataSet.length; i++) {
                            if (this.dataSet[i]["point"] === point) {
                                pIndex = i;
                                break;
                            }
                        }
                        //change value in dataset
                        let xElement = ev.x;
                        let yElement = ev.y;
                        let mPoint = this.mapFromElementToPlaneCor(xElement, yElement);
                        // boundry conditions
                        // if (mPoint[0] < -1) mPoint[0] = -1;
                        // if (mPoint[0] > 1) mPoint[0] = 1;
                        this.dataSet[pIndex].point = [mPoint[0], mPoint[1]];
                        // update position on plan
                        this.update_point(this.dataSet[pIndex].type);
                        // generate outside function
                        if (this.function_during_drag !== undefined) {
                            this.function_during_drag();
                        }
                        d3.select("#current_x").text(mPoint[0].toFixed(3));
                        d3.select("#current_j").text(mPoint[1].toFixed(3));
                    })
                )
                .attr("index", this.dataSet.length - 1)
                .attr("xPlan", point[0])
                .attr("yPlan", point[1])
                .attr("type", type)
                .merge(points);
        } else if (type == this.types.conjPole) {
            // we need to add two points 
            // add conj point
            this.dataSet.push({
                point: [point[0], -1 * point[1]],
                type: type
            });
            points = this.svg.selectAll(".point").data(this.dataSet);
            //console.log(this.dataSet);
            points.enter().append("text").text("X").attr("x", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]) - 4;
                } else {
                    v = this.xNegativScale(d["point"][0]) - 4;
                }
                return v;
            }).attr("y", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]) + 6;
                } else {
                    v = this.yNegativScale(d["point"][1]) + 6;
                }
                return v;
            }).attr("class", "point")
                .attr("font-family", "sans-serif")
                .attr("font-size", "15px")
                .attr("fill", "green")
                .on("mouseover", function (ev) {
                    d3.select(ev.target).attr("fill", "red");
                })
                .on("mouseout", function (ev) {
                    d3.select(ev.target).attr("fill", "green");
                })
                .on("click", (ev) => {
                    //delete point
                    //delete point
                    //get point 
                    let point = [parseFloat(d3.select(ev.target).attr("xPlan")),
                    parseFloat(d3.select(ev.target).attr("yPlan"))
                    ];
                    // console.log(this.dataSet);
                    let pIndex = this.getIndexFromPoint(point);
                    let conIndex = this.getIndexFromPoint([point[0], -1 * point[1]]);
                    // console.log(pIndex,conIndex);
                    this.dataSet.splice(pIndex, 1);
                    this.dataSet.splice(conIndex, 1);
                    document.querySelectorAll(".point").forEach(node => {
                        //console.log(node.getAttribute("xPlan"),point[0]);
                        if (parseFloat(node.getAttribute("xPlan")) === point[0] &&
                            parseFloat(node.getAttribute("yPlan")) === point[1]) {
                            node.remove();
                        }
                        if (parseFloat(node.getAttribute("xPlan")) === point[0] &&
                            parseFloat(node.getAttribute("yPlan")) === -1 * point[1]) {
                            node.remove();
                        }
                    });
                    // generate outside function
                    if (this.function_during_delete !== undefined) {
                        this.function_during_delete();
                    }
                })
                .call(d3.drag()
                    .on("start", (ev) => {
                        // get value in dataSet
                        let point = ev.subject.point;
                        this.pIndex = -1;
                        // get point index
                        for (let i = 0; i < this.dataSet.length; i++) {
                            if (this.dataSet[i]["point"] === point) {
                                this.pIndex = i;
                                break;
                            }
                        }
                        // console.log(this.dataSet);
                        let conPoint = [point[0], -1 * point[1]];
                        // console.log(conPoint);
                        this.conIndex = -1;
                        // get conj point index 
                        for (let i = 0; i < this.dataSet.length; i++) {
                            if (this.dataSet[i]["point"][0] === conPoint[0]
                                &&
                                this.dataSet[i]["point"][1] === conPoint[1]) {
                                this.conIndex = i;
                                break;
                            }
                        }
                    })
                    .on("drag", (ev) => {
                        //change value in dataset
                        let xElement = ev.x;
                        let yElement = ev.y;
                        let mPoint = this.mapFromElementToPlaneCor(xElement, yElement);
                        let mConPoint = [mPoint[0], -1 * mPoint[1]];

                        this.dataSet[this.pIndex].point = [mPoint[0], mPoint[1]];
                        this.dataSet[this.conIndex].point = [mConPoint[0], mConPoint[1]];
                        // update position on plan
                        this.update_point(this.dataSet[this.pIndex].type);
                        // generate outside function
                        if (this.function_during_drag !== undefined) {
                            this.function_during_drag();
                        }
                        d3.select("#current_x").text(mPoint[0].toFixed(3));
                        d3.select("#current_j").text(mPoint[1].toFixed(3));
                    })
                )
                .attr("style", "cursor: default;")
                .attr("xPlan", point[0])
                .attr("yPlan", point[1])
                .attr("type", type)
                .merge(points);
        } else if (type === this.types.conjZero){
            // we need to add two points 
            // add conj point
            this.dataSet.push({
                point: [point[0], -1 * point[1]],
                type: type
            });
            points = this.svg.selectAll(".point").data(this.dataSet);
            points.enter().append("circle").attr("cx", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]);
                } else {
                    v = this.xNegativScale(d["point"][0]);
                }
                return v;
            }).attr("cy", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]);
                } else {
                    v = this.yNegativScale(d["point"][1]);
                }
                return v;
            })
                .attr("r", 5).attr("class", "point")
                .attr("stroke", "green")
                .attr("stroke-width", "1")
                .attr("fill", "none")
                .on("mouseover", function (ev) {
                    d3.select(ev.target).attr("fill", "red");
                })
                .on("mouseout", function (ev) {
                    d3.select(ev.target).attr("fill", "none");
                })
                .on("click", (ev) => {
                    //delete point
                    //get point 
                    let point = [parseFloat(d3.select(ev.target).attr("xPlan")),
                    parseFloat(d3.select(ev.target).attr("yPlan"))
                    ];
                    // console.log(this.dataSet);
                    let pIndex = this.getIndexFromPoint(point);
                    let conIndex = this.getIndexFromPoint([point[0], -1 * point[1]]);
                    // console.log(pIndex,conIndex);
                    this.dataSet.splice(pIndex, 1);
                    this.dataSet.splice(conIndex, 1);
                    document.querySelectorAll(".point").forEach(node => {
                        //console.log(node.getAttribute("xPlan"),point[0]);
                        if (parseFloat(node.getAttribute("xPlan")) === point[0] &&
                            parseFloat(node.getAttribute("yPlan")) === point[1]) {
                            console.log("here");
                            node.remove();
                        }
                        if (parseFloat(node.getAttribute("xPlan")) === point[0] &&
                            parseFloat(node.getAttribute("yPlan")) === -1 * point[1]) {
                            node.remove();
                        }
                    });
                    // generate outside function
                    if (this.function_during_delete !== undefined) {
                        this.function_during_delete();
                    }
                })
                .call(d3.drag()
                    .on("start", (ev) => {
                        // get value in dataSet
                        let point = ev.subject.point;
                        this.pIndex = -1;
                        // get point index
                        for (let i = 0; i < this.dataSet.length; i++) {
                            if (this.dataSet[i]["point"] === point) {
                                this.pIndex = i;
                                break;
                            }
                        }
                        // console.log(this.dataSet);
                        let conPoint = [point[0], -1 * point[1]];
                        // console.log(conPoint);
                        this.conIndex = -1;
                        // get conj point index 
                        for (let i = 0; i < this.dataSet.length; i++) {
                            if (this.dataSet[i]["point"][0] === conPoint[0]
                                &&
                                this.dataSet[i]["point"][1] === conPoint[1]) {
                                this.conIndex = i;
                                break;
                            }
                        }
                    })
                    .on("drag", (ev) => {
                        //change value in dataset
                        let xElement = ev.x;
                        let yElement = ev.y;
                        let mPoint = this.mapFromElementToPlaneCor(xElement, yElement);
                        let mConPoint = [mPoint[0], -1 * mPoint[1]];
                        // boundry conditions
                        // if (!this.isInside(xElement, yElement)) {
                        //     return;
                        // }
                        // if(mPoint[0] < -1) mPoint[0] = -1;
                        // if(mPoint[0] > 1) mPoint[0] = 1;
                        this.dataSet[this.pIndex].point = [mPoint[0], mPoint[1]];
                        this.dataSet[this.conIndex].point = [mConPoint[0], mConPoint[1]];
                        // update position on plan
                        this.update_point(this.dataSet[this.pIndex].type);
                        // generate outside function
                        if (this.function_during_drag !== undefined) {
                            this.function_during_drag();
                        }
                        d3.select("#current_x").text(mPoint[0].toFixed(3));
                        d3.select("#current_j").text(mPoint[1].toFixed(3));
                    })
                )
                .attr("xPlan", point[0])
                .attr("yPlan", point[1])
                .attr("type", type)
                .merge(points);
        } else {
            points = this.svg.selectAll(".point").data(this.dataSet);
            points.enter().append("rect").attr("x", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]) - 5;
                } else {
                    v = this.xNegativScale(d["point"][0]) - 5;
                }
                return v;
            }).attr("y", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]) - 5;
                } else {
                    v = this.yNegativScale(d["point"][1]) - 5;
                }
                return v;
            })
                .attr("stroke", "red")
                .attr("stroke-width", "1")
                .attr("fill", "none")
                .attr("width", "10")
                .attr("height", "10")
                .on("mouseover", function (ev) {
                    d3.select(ev.target).attr("fill", "blue");
                })
                .on("mouseout", function (ev) {
                    d3.select(ev.target).attr("fill", "none");
                })
                .on("click", (ev) => {
                    //delete point
                    //get point 
                    let point = [parseFloat(d3.select(ev.target).attr("xPlan")),
                    parseFloat(d3.select(ev.target).attr("yPlan"))
                    ];
                    // console.log(this.dataSet);
                    let pIndex = this.getIndexFromPoint(point);
                    let conIndex = this.getIndexFromPoint([point[0], -1 * point[1]]);
                    // console.log(pIndex,conIndex);
                    this.dataSet.splice(pIndex, 1);
                    this.dataSet.splice(conIndex, 1);
                    document.querySelectorAll(".point").forEach(node => {
                        //console.log(node.getAttribute("xPlan"),point[0]);
                        if (parseFloat(node.getAttribute("xPlan")) === point[0] &&
                            parseFloat(node.getAttribute("yPlan")) === point[1]) {
                            node.remove();
                        }
                        if (parseFloat(node.getAttribute("xPlan")) === point[0] &&
                            parseFloat(node.getAttribute("yPlan")) === -1 * point[1]) {
                            node.remove();
                        }
                    });
                    // generate outside function
                    if (this.function_during_delete !== undefined) {
                        this.function_during_delete();
                    }
                })
                .call(d3.drag()
                    .on("start", (ev) => {
                        // get value in dataSet
                        let point = ev.subject.point;
                        this.pIndex = -1;
                        // get point index
                        for (let i = 0; i < this.dataSet.length; i++) {
                            if (this.dataSet[i]["point"] === point) {
                                this.pIndex = i;
                                break;
                            }
                        }
                    })
                    .on("drag", (ev) => {
                        //change value in dataset
                        let xElement = ev.x;
                        let yElement = ev.y;
                        let mPoint = this.mapFromElementToPlaneCor(xElement, yElement);
                        // boundry conditions
                        // if (!this.isInside(xElement, yElement)) {
                        //     return;
                        // }
                        // if(mPoint[0] < -1) mPoint[0] = -1;
                        // if(mPoint[0] > 1) mPoint[0] = 1;
                        this.dataSet[this.pIndex].point = [mPoint[0], mPoint[1]];
                        // update position on plan
                        this.update_point(this.dataSet[this.pIndex].type);
                        // generate outside function
                        if (this.function_during_drag !== undefined) {
                            this.function_during_drag();
                        }
                        d3.select("#current_x").text(mPoint[0].toFixed(3));
                        d3.select("#current_j").text(mPoint[1].toFixed(3));
                    })
                )
                .attr("xPlan", point[0])
                .attr("yPlan", point[1])
                .attr("type", type)
                .attr("class", "point")
                .merge(points);
        }
    }
    getIndexFromPoint = (point) => {
        let ind = -1;
        // get point index
        for (let i = 0; i < this.dataSet.length; i++) {
            if (this.dataSet[i]["point"][0] === point[0]
                &&
                this.dataSet[i]["point"][1] === point[1]) {
                ind = i;
                break;
            }
        }
        return ind;
    }
    mapFromElementToPlaneCor = (xElement, yElement) => {
        let xPlan = undefined;
        let yPlane = undefined;
        if (xElement > this.middlePointOf_x) {
            xPlan = this.xPositiveScale.invert(xElement);
        } else {
            xPlan = this.xNegativScale.invert(xElement);
        }
        if (yElement <= this.middlePointOf_y) {
            yPlane = this.yPositiveScale.invert(yElement);
        } else {
            yPlane = this.yNegativScale.invert(yElement);
        }
        return [xPlan, yPlane];
    }
    update_point = (type) => {
        if (type == this.types.nonConjPole) {
            this.svg.selectAll(".point").data(this.dataSet).attr("x", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]);
                } else {
                    v = this.xNegativScale(d["point"][0]);
                }
                return v;
            })
                .attr("y", (d) => {
                    let v = 0;
                    if (d["point"][1] >= 0) {
                        v = this.yPositiveScale(d["point"][1]);
                    } else {
                        v = this.yNegativScale(d["point"][1]);
                    }
                    return v;
                })
                .attr("xPlan", d => d["point"][0])
                .attr("yPlan", d => d["point"][1]);
        } else if (type == this.types.nonConjZero) {
            this.svg.selectAll(".point").data(this.dataSet).attr("cx", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]);
                } else {
                    v = this.xNegativScale(d["point"][0]);
                }
                return v;
            })
                .attr("cy", (d) => {
                    let v = 0;
                    if (d["point"][1] >= 0) {
                        v = this.yPositiveScale(d["point"][1]);
                    } else {
                        v = this.yNegativScale(d["point"][1]);
                    }
                    return v;
                })
                .attr("xPlan", d => d["point"][0])
                .attr("yPlan", d => d["point"][1]);
        }
        else if (type == this.types.conjPole) {
            this.svg.selectAll(".point").data(this.dataSet).attr("x", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]);
                } else {
                    v = this.xNegativScale(d["point"][0]);
                }
                return v;
            }).attr("y", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]);
                } else {
                    v = this.yNegativScale(d["point"][1]);
                }
                return v;
            })
                .attr("xPlan", d => d["point"][0])
                .attr("yPlan", d => d["point"][1]);
        } else if (type === this.types.conjZero) {
            this.svg.selectAll(".point").data(this.dataSet).attr("cx", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]);
                } else {
                    v = this.xNegativScale(d["point"][0]);
                }
                return v;
            }).attr("cy", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]);
                } else {
                    v = this.yNegativScale(d["point"][1]);
                }
                return v;
            })
                .attr("xPlan", d => d["point"][0])
                .attr("yPlan", d => d["point"][1]);
        }else {
            this.svg.selectAll(".point").data(this.dataSet).attr("x", (d) => {
                let v = 0;
                if (d["point"][0] > 0) {
                    v = this.xPositiveScale(d["point"][0]);
                } else {
                    v = this.xNegativScale(d["point"][0]);
                }
                return v;
            }).attr("y", (d) => {
                let v = 0;
                if (d["point"][1] >= 0) {
                    v = this.yPositiveScale(d["point"][1]);
                } else {
                    v = this.yNegativScale(d["point"][1]);
                }
                return v;
            })
            .attr("xPlan", d => d["point"][0])
            .attr("yPlan", d => d["point"][1]);
        }
    }
}