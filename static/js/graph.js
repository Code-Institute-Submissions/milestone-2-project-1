// jquery
//targeting button in callout section
//here that will hide the callout section when clicked an shoe that
// $(document).ready(function() {
//   $("#data_btn_callout").click(function() {
//     $("#callout_text").hide();
//   });
//   //hiding main section until button is clicked here
//   $("#hiding_section_wrapper").hide();
//   $("#data_btn_callout").click(function() {
//     $("#hiding_section_wrapper").show();
//   });
// });
//end of jquery

//adding variables to be used in graph buliding functions below
//changes format to euros
var euroFormat = function(d) {
  return "€" + d3.format(".2s")(d);
};
//euro sign function
var euroSign = function(d) {
  return "€" + d.value;
};
//setting var for transfer fee total
transferFeeTotal = function(d) {
  return [d.Transfer_fee];
};

//setting height an width variables
var w = 700;
var h = 400;
//setting margins variable
var margins = { top: 20, right: 40, bottom: 75, left: 50 };
//setting scalebands
var scaleBand = d3.scaleBand();
var ordUnits = dc.units.ordinal;
var scaleLinear = d3.scaleLinear();
//setting graphs variables
var lineChart = dc.lineChart("#line_graph");
var scatterplot = dc.scatterPlot("#scatterplot_graph");
var leagueRowChart = dc.rowChart("#leagues_spending_rowchart");
var teamsRowChart = dc.rowChart("#teams_spending_rowchart");
var playersPositionChart = dc.pieChart("#piechart_players_position");

//calling csv data here then passing though crossfilter function
d3.csv("data/data.csv").then(function(sportData) {
  var ndx = crossfilter(sportData);

  //passing crossfiltered data into function that will then be rendered below
  showTotalSpendOnLineChart(ndx);

  scatterPlotAllTransfers(ndx);

  topTenSpendingLeauges(ndx);

  topTenTeamSpend(ndx);

  playersPositionPieChart(ndx);

  dc.renderAll();
});

//line graph function//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function showTotalSpendOnLineChart(ndx) {
  var seasonDim = ndx.dimension(dc.pluck("Season"));
  totalSpendPerSeasonDim = seasonDim.group().reduceSum(transferFeeTotal);
  console.log(totalSpendPerSeasonDim.all());
  //linechart added id from html div here
  lineChart
    .width(w)
    .height(h)
    .margins(margins)
    .dimension(seasonDim)
    .group(totalSpendPerSeasonDim)
    .x(scaleBand)
    .xUnits(ordUnits)
    .renderHorizontalGridLines(true)
    .curve(d3.curveCatmullRom.alpha(0.5))
    .renderArea(true)
    .renderDataPoints(true)
    .title(euroSign)
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
  scatterplot
    .width(w)
    .height(h)
    .margins(margins)
    .x(scaleBand)
    .xUnits(ordUnits)
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
    .yAxis()
    .tickFormat(euroFormat);
}
//end of scatterplot function//////////////////////////////////////////////////////////////////////////////////////////////////////////

//top ten spending leauges function/////////////////////////////////////////////////////////////////////////////////////////////////////////

function topTenSpendingLeauges(ndx) {
  leaugeToDim = ndx.dimension(dc.pluck("League_to"));
  groupByTransfer = leaugeToDim.group().reduceSum(transferFeeTotal);

  // building the line chart here
  leagueRowChart
    .width(w)
    .height(h)
    .rowsCap(10)
    .othersGrouper(false)
    .margins(margins)
    .dimension(leaugeToDim)
    .group(groupByTransfer)
    .x(scaleLinear)
    .elasticX(true)
    .xAxis()
    .ticks(5)
    .tickFormat(euroFormat);
}
// end of top ten league spend row chart

//top ten club spend row chart

function topTenTeamSpend(ndx) {
  topTenTeamSpendDim = ndx.dimension(dc.pluck("Team_to"));
  topTenTeamSpendGroup = topTenTeamSpendDim.group().reduceSum(transferFeeTotal);
  console.log(topTenTeamSpendGroup.all());
  //adding row chart
  teamsRowChart
    .width(w)
    .height(h)
    .rowsCap(10)
    .othersGrouper(false)
    .margins(margins)
    .dimension(topTenTeamSpendDim)
    .group(topTenTeamSpendGroup)
    .x(scaleLinear)
    .elasticX(true)
    .xAxis()
    .ticks(5)
    .tickFormat(euroFormat);
}

// end of rowchart top spending teams graph

//pie chart for players position

function playersPositionPieChart(ndx) {
  playersPositionDim = ndx.dimension(function(d) {
    return [d.Position];
  });
  playersPositionGroup = playersPositionDim.group();
  console.log(playersPositionGroup.all());

  //adding pie chart here
  playersPositionChart
    .height(400)
    .innerRadius(20)
    .slicesCap(13)
    .othersGrouper(false)
    .legend(
      dc
        .legend()
        .x(4)
        .y(0)
        .itemHeight(16)
        .gap(2)
    )
    .dimension(playersPositionDim)
    .group(playersPositionGroup);
}
