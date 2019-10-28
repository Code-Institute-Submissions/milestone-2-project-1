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

//calling csv data here then passing though crossfilter function
d3.csv("data/data.csv").then(function(sportData) {
  var ndx = crossfilter(sportData);
  //adding variables to be used in graph buliding functions below
  //changes format on axis  to euros
  var euroFormat = function(d) {
    return "€" + d3.format(".2s")(d);
  };
  //euro sign function
  var euroSign = function(d) {
    return "€" + d.value;
  };

  //setting var for transfer fee total

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

  //setting the reduce an group variables/////////////////////////////////////////////////////////////////////////////////////
  //dimensions
  var transferFeeTotal = function(d) {
    return [d.Transfer_fee];
  };

  var seasonDim = ndx.dimension(function(d) {
    return [d.Season];
  });
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
  console.log(plottingTheDotsDim);
  var leaugeToDim = ndx.dimension(dc.pluck("League_to"));
  var topTenTeamSpendDim = ndx.dimension(dc.pluck("Team_to"));

  var playersPositionDim = ndx.dimension(function(d) {
    return [d.Position];
  });
  //groups

  var totalSpendPerSeasonDim = seasonDim.group().reduceSum(transferFeeTotal);

  var plotGraphSeasonDimGroup = plottingTheDotsDim.group();

  var groupByTransfer = leaugeToDim.group().reduceSum(transferFeeTotal);

  var topTenTeamSpendGroup = topTenTeamSpendDim
    .group()
    .reduceSum(transferFeeTotal);

  var playersPositionGroup = playersPositionDim.group();
  // end of reduce an group vatiables

  // making charts
  //line chart
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
  //end of line chart
  //scatterplot function
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
    .dimension(seasonDim)
    .group(plotGraphSeasonDimGroup)
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .yAxis()
    .tickFormat(euroFormat);
  //end scatterplot function
  //league top ten row chart
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
  //end league top ten row chart
  //teams top ten row chart
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
  //end teams top ten row chart
  //player position pie chart
  playersPositionChart
    .height(400)
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
    .colors([
      "#082A2A",
      "#0C3536",
      "#124143",
      "#184C51",
      "#1F5860",
      "#27656F",
      "#30717E",
      "#3A7E8E",
      "#448A9F",
      "#5097B0",
      "#5DA4C1",
      "#6AB1D2",
      "#79BDE4",
      "#89CAF6"
    ])
    // (optional) define color domain to match your data domain if you want to bind data or color
    .colorDomain([-1750, 1644])
    // (optional) define color value accessor
    .colorAccessor(function(d) {
      return d.value;
    })
    .dimension(playersPositionDim)
    .group(playersPositionGroup)
    .title(function(d) {
      return (
        d.data.Player +
        "(" +
        Math.floor((d.data.value / all.value()) * 100) +
        "%)"
      );
    })
    .renderTitle(true);
  //end player position pie chart
  dc.renderAll();
});
