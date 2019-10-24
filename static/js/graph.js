// jquery
//targeting button in callout section
//here that will hide the callout section when clicked an shoe that
$(document).ready(function() {
  $("#data_btn_callout").click(function() {
    $("#callout_text").hide();
  });
  //hiding main section until button is clicked here
  $("#hiding_section_wrapper").hide();
  $("#data_btn_callout").click(function() {
    $("#hiding_section_wrapper").show();
  });
});
//end of jquery

//
//main graph buliding section
//gobal var added here will be passed into tickformat
//function to change amounts to euros
var euroFormat = function(d) {
  return "€" + d3.format(".2s")(d);
};
//calling csv data here then pssing though crossfilter function
d3.csv("data/data.csv").then(function(sportData) {
  var ndx = crossfilter(sportData);

  //passing crossfiltered data into function that will then be rendered below
  showAverageOnLineChart(ndx);

  scatterPlotAllTransfers(ndx);

  dc.renderAll();
});

//line graph function//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function showAverageOnLineChart(ndx) {
  var seasonDim = ndx.dimension(dc.pluck("Season"));
  averageSpeadPerSeasonDim = seasonDim.group().reduceSum(function(d) {
    return [d.Transfer_fee];
  });
  console.log(averageSpeadPerSeasonDim.all());
  //linechart added id from html div here
  dc.lineChart("#line_graph")
    .width(700)
    .height(400)
    .margins({ top: 20, right: 40, bottom: 75, left: 50 })
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
    .colors("#756bb1")
    .xAxisLabel("Seasons")
    .yAxisLabel("Transfer Fee")
    .yAxis()
    .tickFormat(euroFormat);
}
// end of line graph function////////////////////////////////////////////////////////////////////////////////////////////////////////////

// scatterplot function/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function scatterPlotAllTransfers(ndx) {
  var plotGraphSeasonDim = ndx.dimension(dc.pluck("Season"));
  var plottingTheDotsDim = ndx.dimension(function(d) {
    return [
      d.Season,
      d.Transfer_fee,
      d.Name,
      d.Team_from,
      d.Team_to,
      d.Position
    ];
  });

  var plotGraphSeasonDimGroup = plottingTheDotsDim.group();

  //adding scatterplot chart here
  dc.scatterPlot("#scatterplot_graph")
    .width(700)
    .height(400)
    .x(d3.scaleBand())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .symbolSize(6)
    .clipPadding(10)
    .yAxisLabel("Transfer Fee")
    .xAxisLabel("Seasons")
    .title(function(d) {
      return (
        "In " +
        d.key[0] +
        " " +
        d.key[2] +
        " Was Transfered From " +
        d.key[3] +
        " to " +
        d.key[4] +
        " for €" +
        d.key[1]
      );
    })
    .colors("#756bb1")
    .dimension(plotGraphSeasonDim)
    .group(plotGraphSeasonDimGroup)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .margins({ top: 10, right: 50, bottom: 75, left: 75 })
    .yAxis()
    .tickFormat(euroFormat);
}
//end of scatterplot function//////////////////////////////////////////////////////////////////////////////////////////////////////////
