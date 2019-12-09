document.addEventListener("DOMContentLoaded", function() {
  d3.csv("assets/data/data.csv").then(function(data) {
    /*calling csv data here then 
    passing though crossfilter function*/

    const ndx = crossfilter(data);

    /* declaring width and 
    height varibales here */

    const WIDTH = 800;
    const HEIGHT = 400;

    /* Looping threw the data and 
    parsing transfers fees data here */

    data.forEach(function(d) {
      d.Transfer_fee = parseInt(d.Transfer_fee);
    });

    /*Variables section all variables will be passed 
    Into graph building functions below*/

    let colors = [
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

    dc.config.defaultColors(colors); //overriding dc default colors

    /* adding functions here to be used in graph buliding functions below
     changes format on x an y  axis to display in monatary amount */

    const euroFormat = function(d) {
      return ` € ${d3.format(".2s")(d)}`;
    };

    const euroSign = function(d) {
      return ` ${d.key} €${d3.format(".2s")(d.value)}`;
    };

    let margins = {
      top: 0,
      right: 0,
      bottom: 70,
      left: 70
    };

    let pieChartLegend = dc
      .legend()
      .x(4)
      .y(0)
      .itemHeight(16)
      .gap(2);

    /*Variable for piechart title added  here so 
    the position of the player and percentage is displayed*/

    let pieChartTitle = function(d) {
      return `${d.key[0]} ${Math.floor(
        (d.value / ndx.groupAll().value()) * 100
      )}%`;
    };

    /*Variable added here for scatterplot title function
    this will display season, players name, season he was transferd */

    let scatterplotTitle = function(d) {
      return ` In ${d.key[0]} ${d.key[2]} Was Transfered From ${d.key[3]} to ${
        d.key[4]
      } for €${d3.format(".2s")(d.key[1])}`;
    };

    /*setting scaleLinear, ordinal units an scaleBand to variables
      which will be passed on to the x-axis functions of charts and  graphs below */

    const scaleBand = d3.scaleBand();
    const ordUnits = dc.units.ordinal;
    const scaleLinear = d3.scaleLinear();

    /*setting graphs variables for 
    graphs an charts below*/

    // function Chart(dc) {
    //   this.dc = dc;
    // }
    const pieChart = dc.pieChart("#piechart-players-position");
    const scatterplot = dc.scatterPlot("#scatterplot-graph");
    const lineChart = dc.lineChart("#line-graph");
    const leagueRowChart = dc.rowChart("#leagues-spending-rowchart");
    const teamsRowChart = dc.rowChart("#teams-spending-rowchart");

    /*Start of Dimension an group section 
    All dimensions and groups  set here with will 
    passed Into dimension functions of charts an graphs*/

    let seasonDim = ndx.dimension(function(d) {
      return d.Season;
    });

    let plottingTheDotsDim = ndx.dimension(function(d) {
      return [
        d.Season,
        d.Transfer_fee,
        d.Name,
        d.Team_from,
        d.Team_to,
        d.Position
      ];
    });

    let leaugeToDim = ndx.dimension(function(d) {
      return d.League_to;
    });

    let topTenTeamSpendDim = ndx.dimension(function(d) {
      return d.Team_to;
    });

    let playersPositionDim = ndx.dimension(function(d) {
      return [d.Position];
    });

    let transferFeeTotal = function(d) {
      return [d.Transfer_fee];
    };

    let totalSpendPerSeasonDim = seasonDim.group().reduceSum(function(d) {
      return d.Transfer_fee;
    });

    let plotGraphSeasonDimGroup = plottingTheDotsDim.group();

    let groupByTransfer = leaugeToDim.group().reduceSum(transferFeeTotal);

    let topTenTeamSpendGroup = topTenTeamSpendDim
      .group()
      .reduceSum(transferFeeTotal);

    let playersPositionGroup = playersPositionDim.group();

    /*Start of chart building section
       first function is created  for all charts and there common functions
       every chart will be passed to this function*/

    function allCharts(chart) {
      chart
        .width(WIDTH)
        .height(HEIGHT)
        .transitionDuration(1200)
        .transitionDelay(500)
        .useViewBoxResizing(true);
    }

    allCharts(pieChart);
    pieChart
      .dimension(playersPositionDim)
      .group(playersPositionGroup)
      .slicesCap(13)
      .othersGrouper(false)
      .legend(pieChartLegend)
      .title(pieChartTitle)
      .renderTitle(true);

    allCharts(scatterplot);
    scatterplot
      .margins(margins)
      .dimension(seasonDim)
      .group(plotGraphSeasonDimGroup)
      .title(scatterplotTitle)
      .ordinalColors(colors)
      .colorAccessor(function(d) {
        return d.key[5];
      })
      .x(scaleBand)
      .xUnits(ordUnits)
      .brushOn(false)
      .symbolSize(10)
      .clipPadding(10)
      .renderHorizontalGridLines(true)
      .renderVerticalGridLines(true)
      .yAxis()
      .tickFormat(euroFormat);

    allCharts(lineChart);
    lineChart
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
      .yAxis()
      .tickFormat(euroFormat);

    /*adding function here for common 
    functions in both row charts*/

    function rowCharts(chart) {
      chart
        .margins(margins)
        .rowsCap(10)
        .othersGrouper(false)
        .x(scaleLinear)
        .elasticX(true)
        .title(euroSign)
        .renderTitle(true)
        .xAxis()
        .ticks(5)
        .tickFormat(euroFormat);
    }

    allCharts(leagueRowChart);
    rowCharts(leagueRowChart);
    leagueRowChart.dimension(leaugeToDim).group(groupByTransfer);

    allCharts(teamsRowChart);
    rowCharts(teamsRowChart);
    teamsRowChart.dimension(topTenTeamSpendDim).group(topTenTeamSpendGroup);

    dc.renderAll();

    /*2 functions added below to override 
    default text angle of linechart, scatterplot and piechart*/

    function xaxisAngle(chart) {
      chart.on("renderlet", function() {
        // rotate x-axis labels
        chart
          .selectAll("g.x text")
          .attr("transform", "translate(-40,30) rotate(315)");
      });
    }
    xaxisAngle(scatterplot);
    xaxisAngle(lineChart);

    /* Taken from tutorial found at 
    https://stackoverflow.com/questions/38901300/rotate-pie-label-in-dc-js-pie-chart*/

    pieChart.on("renderlet", function() {
      pieChart.selectAll("text.pie-slice").attr("transform", function(d) {
        let translate = d3.select(this).attr("transform");
        let ang = ((((d.startAngle + d.endAngle) / 2) * 180) / Math.PI) % 360;
        if (ang < 180) ang -= 90;
        else ang += 90;
        return translate + " rotate(" + ang + ")";
      });
    });
  });

  /*All functions added below 
       target the dom*/

  /* targeting both  buttons to  reset 
  all data when clicked */

  let resetBtn = document.getElementsByClassName("reset-data-btn");
  for (let i = 0; i < resetBtn.length; i++) {
    resetBtn[i].addEventListener("click", function() {
      dc.filterAll();
      dc.renderAll();
    });
  }

  /* Setting variables  for 
        event Listeners */

  let callOutSection = document.getElementById("callout-text");
  let transferHistorySection = document.getElementById(
    "transfer-history-section"
  );
  let footer = document.getElementById("footer");
  let mainSection = document.getElementById("hiding-section-wrapper");
  let transferHistoryBtn = document.getElementById("transfer-history-btn");
  let stat_data_btn = document.getElementsByClassName("stats-data-btn");

  /* targeting data an stats button here 
     adding and removing hide content class when clicked
  */

  for (let i = 0; i < stat_data_btn.length; i++) {
    stat_data_btn[i].addEventListener("click", function() {
      callOutSection.classList.add("hide-content");
      mainSection.classList.remove("hide-content");
      footer.classList.remove("hide-content");
      transferHistorySection.classList.add("hide-content");
    });
  }
  /* targeting transfer history section button here
   adding and removing hide content section when clicked
   */

  transferHistoryBtn.addEventListener("click", function() {
    callOutSection.classList.add("hide-content");
    mainSection.classList.add("hide-content");
    transferHistorySection.classList.remove("hide-content");
    footer.classList.remove("hide-content");
  });
});
