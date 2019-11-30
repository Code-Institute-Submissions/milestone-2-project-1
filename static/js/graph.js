//This will load page once page Loads
document.addEventListener("DOMContentLoaded", function() {
  //calling csv data here then passing though crossfilter function
  //Load Data
  d3.csv("data/data.csv").then(function(data) {
    const ndx = crossfilter(data);

    //Loop threw the data an parse transfers fees here
    data.forEach(function(d) {
      d.Transfer_fee = parseInt(d.Transfer_fee);
    });
    //end of parsing data

    //This section will create variables that will be passed in to graphs and charts//////////////////////////////////////////////////////////
    // setting colors variable here that will be passed into colors function in charts below
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
    //overriding dc default colors passing In colors var from above
    dc.config.defaultColors(colors);

    // adding functions here to be used in graph buliding functions below
    // changes format on x an y  axis  to display in monatary amount
    const euroFormat = function(d) {
      return "€" + d3.format(".2s")(d);
    };

    const euroSign = function(d) {
      return d.key + " €" + d3.format(".2s")(d.value);
    };

    //setting height an width variables that will be passed into width an height functions of graphs  charts below
    let w = 800;
    let h = 400;
    //setting margins variable that will be passed into margins functions in the charts below
    let margins = {
      top: 0,
      right: 0,
      bottom: 70,
      left: 70
    };
    //Varaible for Pie Chart Legend  added  here
    let pieChartLegend = dc
      .legend()
      .x(4)
      .y(0)
      .itemHeight(16)
      .gap(2);

    //Variable for piechart title added  here so the position of the player and percentage is displayed
    let pieChartTitle = function(d) {
      return (
        d.key[0] +
        " " +
        Math.floor((d.value / ndx.groupAll().value()) * 100) +
        "%"
      );
    };
    //Varaiable added here for scatterplot function
    let scatterplotTitle = function(d) {
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
    };

    //setting scalebands ordinal units an scaleBand to variables
    //which will be passed on to the x-axis functions of charts and  Graphs below
    const scaleBand = d3.scaleBand();
    const ordUnits = dc.units.ordinal;
    const scaleLinear = d3.scaleLinear();
    //setting graphs variables for graphs an charts below
    const pieChart = dc.pieChart("#piechart_players_position");
    const scatterplot = dc.scatterPlot("#scatterplot_graph");
    const lineChart = dc.lineChart("#line_graph");
    const leagueRowChart = dc.rowChart("#leagues_spending_rowchart");
    const teamsRowChart = dc.rowChart("#teams_spending_rowchart");
    //end of variables section///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Start of Dimension an group section ////////////////////////////////////////////////////////////////////////////////////////////
    //All dimensions set here with will passed Into dimension functions of charts an graphs
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

    //All dimensions are grouped below
    //setting transfer fee total to be passed into reducesum functions below
    let transferFeeTotal = function(d) {
      return [d.Transfer_fee];
    };
    let totalSpendPerSeasonDim = seasonDim.group().reduceSum(transferFeeTotal);

    let plotGraphSeasonDimGroup = plottingTheDotsDim.group();
    // console.log(plotGraphSeasonDimGroup.all());
    let groupByTransfer = leaugeToDim.group().reduceSum(transferFeeTotal);

    let topTenTeamSpendGroup = topTenTeamSpendDim
      .group()
      .reduceSum(transferFeeTotal);
    let playersPositionGroup = playersPositionDim.group();
    // end of reduce an group vatiables///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //Start of chart building section////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //First function is created  for all charts and there common functions
    //Every chart will be passed to this function
    function allCharts(chart) {
      chart
        .width(w)
        .height(h)
        .transitionDuration(1200) // animation speed (1000ms)
        .transitionDelay(500) // delay animation start (by 500ms)
        .useViewBoxResizing(true);
    }
    //Pie chart
    allCharts(pieChart);
    pieChart
      .dimension(playersPositionDim)
      .group(playersPositionGroup)
      .slicesCap(13)
      .othersGrouper(false)
      .legend(pieChartLegend)
      // title will display as percent when hovered
      .title(pieChartTitle)
      .renderTitle(true);
    // end  pie chart
    //scatterplot
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
      .renderHorizontalGridLines(true) // show chart lines (horizontal)
      .renderVerticalGridLines(true) // show chart lines (verical)
      .yAxis()
      .tickFormat(euroFormat);
    //end scatterplot function
    //line chart
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
    //end of linechart
    //adding function here for common functions in both row charts
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
    dc.renderAll();
    //end of graphs section////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //2 functions added below to override default text angle of linechart,scatterplot chart an piechart
    //Scatterplot and Linechart function
    function xaxisAngle(chart) {
      chart.on("renderlet", function() {
        // rotate x-axis labels
        chart
          .selectAll("g.x text")
          .attr("transform", "translate(-40,30) rotate(315)");
      });
    }
    //passing scatterplot and linechart into function from above
    xaxisAngle(scatterplot);
    xaxisAngle(lineChart);
    //end of xaxis angle function

    // Taken from tutorial found at https://stackoverflow.com/questions/38901300/rotate-pie-label-in-dc-js-pie-chart
    //Pie Chart function
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
  //end of piechart function

  //Dom Manipulation section///////////////////////////////////////////////////////////////////////////////////////
  //adding function to target reset data btn to target  button an reset all data when clicked
  let resetBtn = document.getElementsByClassName("reset-data-btn");
  for (let i = 0; i < resetBtn.length; i++) {
    resetBtn[i].addEventListener("click", function() {
      dc.filterAll();
      dc.renderAll();
    });
  }
  //setting all variables for onclick functions here
  let callOutSection = document.getElementById("callout_text");
  let transferHistorySection = document.getElementById(
    "transfer_history_section"
  );
  let footer = document.getElementById("footer");
  let mainSection = document.getElementById("hiding_section_wrapper");
  let transferHistoryBtn = document.getElementById("transfer_history_btn");
  let stat_data_btn = document.getElementsByClassName("stats_data_btn");

  // targeting data an stats button here as we I want them both to do the same thing
  for (let i = 0; i < stat_data_btn.length; i++) {
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
//End of Dom Manipulation section///////////////////////////////////////////////////////////////////////////////////////
