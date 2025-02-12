/*
<!--
    ########################################
    ## @author Benjamin Thomas Schwertfeger (July 2021)
    ## copyright by Benjamin Thomas Schwertfeger (July 2021)
    ############

    https://paleodyn.uni-bremen.de/study/MES/MES_11b.html
    https://paleodyn.uni-bremen.de/study/MES/MES_11.html
-->
*/
/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# General functions
*/

const cumulativeSum = (
  (sum) => (value) =>
    (sum += value)
)(0);

function range(start, end, step) {
  var range = [];
  var typeofStart = typeof start;
  var typeofEnd = typeof end;

  if (step === 0) {
    throw TypeError("Step cannot be zero.");
  }

  if (typeofStart == "undefined" || typeofEnd == "undefined") {
    throw TypeError("Must pass start and end arguments.");
  } else if (typeofStart != typeofEnd) {
    throw TypeError("Start and end arguments must be of same type.");
  }
  typeof step == "undefined" && (step = 1);

  if (end < start) {
    step = -step;
  }
  if (typeofStart == "number") {
    while (step > 0 ? end >= start : end <= start) {
      range.push(start);
      start += step;
    }
  } else if (typeofStart == "string") {
    if (start.length != 1 || end.length != 1) {
      throw TypeError("Only strings with one character are supported.");
    }
    start = start.charCodeAt(0);
    end = end.charCodeAt(0);
    while (step > 0 ? end >= start : end <= start) {
      range.push(String.fromCharCode(start));
      start += step;
    }
  } else {
    throw TypeError("Only string and number types are supported");
  }
  return range;
}

function dynamicColors() {
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ", 0.8)";
}

function poolColors(a) {
  let pool = [];
  for (let i = 0; i < a; i++) {
    pool.push(dynamicColors());
  }
  return pool;
}

