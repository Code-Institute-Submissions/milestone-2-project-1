//calling csv data here then passing though crossfilter function
d3.csv("data/data.csv").then(function (sportData) {
  var ndx = crossfilter(sportData);

  //adding functions here to be used in graph buliding functions below
  //changes format on x an y  axis  to display in monatary amount
  var euroFormat = function (d) {
    return "€" + d3.format(".2s")(d);
  };

  var euroSign = function (d) {
    return d.key + " €" + d3.format(".2s")(d.value);
  };
  // setting colors variable here that will be passed into colors function in charts below
  var colors = [
    "#3F1D1D",
    "#4F272D",
    "#5D323F",
    "#693E53",
    "#724D68",
    "#765D7E",
    "#766E93",
    "#7181A6",
    "#6894B6",
    "#5BA7C3",
    "#4DBBCC",
    "#44CDCF",
    "#47E0CE",
    "#5AF1C9"
  ];
  //setting height an width variables that will be passed into width an height functions of charts below
  var w = 800;
  var h = 400;
  //setting margins variable that will be passed into margins functions in the charts below
  var margins = {
    top: 0,
    right: 0,
    bottom: 70,
    left: 70
  };
  //setting scalebands
  var scaleBand = d3.scaleBand();
  var ordUnits = dc.units.ordinal;
  var scaleLinear = d3.scaleLinear();
  //setting graphs variables
  var lineChart = dc.lineChart("#line_graph");
  var scatterplot = dc.scatterPlot("#scatterplot_graph");
  var leagueRowChart = dc.rowChart("#leagues_spending_rowchart");
  var teamsRowChart = dc.rowChart("#teams_spending_rowchart");
  var pieChart = dc.pieChart("#piechart_players_position");

  //dimensions set here
  var seasonDim = ndx.dimension(function (d) {
    return d.Season;
  });
  var plottingTheDotsDim = ndx.dimension(function (d) {
    return [
      d.Season,
      d.Transfer_fee,
      d.Name,
      d.Team_from,
      d.Team_to,
      d.Position
    ];
  });
  var leaugeToDim = ndx.dimension(function (d) {
    return d.League_to;
  });
  var topTenTeamSpendDim = ndx.dimension(function (d) {
    return d.Team_to;
  });

  var playersPositionDim = ndx.dimension(function (d) {
    return [d.Position];
  });
  //groups
  //setting transfer fee total to be passed into reducesum functions below
  var transferFeeTotal = function (d) {
    return [d.Transfer_fee];
  };
  var totalSpendPerSeasonDim = seasonDim.group().reduceSum(transferFeeTotal);

  var plotGraphSeasonDimGroup = plottingTheDotsDim.group();
  console.log(plotGraphSeasonDimGroup.all());
  var groupByTransfer = leaugeToDim.group().reduceSum(transferFeeTotal);

  var topTenTeamSpendGroup = topTenTeamSpendDim
    .group()
    .reduceSum(transferFeeTotal);
  var playersPositionGroup = playersPositionDim.group();
  // end of reduce an group vatiables

  //end//
  // making charts
  //line chart
  lineChart
    .width(w)
    .height(h)
    .useViewBoxResizing(true)
    .margins(margins)
    .dimension(seasonDim)
    .group(totalSpendPerSeasonDim)
    .ordinalColors(["#7181A6"])
    .x(scaleBand)
    .xUnits(ordUnits)
    .renderHorizontalGridLines(true)
    .curve(d3.curveCatmullRom.alpha(0.5))
    .renderArea(true)
    .renderDataPoints(true)
    .title(euroSign)
    .yAxis()
    .tickFormat(euroFormat);
  //end of line chart
  //scatterplot function
  scatterplot
    .width(w)
    .height(h)
    .useViewBoxResizing(true)
    .margins(margins)
    .dimension(seasonDim)
    .group(plotGraphSeasonDimGroup)
    .ordinalColors(colors)
    .colorAccessor(function (d) {
      return d.key[5];
    })
    .title(function (d) {
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
        d3.format(".2s")(d.key[1])
      );
    })

    .x(scaleBand)
    .xUnits(ordUnits)
    .brushOn(false)
    .symbolSize(6)
    .clipPadding(1)
    .renderVerticalGridLines(true)
    .yAxis()
    .tickFormat(euroFormat),
    //end scatterplot function
    //league top ten row chart
    leagueRowChart
    .width(w)
    .height(h)
    .useViewBoxResizing(true)
    .rowsCap(10)
    .othersGrouper(false)
    .margins(margins)
    .ordinalColors(colors)
    .dimension(leaugeToDim)
    .group(groupByTransfer)
    .x(scaleLinear)
    .elasticX(true)
    .title(euroSign)
    .renderTitle(true)
    .xAxis()
    .ticks(5)
    .tickFormat(euroFormat);

  //end league top ten row chart
  //teams top ten row chart
  teamsRowChart
    .width(w)
    .height(h)
    .useViewBoxResizing(true)
    .rowsCap(10)
    .othersGrouper(false)
    .margins(margins)
    .ordinalColors(colors)
    .dimension(topTenTeamSpendDim)
    .group(topTenTeamSpendGroup)
    .x(scaleLinear)
    .elasticX(true)
    .title(euroSign)
    .renderTitle(true)
    .xAxis()
    .ticks(5)
    .tickFormat(euroFormat);
  //end teams top ten row chart
  //player position pie chart

  pieChart
    .width(w)
    .height(h)
    .useViewBoxResizing(true)
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
    .ordinalColors(colors)
    .dimension(playersPositionDim)
    .group(playersPositionGroup)
    .title(function (d) {
      return (
        d.key[0] +
        " " +
        Math.floor((d.value / ndx.groupAll().value()) * 100) +
        "%"
      );
    })
    .renderTitle(true);
  // end player position pie chart

  // Used to override the default angle of the text in pie chart
  // Taken from tutorial found at https://stackoverflow.com/questions/38901300/rotate-pie-label-in-dc-js-pie-chart
  pieChart.on("renderlet", function () {
    pieChart.selectAll("text.pie-slice").attr("transform", function (d) {
      var translate = d3.select(this).attr("transform");
      var ang = ((((d.startAngle + d.endAngle) / 2) * 180) / Math.PI) % 360;
      if (ang < 180) ang -= 90;
      else ang += 90;
      return translate + " rotate(" + ang + ")";
    });
  });

  dc.renderAll();
});

//Adding onclick function here that will hide call out section and show
//main graphs section when data an stats button is clicked
document.addEventListener("DOMContentLoaded", function () {
  //setting all variables for onclick functions here 
  var callOutSection = document.getElementById("callout_text");
  var transferHistorySection = document.getElementById(
    "transfer_history_section"
  );
  var footer = document.getElementById("footer");
  var mainSection = document.getElementById("hiding_section_wrapper");
  var transferHistoryBtn = document.getElementById("transfer_history_btn");
  var statBtn = document.getElementById("stats_btn");
  var dataBtn = document.getElementById("data_btn_callout");

  dataBtn.onclick = function () {
    callOutSection.classList.add("hide-content");
    mainSection.classList.remove("hide-content");
    footer.classList.remove("hide-content");
  };
  statBtn.onclick = function () {
    callOutSection.classList.add("hide-content");
    mainSection.classList.remove("hide-content");
    footer.classList.remove("hide-content");
    transferHistorySection.classList.add("hide-content");
  };

  transferHistoryBtn.onclick = function () {
    callOutSection.classList.add("hide-content");
    mainSection.classList.add("hide-content");
    transferHistorySection.classList.remove("hide-content");
    footer.classList.remove("hide-content");
  };
});