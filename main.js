/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// General functions
*/

const cumulativeSum = (sum => value => sum += value)(0);

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
    return "rgba(" + r + "," + g + "," + b + ", 0.5)";
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
# ===================================================================================
# ===================================================================================
// LINEAR STOCHASTIC EQUATION
*/



window.linstocheq_default_input = {
    A: -0.02,
    T: 2000,
    h: 1,
    Y0: 8,
    sigma: -0.3
}

function calcLinStochEq(input = window.linstocheq_default_input) {
    function f(y, A, t) {
        return A * y;
    }

    // constants
    let A = parseFloat(input['A']), // growth / decay rate
        T = parseInt(input['T']), // integration time in time units
        h = parseFloat(input['h']), // step size in time units
        Y0 = parseFloat(input['Y0']), // initial value
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
        y.push(y[i - 1] + h * f(y[i - 1], A, t[i - 1]) + sigma * Math.sqrt(h) * rnorm()); // (R) Euler forward: y[t+h]<-y[t]+h*A*y[t]
    }
    // return{t,y};

    return {
        t: t,
        y: y
    };

}

function createLinStochReqDatasets(input) {
    const RESULT = calcLinStochEq(input);
    const LABELS = RESULT.t;

    // HISTOGRAM
    const ymin = Math.min.apply(Math, RESULT.y),
        ymax = Math.max.apply(Math, RESULT.y);
    const interval = 1 //(ymax + ymin) / 25;

    let bins = [],
        binCount = 0;

    //Setup Bins
    for (var i = ymin; i < ymax; i += interval) {
        bins.push({
            binNum: binCount,
            minNum: i,
            maxNum: i + interval,
            count: 0
        })
        binCount++;
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
        labels[i] = Math.round((bins[i].minNum + bins[i].maxNum) / 2, 1)
    }

    // line chart
    const LINSTOCHEQ_LINE_DATASET = {
        labels: LABELS,
        yAxisID: 'y',
        xAxisID: 'x',
        data: RESULT.y,
        fill: false,
        borderColor: "black",
        pointRadius: 0,
        type: 'line',
    };
    // HISTOGRAM
    const LINSTOCHEQ_HIST_DATASET = {
        type: 'bar',
        label: 'histogram',
        labels: labels,
        yAxisID: 'y',
        xAxisID: 'x',
        data: histdata,
        backgroundColor: "orange",

        barPercentage: 0.5,
        barThickness: 20,
        maxBarThickness: 30,
    };

    return {
        LINSTOCHEQ_LINE_DATASET: LINSTOCHEQ_LINE_DATASET,
        LINSTOCHEQ_HIST_DATASET: LINSTOCHEQ_HIST_DATASET,
        t: RESULT.t,
        y: RESULT.y,
    }
}

function plotLinStochEq(input = window.linstocheq_default_input) {
    const RESULT = createLinStochReqDatasets(input);

    document.getElementById('linstocheq_line_plot').remove();
    document.getElementById('linstocheq_line_plot_container').innerHTML = '<canvas id="linstocheq_line_plot" ></canvas>';
    let ctx1 = document.getElementById('linstocheq_line_plot');
    const config1 = {
        type: 'line',
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
                    text: 'Linear stochastic equation',
                    font: {
                        Family: 'Helvetica',
                        size: 18
                    }
                },
                legend: {
                    position: 'top',
                    display: false,
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 't',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        }
                    },
                },
                // yAxesHist: {
                //     id: 'yAxisHist',
                //     display: true,
                //     title: {
                //         display: true,
                //         text: "yHist",
                //         font: {
                //             family: 'Helvetica',
                //             size: 16
                //         },
                //     },
                //     min: min + 1,
                //     max: max - 1,
                //     step: step,
                //     // ticks: {
                //     //     callback: function (val, index) {
                //     //         return RESULT.LINSTOCHEQ_HIST_DATASET.labels[index];
                //     //     },
                //     // },
                // },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: 'Helvetica',
                            size: 16
                        },
                    },
                },
            },
            animations: {
                radius: {
                    duration: 400,
                    easing: 'linear',
                    loop: (ctx) => ctx.activate
                }
            },
            hoverRadius: 8,
            hoverBackgroundColor: 'yellow',
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            }
        }
    };
    window.linstocheq_line_plot = new Chart(ctx1, config1);

    document.getElementById('linstocheq_hist_plot').remove();
    document.getElementById('linstocheq_hist_plot_container').innerHTML = '<canvas id="linstocheq_hist_plot" ></canvas>';
    let ctx2 = document.getElementById('linstocheq_hist_plot');
    const config2 = {
        type: 'bar',
        data: {
            labels: RESULT.LINSTOCHEQ_HIST_DATASET.labels,
            datasets: [
                RESULT.LINSTOCHEQ_HIST_DATASET,
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Histogram',
                    font: {
                        Family: 'Helvetica',
                        size: 18
                    }
                },
                legend: {
                    position: 'top',
                    display: false,
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        }
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'frequency',
                        font: {
                            family: 'Helvetica',
                            size: 16
                        },
                    },
                },
            },
            animations: {
                radius: {
                    duration: 400,
                    easing: 'linear',
                    loop: (ctx) => ctx.activate
                }
            },
            hoverRadius: 8,
            hoverBackgroundColor: 'yellow',
            interaction: {
                mode: 'nearest',
                intersect: false,
                axis: 'x'
            }
        }
    };
    window.linstocheq_hist_plot = new Chart(ctx2, config2);
}



