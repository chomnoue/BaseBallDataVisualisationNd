//dimensions to be plotted
var handedness = {id: "handedness", category: "handedness", measure: null, label: "Handedness"};
var dimensions = [
    handedness,
    {id: "height", category: null, measure: "height", label: "Height"},
    {id: "weight", category: null, measure: "weight", label: "Weight"}
];
//performances 
var battingAverage = {id: "avg", label: "Batting average"};
var homeRuns = {id: "HR", label: "Home runs"};
var performances = [
    homeRuns,
    battingAverage
];
//groups on which the aggregation methods will be applied
var groups = [handedness, {id: "number", label: "None"}, {id: "name", label: "Name"}];

var none = {id: "", label: "None"};

//different colour axes
var ambidextrous = {id: "ambidextrous", label: "Ambidextrous"};
var colours = [ambidextrous, none]
        .concat(dimensions, performances);
//variables to be used as size axis
var sizes = [none].concat(dimensions.slice(1), performances);
var bubble = {id: dimple.plot.bubble, label: "Bubble"};
var bar = {id: dimple.plot.bar, label: "Bar"};
var plotTypes = [bar, bubble];
var average = {id: dimple.aggregateMethod.avg, label: "Average"};
//aggregate functions
var aggs = [
    average,
    {id: dimple.aggregateMethod.count, label: "Count"},
    {id: dimple.aggregateMethod.max, label: "Max"},
    {id: dimple.aggregateMethod.min, label: "Min"},
    {id: dimple.aggregateMethod.sum, label: "Sum"}
];


//variables aggreations and plot types of the current plot
var selected = {
    performance: homeRuns,
    dimension: handedness,
    group: handedness,
    colour: ambidextrous,
    size: none,
    agg: average,
    plotType: bar
};

//selectors used to alter the 'selected' variable
var selectors = [
    {id: "performance", label: " Plot ", data: performances},
    {id: "dimension", label: " Against ", data: dimensions},
    {id: "group", label: " Group By ", data: groups},
    {id: "colour", label: " Colour By ", data: colours},
    {id: "size", label: " Size By ", data: sizes},
    {id: "agg", label: " Aggregate Function ", data: aggs},
    {id: "plotType", label: " Plot Type ", data: plotTypes}
];


function draw(data) {
    var chartDiv = d3.select("body")
            .append('div')
            .attr('class', 'chart_div');
    var title = chartDiv.append("h2");
    var selectorsDiv = d3.select("body")
            .append('div')
            .attr('class', 'selectors_div')
            .attr('id', 'selectors_div');
    var selectorsTable = selectorsDiv.append('table');
    var width = 700;
    var height = 500;
    var margin = 100;

    //redraw the chart
    function update() {
        chartDiv.select("svg").remove();
        title.selectAll("*").remove();
        //var svg = dimple.newSvg(chartDiv[0], 800, 600);
        var dimension = selected.dimension;
        var performance = selected.performance;
        var svg = chartDiv.append("svg")
                .attr("width", width)
                .attr("height", height);
        var chart = new dimple.chart(svg, data);
        chart.setBounds(margin / 2, margin / 8, width - margin, height - margin);

        var xAxis;
        if (dimension.category) {
            xAxis = chart.addCategoryAxis("x", dimension.category);
        } else {
            xAxis = chart.addMeasureAxis("x", dimension.measure);
        }

        xAxis.title = dimension.label;
        var yAxis = chart.addMeasureAxis("y", performance.id);
        yAxis.title = performance.label;
        var titletext = selected.agg.label + " " + selected.performance.label + " against " + selected.dimension.label;

        if (selected.size !== none) {
            var zAxis = chart.addMeasureAxis("z", selected.size.id);
        }
        var mySeries = chart.addSeries([selected.group.id, selected.colour.id],
                selected.plotType.id);
        if (selected.agg !== none) {
            mySeries.aggregate = selected.agg.id;
        }
        if (selected.colour !== none) {
            legend = chart.addLegend(width - margin / 2, 20, 50, 100, "left");
        }
        title.text(titletext);
        chart.draw();
    }
    //Build a drop down list having a set of values
    function buildSelector(selectorsTable, selectorObject) {
        selectorsTable = selectorsDiv.append('tr');
        selectorsTable.append('td').append('label').text(selectorObject.label);
        var selector = selectorsTable.append('td').append('select');
        var selectorOptions = selector.selectAll('option')
                .data(selectorObject.data)
                .enter()
                .append('option')
                .text(function (dt) {
                    return dt.label;
                })
                .attr('value', function (dt) {
                    return dt.id;
                });
        selectorOptions.on('click', function (d) {
            selected[selectorObject.id] = d;
            update();
        });
    }
    for (i in selectors) {
        buildSelector(selectorsTable, selectors[i]);
    }
    //first hide the selectors
    selectorsDiv.style("visibility", 'hidden');
    var performanceIdx = performances.length - 1;
    var duration = 2000;
    //perform animation
    var performanceInterval = setInterval(function () {
        selected.performance = performances[performanceIdx--];
        update();
        if (performanceIdx < 0) {
            clearInterval(performanceInterval);
            setTimeout(function () {
                selectorsDiv.style("visibility", 'visible');
            }, duration);
        }
    }, duration);

}
var count = 1;
function transform(d) {
    //using the number to distinguish the players with the same name
    d.number = count;
    count = count + 1;
    d.height = +d.height;
    d.weight = +d.weight;
    d.avg = +d.avg;
    d.HR = +d.HR;

    if (d.handedness === 'B') {
        d.ambidextrous = true;
    } else {
        d.ambidextrous = false;
    }
    return d;
}


d3.csv("data/baseball_data.csv", transform, draw);