function rnorm() {
  var u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# LINEAR STOCHASTIC EQUATION
*/

window.linstocheq_default_input = {
  A: -0.02,
  T: 2000,
  h: 1,
  Y0: 8,
  sigma: -0.3,
};

function calcLinStochEq(input = window.linstocheq_default_input) {
  function f(y, A, t) {
    return A * y;
  }

  // constants
  let A = parseFloat(input["A"]), // growth / decay rate
    T = parseInt(input["T"]), // integration time in time units
    h = parseFloat(input["h"]), // step size in time units
    Y0 = parseFloat(input["Y0"]), // initial value
    sigma = -0.3;

  let n = T / h; // number of time steps (time / timestep)
  let t = new Array(n), // create a vector of discrete timesteps
    y = new Array(); // define an empty vector for the state variable y(t)
  y[0] = Y0; // assign initial value

  for (let entry = 0; entry < t.length; entry++) {
    t[entry] = entry;
  }

  // integration loop
  for (let i = 1; i < n; i++) {
    y.push(
      y[i - 1] + h * f(y[i - 1], A, t[i - 1]) + sigma * Math.sqrt(h) * rnorm(),
    ); // (R) Euler forward: y[t+h]<-y[t]+h*A*y[t]
  }
  // return{t,y};

  return {
    t: t,
    y: y,
  };
}

function createLinStochReqDatasets(input) {
  const RESULT = calcLinStochEq(input);
  const LABELS = RESULT.t;

  // HISTOGRAM
  const ymin = Math.min.apply(Math, RESULT.y),
    ymax = Math.max.apply(Math, RESULT.y);

  const bars = 25; //(maximal bars)
  const bin_brakes = [...new Array(bars + 1)].map(
    (elem, index) => ((index - bars / 2) * ymax) / 10,
  );
  let bins = [];

  //Setup Bins (old)
  // binCount = 0;
  // const interval = 1; //(ymax + ymin) / 15;
  // for (var i = ymin; i < ymax; i+=interval) {
  //     bins.push({
  //         binNum: binCount,
  //         minNum: i,
  //         maxNum: i + interval,
  //         count: 0
  //     })
  //     binCount++;
  // }

  for (let i = 0; i < bin_brakes.length - 1; i++) {
    bins.push({
      binNum: i,
      minNum: bin_brakes[i],
      maxNum: bin_brakes[i + 1],
      count: 0,
    });
  }

  //Loop through data and add to bin's count
  for (let i = 0; i < RESULT.y.length; i++) {
    let item = RESULT.y[i];
    for (let j = 0; j < bins.length; j++) {
      let bin = bins[j];
      if (item > bin.minNum && item <= bin.maxNum) {
        bin.count++;
        break; // An item can only be in one bin.
      }
    }
  }

  let histdata = new Array(bins.length),
    labels = new Array(bins.length);
  for (let i = 0; i < bins.length; i++) {
    histdata[i] = bins[i].count;
    labels[i] = Math.round((bins[i].minNum + bins[i].maxNum) / 2, 1);
  }

  // line chart
  const LINSTOCHEQ_LINE_DATASET = {
    labels: LABELS,
    yAxisID: "y",
    xAxisID: "x",
    data: RESULT.y,
    fill: false,
    borderColor: "black",
    pointRadius: 0,
    type: "line",
  };
  // HISTOGRAM
  const LINSTOCHEQ_HIST_DATASET = {
    type: "bar",
    label: "Density",
    labels: labels,
    yAxisID: "y",
    xAxisID: "x",
    data: histdata,
    backgroundColor: "orange",
    borderColor: "yellow",
    borderWidth: 1,
    borderRadius: 5,

    barPercentage: 0.5,
    barThickness: 20,
    maxBarThickness: 30,
  };

  return {
    LINSTOCHEQ_LINE_DATASET: LINSTOCHEQ_LINE_DATASET,
    LINSTOCHEQ_HIST_DATASET: LINSTOCHEQ_HIST_DATASET,
    t: RESULT.t,
    y: RESULT.y,
  };
}

function plotLinStochEq(input = window.linstocheq_default_input) {
  const RESULT = createLinStochReqDatasets(input);

  // LINE CHART
  document.getElementById("linstocheq_line_plot").remove();
  document.getElementById("linstocheq_line_plot_container").innerHTML =
    '<canvas id="linstocheq_line_plot" ></canvas>';
  let ctx1 = document.getElementById("linstocheq_line_plot");
  const config1 = {
    type: "line",
    data: {
      labels: RESULT.t, //RESULT.LINSTOCHEQ_HIST_DATASET.labels,
      datasets: [
        RESULT.LINSTOCHEQ_LINE_DATASET,
        // RESULT.LINSTOCHEQ_HIST_DATASET,
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Linear stochastic equation",
          font: {
            Family: "Helvetica",
            size: 18,
          },
        },
        legend: {
          position: "top",
          display: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "t",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
        },
      },
      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverRadius: 8,
      hoverBackgroundColor: "yellow",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.linstocheq_line_plot = new Chart(ctx1, config1);

  // HISTOGRAM
  document.getElementById("linstocheq_hist_plot").remove();
  document.getElementById("linstocheq_hist_plot_container").innerHTML =
    '<canvas id="linstocheq_hist_plot" ></canvas>';
  let ctx2 = document.getElementById("linstocheq_hist_plot");
  const config2 = {
    type: "bar",
    data: {
      labels: RESULT.LINSTOCHEQ_HIST_DATASET.labels,
      datasets: [RESULT.LINSTOCHEQ_HIST_DATASET],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Histogram",
          font: {
            Family: "Helvetica",
            size: 18,
          },
        },
        legend: {
          position: "top",
          display: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Density",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
        },
      },
      animations: {
        radius: {
          duration: 400,
          easing: "linear",
          loop: (ctx) => ctx.activate,
        },
      },
      hoverBackgroundColor: "yellow",
      interaction: {
        mode: "nearest",
        intersect: false,
        axis: "x",
      },
    },
  };
  window.linstocheq_hist_plot = new Chart(ctx2, config2);
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# RANDOM WALKS
*/

window.random_walks_activeDatasets = [];
window.random_walks_allDatasets = [];
window.random_walks_defaultInput = {
  n: 5,
  nsteps: 500,
};

function plotRandomGraphs(input = window.random_walks_defaultInput) {
  (window.random_walks_activeDatasets = []),
    (window.random_walks_allDatasets = []);
  const n = parseInt(input["n"]),
    nsteps = parseInt(input["nsteps"]);
  let LABELS = range(0, nsteps, 1),
    x = [-1, 1],
    y = 0;

  for (let i = 0; i < n; i++) {
    let steps = new Array(nsteps);
    for (let entry = 0; entry < steps.length; entry++) {
      steps[entry] = x[Math.floor(Math.random() * x.length)];
    }

    let positions = new Array(steps.length);
    for (let entry = 0; entry < positions.length; entry++) {
      if (entry == 0) {
        positions[entry] = parseInt(steps[entry]);
      } else {
        positions[entry] = parseInt(positions[entry - 1] + steps[entry]);
      }
    }
    // let positions = steps.map(cumulativeSum);steps.map(cumulativeSum)
    window.random_walks_activeDatasets.push({
      data: positions,
      fill: false,
      borderColor: poolColors(1)[0],
      pointRadius: 0,
    });
    window.random_walks_allDatasets.push({
      data: positions,
      fill: false,
      borderColor: poolColors(1)[0],
      pointRadius: 0,
    });
  }
  document.getElementById("random_walks_plot").remove();
  document.getElementById("random_walks_plot_container").innerHTML =
    '<canvas id="random_walks_plot" ></canvas>';
  let ctx = document.getElementById("random_walks_plot");

  const config = {
    type: "line",
    data: {
      labels: LABELS,
      datasets: window.random_walks_activeDatasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Simple random walk with " + input["n"] + " graphs",
          font: {
            Family: "Helvetica",
            size: 18,
          },
        },
        legend: {
          position: "top",
          display: false,
          labels: {
            filter: function (label, index) {
              if (label.text) return true;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "steps",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
        },
      },
    },
  };
  window.random_walks_temp_plot = new Chart(ctx, config);
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# 2D RANDOM WALKS
*/

window.random_walks2d_defaultInput = {
  nsteps: 1000,
};
window.randomwalks2d_stepsWithoutChange = 0;

function plot_default_2DRandomWalk(input = window.random_walks2d_defaultInput) {
  window.randomwalk2d_lastStepNr = 0;
  let data = new Array();
  data.push({
    x: 0,
    y: 0,
    r: 3,
  });
  // const LABELS = [0, 0];
  const DATA = {
    // labels: LABELS,
    datasets: [
      {
        label: "Dataset 1",

        data: data,
        borderColor: "blue",
        backgroundColor: "blue",
        pointRadius: 4,
      },
    ],
  };
  const config = {
    type: "bubble",
    data: DATA,
    responsive: true,
    maintainAspectRatio: false,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          display: false,
        },
        title: {
          display: true,
          text: "2D Random Walk",
          font: {
            Family: "Helvetica",
            size: 18,
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "x",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
          min: -100,
          max: 100,
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
          min: -100,
          max: 100,
        },
      },
    },
  };

  document.getElementById("random_walks2d_plot").remove();
  document.getElementById("random_walks2d_plot_container").innerHTML =
    '<canvas id="random_walks2d_plot" style="width:100%; height:100%"></canvas>';
  let ctx = document.getElementById("random_walks2d_plot");
  window.random_walks2d_chart = new Chart(ctx, config);
}

