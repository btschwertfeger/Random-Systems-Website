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
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// LINEAR STOCHASTIC EQUATION
window.linstocheq_default_input = {
  A: -0.02,
  T: 2000,
  h: 1,
  Y0: 8,
  sigma: -0.3
}
function calcLinStochEq(input = window.linstocheq_default_input){
  function f(y, A, t){
    return A*y;
  }

  // constants
  let A = input['A'],        // growth / decay rate
      T = input['T'],         // integration time in time units
      h = input['h'],            // step size in time units
      Y0 = input['Y0'],           // initial value
      sigma = -0.3;

  let n = T/h;          // number of time steps (time / timestep)
  let t = new Array(n), // create a vector of discrete timesteps
      y = new Array();  // define an empty vector for the state variable y(t)
  y[0] = Y0;            // assign initial value

  for(let entry = 0; entry < t.length; entry++){
    t[entry] = entry;
  }

  // integration loop
  console.log(y)
  for(let i = 1; i < n; i++){
    y.push(y[i-1] + h * f(y[i-1], A, t[i-1]) + sigma * Math.sqrt(h) * rnorm()); // (R) Euler forward: y[t+h]<-y[t]+h*A*y[t]
  }
  return {t, y};
}

function plotLinStochEq(){
  const result = calcLinStochEq();
  const LABELS = result.t;
  console.log(result.y)

  const LINSTOCHEQ_DATASET = [{
        data: result.y,
        fill: false,
        borderColor: "black",
        pointRadius: 0,
  }];

  document.getElementById('linstocheq_plot').remove();
  document.getElementById('linstocheq_plot_container').innerHTML = '<canvas id="linstocheq_plot" ></canvas>';
  let ctx = document.getElementById('linstocheq_plot');
  window.linstocheq_plot = new Chart(ctx, {
      type: 'line',
      data: {
          labels: LABELS,
          datasets: LINSTOCHEQ_DATASET,
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
                  //labels: {
                  //    filter: function (label, index) {
                  //        if (label.text) return true;
                  //    },
                  //},
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
  });
}





// RANDOM WALKS
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

// DONE



function init(){
  plotRandomGraphs()
  plotLinStochEq()
}
window.onload = init();
