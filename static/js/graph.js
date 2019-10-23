// jquery
//targeting button in callout section
//here that will hide the callout section when clicked an shoe that
$(document).ready(function() {
  $("#data_btn_callout").click(function() {
    $("#callout_text").hide();
  });
});
//end of jquery

//
//main graph buliding section
//gobal var added here will be passed into tickforamt
//function to change amounts to euros
var euroFormat = function(d) {
  return "€" + d3.format(".2s")(d);
};
//calling csv data here then pssing though crossfilter function
d3.csv("data/data.csv").then(function(sportData) {
  var ndx = crossfilter(sportData);

  //passing crossfiltered data into function that will then be rendered below
  showAverageOnLineChart(ndx);

  dc.renderAll();
});

//line graph function
function showAverageOnLineChart(ndx) {
  var seasonDim = ndx.dimension(dc.pluck("Season"));
  averageSpeadPerSeasonDim = seasonDim.group().reduceSum(function(d) {
    return [d.Transfer_fee];
  });

  console.log(averageSpeadPerSeasonDim.all());
  //linechart added id from html div here
  dc.lineChart("#line_graph")
    .width(600)
    .height(550)
    .margins({ top: 10, right: 40, bottom: 75, left: 75 })
    .dimension(seasonDim)
    .group(averageSpeadPerSeasonDim)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .renderHorizontalGridLines(true)
    .curve(d3.curveCatmullRom.alpha(0.5))
    .renderArea(true)
    .renderDataPoints(true)
    .title(function(d) {
      return "€" + d.value;
    })
    .colors("black")

    .colorAccessor(function(d) {
      return d.Transfer_fee;
    })
    .xAxisLabel("Seasons")
    .yAxisLabel("Transfer Fee")
    .yAxis()
    .tickFormat(euroFormat);
}