function containsObject(obj, list) {
  for (let entry = 0; entry < list.length; entry++) {
    if (list[entry].x === obj.x && list[entry].y === obj.y) {
      let val = window.random_walks2d_chart.data.datasets[0].data[entry].r;
      if (val < 10) {
        window.random_walks2d_chart.data.datasets[0].data[entry].r += 1;
        window.random_walks2d_chart.update();
      }
      window.randomwalks2d_stepsWithoutChange += 1;
      return true;
    }
  }
  window.randomwalks2d_stepsWithoutChange = 0;
  return false;
}

function update2DRandomWalkPlot() {
  let val = Math.random(),
    chart = window.random_walks2d_chart;

  let dataset = chart.data.datasets[0];
  let i = dataset.data.length;
  let lastX = dataset.data[i - 1].x,
    lastY = dataset.data[i - 1].y;

  const r = 3,
    oldLength = dataset.data.length,
    newVal = 5; //(Math.round(Math.random()) == 0) ? 2.5 : 5;
  if (val <= 0.25) {
    if (
      !containsObject(
        {
          x: lastX + newVal,
          y: lastY,
        },
        dataset.data,
      )
    ) {
      dataset.data.push({
        x: lastX + newVal,
        y: lastY,
        r: r,
      });
    }
  } else if (val <= 0.5) {
    if (
      !containsObject(
        {
          x: lastX - newVal,
          y: lastY,
        },
        dataset.data,
      )
    ) {
      dataset.data.push({
        x: lastX - newVal,
        y: lastY,
        r: r,
      });
    }
  } else if (val <= 0.75) {
    if (
      !containsObject(
        {
          x: lastX,
          y: lastY + newVal,
        },
        dataset.data,
      )
    ) {
      dataset.data.push({
        x: lastX,
        y: lastY + newVal,
        r: r,
      });
    }
  } else {
    if (
      !containsObject(
        {
          x: lastX,
          y: lastY - 5,
        },
        dataset.data,
      )
    ) {
      dataset.data.push({
        x: lastX,
        y: lastY - 5,
        r: r,
      });
    }
  }

  if (oldLength != dataset.data.length) {
    let xmin = chart.options.scales.x.min,
      xmax = chart.options.scales.x.max,
      ymin = chart.options.scales.y.min,
      ymax = chart.options.scales.y.max;

    if (dataset.data[i].x >= xmax * 0.9) {
      chart.options.scales.x.max += xmax;
    }
    if (dataset.data[i].y >= ymax * 0.9) {
      chart.options.scales.y.max += ymax;
    }
    if (dataset.data[i].x <= xmin * 0.9) {
      chart.options.scales.x.min += xmin;
    }
    if (dataset.data[i].y <= ymin * 0.9) {
      chart.options.scales.y.min += ymin;
    }
  }
  window.random_walks2d_chart.update();
  if (window.randomwalks2d_stepsWithoutChange > 30) {
    clearInterval(window.do_2dRandomWalkintervalId);
  }
}

