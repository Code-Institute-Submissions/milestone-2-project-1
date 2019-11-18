//calling csv data here then passing though crossfilter function
d3.csv("data/data.csv").then(function(sportData) {
  var ndx = crossfilter(sportData);

  //adding functions here to be used in graph buliding functions below
  //changes format on x an y  axis  to display in monatary amount
  var euroFormat = function(d) {
    return "€" + d3.format(".2s")(d);
  };

  var euroSign = function(d) {
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
  //setting height an width variables that will be passed into width an height functions of graphs  charts below
  var w = 800;
  var h = 400;
  //setting margins variable that will be passed into margins functions in the charts below
  var margins = {
    top: 0,
    right: 0,
    bottom: 70,
    left: 70
  };

  //setting scalebands ordinal units which will be passed on to the xaxis functions of charts and  Graphs below
  var scaleBand = d3.scaleBand();
  var ordUnits = dc.units.ordinal;
  var scaleLinear = d3.scaleLinear();
  //setting graphs variables for graphs an charts below
  var lineChart = dc.lineChart("#line_graph");
  var scatterplot = dc.scatterPlot("#scatterplot_graph");
  var leagueRowChart = dc.rowChart("#leagues_spending_rowchart");
  var teamsRowChart = dc.rowChart("#teams_spending_rowchart");
  var pieChart = dc.pieChart("#piechart_players_position");

  //dimensions set here
  var seasonDim = ndx.dimension(function(d) {
    return d.Season;
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
  var leaugeToDim = ndx.dimension(function(d) {
    return d.League_to;
  });
  var topTenTeamSpendDim = ndx.dimension(function(d) {
    return d.Team_to;
  });

  var playersPositionDim = ndx.dimension(function(d) {
    return [d.Position];
  });
  //groups
  //setting transfer fee total to be passed into reducesum functions below
  var transferFeeTotal = function(d) {
    return [d.Transfer_fee];
  };
  var totalSpendPerSeasonDim = seasonDim.group().reduceSum(transferFeeTotal);

  var plotGraphSeasonDimGroup = plottingTheDotsDim.group();

  var groupByTransfer = leaugeToDim.group().reduceSum(transferFeeTotal);

  var topTenTeamSpendGroup = topTenTeamSpendDim
    .group()
    .reduceSum(transferFeeTotal);
  var playersPositionGroup = playersPositionDim.group();
  // end of reduce an group vatiables
  //setting function for all  charts common functions
  //every chart will be passed to this function
  function allCharts(chart) {
    chart
      .width(w)
      .height(h)
      .useViewBoxResizing(true);
  }
  //end  making charts
  //pie chart
  allCharts(pieChart);
  pieChart
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
    // title will display as percent when hovered
    .title(function(d) {
      return (
        d.key[0] +
        " " +
        Math.floor((d.value / ndx.groupAll().value()) * 100) +
        "%"
      );
    })
    .renderTitle(true);
  // end  pie chart

  // Used to override the default angle of the text in pie chart
  // Taken from tutorial found at https://stackoverflow.com/questions/38901300/rotate-pie-label-in-dc-js-pie-chart
  pieChart.on("renderlet", function() {
    pieChart.selectAll("text.pie-slice").attr("transform", function(d) {
      var translate = d3.select(this).attr("transform");
      var ang = ((((d.startAngle + d.endAngle) / 2) * 180) / Math.PI) % 360;
      if (ang < 180) ang -= 90;
      else ang += 90;
      return translate + " rotate(" + ang + ")";
    });
  });
  //  end of override function

  //scatterplot
  allCharts(scatterplot);
  scatterplot
    .margins(margins)
    .dimension(seasonDim)
    .group(plotGraphSeasonDimGroup)
    .ordinalColors(colors)
    .colorAccessor(function(d) {
      return d.key[5];
    })
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
    .tickFormat(euroFormat);
  //end scatterplot function

  //line chart
  allCharts(lineChart);
  lineChart
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
  //end of linechart
  //adding function here for common functions in both row charts
  function rowCharts(chart) {
    chart
      .margins(margins)
      .rowsCap(10)
      .othersGrouper(false)
      .ordinalColors(colors)
      .x(scaleLinear)
      .elasticX(true)
      .title(euroSign)
      .renderTitle(true)
      .xAxis()
      .ticks(5)
      .tickFormat(euroFormat);
  }
  //league top ten row chart
  //passed through allCharts and row Charts functions
  allCharts(leagueRowChart);
  rowCharts(leagueRowChart);
  leagueRowChart.dimension(leaugeToDim).group(groupByTransfer);
  //end league top ten row chart

  //teams top ten row chart
  //passed through allCharts and row Charts functions
  allCharts(teamsRowChart);
  rowCharts(teamsRowChart);
  teamsRowChart.dimension(topTenTeamSpendDim).group(topTenTeamSpendGroup);
  //end teams top ten row chart
  //player position pie chart
  dc.renderAll();
});
//end of graphs section
document.addEventListener("DOMContentLoaded", function() {
  //adding function to target reset data btn to target  button an reset all data when clicked
  var resetBtn = document.getElementsByClassName("reset-data-btn");
  for (var i = 0; i < resetBtn.length; i++) {
    resetBtn[i].addEventListener("click", function() {
      dc.filterAll();
      dc.renderAll();
    });
  }
  //setting all variables for onclick functions here
  var callOutSection = document.getElementById("callout_text");
  var transferHistorySection = document.getElementById(
    "transfer_history_section"
  );
  var footer = document.getElementById("footer");
  var mainSection = document.getElementById("hiding_section_wrapper");
  var transferHistoryBtn = document.getElementById("transfer_history_btn");
  var stat_data_btn = document.getElementsByClassName("stats_data_btn");

  // targeting data an stats button here as we I want them both to do the same thing
  for (i = 0; i < stat_data_btn.length; i++) {
    stat_data_btn[i].addEventListener("click", function() {
      callOutSection.classList.add("hide-content");
      mainSection.classList.remove("hide-content");
      footer.classList.remove("hide-content");
      transferHistorySection.classList.add("hide-content");
    });
  }

  transferHistoryBtn.addEventListener("click", function() {
    callOutSection.classList.add("hide-content");
    mainSection.classList.add("hide-content");
    transferHistorySection.classList.remove("hide-content");
    footer.classList.remove("hide-content");
  });
});