/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// RANDOM WALKS
*/

window.random_walks_activeDatasets = [];
window.random_walks_allDatasets = []
window.random_walks_defaultInput = {
    n: 5,
    nsteps: 500
};

function plotRandomGraphs(input = window.random_walks_defaultInput) {
    window.random_walks_activeDatasets = [], window.random_walks_allDatasets = [];
    const n = parseInt(input['n']),
        nsteps = parseInt(input['nsteps']);
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
    document.getElementById('random_walks_plot').remove();
    document.getElementById('random_walks_plot_container').innerHTML = '<canvas id="random_walks_plot" ></canvas>';
    let ctx = document.getElementById('random_walks_plot');
    window.random_walks_temp_plot = new Chart(ctx, {
        type: 'line',
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
                    text: '1D random walk with ' + input["n"] + " graphs",
                    font: {
                        Family: 'Helvetica',
                        size: 18
                    }
                },
                legend: {
                    position: 'top',
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
                        text: 'steps',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        },
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: 'Helvetica',
                            size: 16
                        },
                    },
                },
            },
        },
    });
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// SIMULATION OF 2D DIFFUSION
*/

window.ddiff_labels = new Array(100);
for (let entry = 0; entry < window.ddiff_labels.length; entry++) {
    window.ddiff_labels[entry] = entry;
}

window.ddiff_data = [];

function do2diff_default() {
    const points = 200
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
        }
    }
    const LABELS = window.ddiff_labels
    const DATA = {
        labels: LABELS,
        datasets: [{
                label: 'Dataset 1',
                data: ds1,
                borderColor: "blue",
                backgroundColor: "skyblue",
                pointRadius: 5,
            },
            {
                label: 'Dataset 2',
                data: ds2,
                borderColor: "red",
                backgroundColor: "yellow",
                pointRadius: 5,
            }
        ]
    };
    const config = {
        type: 'scatter',
        data: DATA,
        responsive: true,
        maintainAspectRatio: false,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '2D Diffusion'
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'particles[1,]',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        }
                    },
                    min: 0,
                    max: 100,
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'particles[2,]',
                        font: {
                            family: 'Helvetica',
                            size: 16,
                        }
                    },
                    min: 0,
                    max: 100,
                }
            }
        },
    };

    document.getElementById('ddiff_plot').remove();
    document.getElementById('ddiff_plot_wrapper').innerHTML = '<canvas id="ddiff_plot" style="width:100%;height:100%;"></canvas>';
    let ctx = document.getElementById('ddiff_plot');
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

    chart.update()
}

function do2ddiff() {
    window.do2ddiffintervalId = window.setInterval(update2ddiffPlot, 20);
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// GENERAL
*/

function init() {
    plotRandomGraphs();
    plotLinStochEq();
    do2diff_default();
}
window.onload = init();