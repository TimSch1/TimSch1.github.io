var margin = {top: 80, right: 80, bottom: 80, left: 80},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parse = d3.time.format("%b %Y").parse;

// Scales and axes. Note the inverted domain for the y-scale: bigger is up!
var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true),
    yAxis = d3.svg.axis().scale(y).ticks(4).orient("right");

// An area generator, for the light fill.
var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.price); });

// A line generator, for the dark stroke.
var line = d3.svg.line()
    .interpolate("monotone")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });

function drawChart(error, data) {

  // Filter to one symbol; the S&P 500.
  var values = data.filter(function(d) {
    return d.symbol == "S&P 500";
  });

  // Compute the minimum and maximum date, and the maximum price.
  x.domain([values[0].date, values[values.length - 1].date]);
  y.domain([0, d3.max(values, function(d) { return d.price; })]).nice();

  // Add an SVG element with the desired dimensions and margin.
  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the clip path.
  svg.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  // Add the area path.
  svg.append("path")
      .attr("class", "area")
      .attr("clip-path", "url(#clip)")
      .attr("d", area(values));

  // Add the x-axis.
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Add the y-axis.
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

    // Add the line path.
  svg.append("path")
      .attr("class", "line")
      .attr("clip-path", "url(#clip)")
      .attr("d", line(values));


};

// Parse dates and numbers. We assume values are sorted by date.
function type(d) {
  d.date = parse(d.date);
  d.price = +d.price;
  return d;
}

// Fetch the data, and render.
d3.csv("stocks.csv", type, drawChart);