function do_2dRandomWalk() {
  window.do_2dRandomWalkintervalId = window.setInterval(
    update2DRandomWalkPlot,
    40,
  );
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# SIMULATION OF 2D DIFFUSION
*/

window.ddiff_labels = new Array(100);
for (let entry = 0; entry < window.ddiff_labels.length; entry++) {
  window.ddiff_labels[entry] = entry;
}

window.ddiff_data = [];

function do2diff_default() {
  const points = 200;
  let ds1 = new Array(points),
    ds2 = new Array(points);

  for (let entry = 0; entry < points; entry++) {
    ds1[entry] = {
      x: 25,
      y: 25,
    };
    ds2[entry] = {
      x: 75,
      y: 75,
    };
  }
  const LABELS = window.ddiff_labels;
  const DATA = {
    labels: LABELS,
    datasets: [
      {
        label: "particle type 1",
        data: ds1,
        borderColor: "blue",
        backgroundColor: "transparent",
        pointRadius: 5,
      },
      {
        label: "particle type 2",
        data: ds2,
        borderColor: "red",
        backgroundColor: "transparent",
        pointRadius: 5,
      },
    ],
  };
  const config = {
    type: "scatter",
    data: DATA,
    responsive: true,
    maintainAspectRatio: false,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "2D Diffusion",
          font: {
            Family: "Helvetica",
            size: 18,
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "x",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
          min: 0,
          max: 100,
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "y",
            font: {
              family: "Helvetica",
              size: 16,
            },
          },
          min: 0,
          max: 100,
        },
      },
    },
  };

  document.getElementById("ddiff_plot").remove();
  document.getElementById("ddiff_plot_container").innerHTML =
    '<canvas id="ddiff_plot" style="width:100%;height:100%;"></canvas>';
  let ctx = document.getElementById("ddiff_plot");
  window.ddiff_plot = new Chart(ctx, config);
}

function update2ddiffPlot() {
  let chart = window.ddiff_plot;
  let datasets = chart.data.datasets;
  for (let dataset = 0; dataset < datasets.length; dataset++) {
    for (let entry = 0; entry < datasets[dataset].data.length; entry++) {
      if (Math.random() >= 0.5) {
        chart.data.datasets[dataset].data[entry].x += Math.random() * 3; //2;
      }
      if (Math.random() >= 0.5) {
        chart.data.datasets[dataset].data[entry].x -= Math.random() * 3; //2;
      }
      if (Math.random() >= 0.5) {
        chart.data.datasets[dataset].data[entry].y += Math.random() * 3; //2;
      }
      if (Math.random() >= 0.5) {
        chart.data.datasets[dataset].data[entry].y -= Math.random() * 3; //2
      }

      if (chart.data.datasets[dataset].data[entry].y <= 1) {
        chart.data.datasets[dataset].data[entry].y++;
      }
      if (chart.data.datasets[dataset].data[entry].x <= 1) {
        chart.data.datasets[dataset].data[entry].x++;
      }

      if (chart.data.datasets[dataset].data[entry].y >= 99) {
        chart.data.datasets[dataset].data[entry].y--;
      }
      if (chart.data.datasets[dataset].data[entry].x >= 99) {
        chart.data.datasets[dataset].data[entry].x--;
      }
    }
  }

  chart.update();
}

function do2ddiff() {
  window.do2ddiffintervalId = window.setInterval(update2ddiffPlot, 20);
}

/*
# =========
# =====================
# =====================================
# ==============================================================================
# ==============================================================================
# GENERAL
*/

function init() {
  plotLinStochEq();
  plotRandomGraphs();
  plot_default_2DRandomWalk();
  do2diff_default();
}
window.onload = init();
