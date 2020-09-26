// Create Scatterplot for 'Smokers vs. Age'
// data == data.csv

// init svg
// svg dimensions
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top:20,
    right:40,
    bottom:80,
    left: 100
}
 var width = svgWidth - margin.left - margin.right;
 var height = svgHeight - margin.top - margin.bottom;

 // svg wrapper
 var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// svg group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// initial params
var chosenXAxis = "smokers";
var chosenYAxis = "age";

// function to update x-scale var on click
function xScale(data, axis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[axis]) * 0.8,
            d3.max(data, d => d[axis]) * 1.2
        ])
        .range([0,width]);
    return xLinearScale
}

// function to update y-scale var on click
function yScale(data, axis) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[axis])])
        .range([height, 0]);
    return yLinearScale
}

// function to update x-axis var on click
function renderAxes(scale,axis) {
    var bottomAxis = d3.axisBottom(scale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderCircles(circlesGroup, scale, chosenXAxis) {
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => scale(d[chosenXAxis]));

    return circlesGroup;
}

function updateToolTip(chosenXAxis, circlesGroup) {
    var label;

    if (chosenXAxis === "smokers") {
        label = "Smokers (%)";
    } else if (chosenXAxis === "obesity") {
        label = "Obese (%)";
    } else {
        label = "Household Income (Median)";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80,-60])
        .html(function(d) {
            return (`${label} ${d[chosenXAxis]}`);
        });
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data,index) {
            toolTip.hide(data);
        });
    
    return circlesGroup;
}

// retrieve data from csv and execute graph
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    // parse data
    data.forEach(function(data) {
        data.povery = +data.povery;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale
    var xLinearScale = xScale(data, chosenXAxis);

    // yLinearScale
    var yLinearScale = yScale(data, chosenYAxis);

    // create initial axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "pink")
        .attr("opacity", ".5");

    // group for x axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`);

    var smokesLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y",20)
        .attr("value", "smokes")
        .classed("active", true)
        .text("Smokers (%)");

    var obesityLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y",40)
        .attr("value", "obesity")
        .classed("active", false)
        .text("Obese (%)");

    var healthCareLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y",60)
        .attr("value", "healthcare")
        .classed("active", false)
        .text("Lacks Healthcare (%)");

    // group for y axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
    
    var ageLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "age")
        .classed("active", true)
        .text("Age (Median)");

    var povertyLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "poverty")
        .classed("active", false)
        .text("Poverty (%)");

    var incomeLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "income")
        .classed("active", false)
        .text("Household Income (Median)");

    // updatetooltip
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup)

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            if (value != chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(data, chosenXAxis);
                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            if (chosenXAxis === "smokers") {
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthCareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else if (chosenXAxis === "obesity") {
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                 obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthCareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            } else {
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthCareLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
            }
        });

}).catch(function(error){
    console.log(error);
});