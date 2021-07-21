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
window.activeDatasets = [];
window.allDatasets = []

window.defaultInput = {
    n: 5,
    nsteps: 500
};

function plotRandomGraphs(input = window.defaultInput) {
    window.activeDatasets = [], window.allDatasets = [];
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
        window.activeDatasets.push({
            data: positions,
            fill: false,
            borderColor: poolColors(1)[0],
            pointRadius: 0,
        });
        window.allDatasets.push({
            data: positions,
            fill: false,
            borderColor: poolColors(1)[0],
            pointRadius: 0,
        });
    }
    document.getElementById('randomWalks-plot').remove();
    document.getElementById('plot-container').innerHTML = '<canvas id="randomWalks-plot" ></canvas>';
    let ctx = document.getElementById('randomWalks-plot');
    window.dw_temp_plot = new Chart(ctx, {
        type: 'line',
        data: {
            labels: LABELS,
            datasets: window.activeDatasets,
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
                        }
                    },
                    // ticks: {
                    //     callback: function (value, index, values) {
                    //         return Math.round(window.lastResult['fluxes'][index] * 100) / 100;
                    //     }
                    // }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'y',
                        font: {
                            family: 'Helvetica',
                            size: 16
                        }
                    }
                }
            },
            // animations: {
            //     radius: {
            //         duration: 400,
            //         easing: 'linear',
            //         loop: (ctx) => ctx.activate
            //     }
            // },
            // hoverRadius: 12,
            // hoverBackgroundColor: 'yellow',
            // interaction: {
            //     mode: 'nearest',
            //     intersect: false,
            //     axis: 'x'
            // }
        }
    });
}
window.onload = plotRandomGraphs();