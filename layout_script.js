const random_walks_n_slide = document.getElementById('random_walks_n_slide'),
    random_walks_nstep_slide = document.getElementById('random_walks_nsteps_slide'),
    random_walks_SLIDER = document.getElementsByName('1drandomslider'),
    random_walks_value_fields = document.getElementsByName('random-walks-slide-value'),
    random_walks_plot_variables = ["n", "nsteps"];

const random_walks_RESET_BTN = document.getElementById('random_walks_resetBtn');
random_walks_RESET_BTN.onclick = function () {
    window.plotRandomGraphs(); // resets the plot
    random_walks_SLIDER.forEach((element, index) => { // reset the sliders
        const default_value = window.random_walks_defaultInput[random_walks_plot_variables[index]];
        document.getElementById(element.id).value = default_value;
    });
    random_walks_value_fields.forEach((element, index) => { // Reset value fields
      const default_value = window.random_walks_defaultInput[random_walks_plot_variables[index]];
      document.getElementById(element.id).innerHTML = default_value;
    });

}

const random_walks_PLOT_AGAIN_BTN = document.getElementById('random_walks_plotAgainBtn');
random_walks_PLOT_AGAIN_BTN.onclick = function () {
    window.plotRandomGraphs({
        n: document.getElementById('random_walks_n_slide').value,
        nsteps: document.getElementById('random_walks_nsteps_slide').value,
    });
}

for (let entry = 0; entry < random_walks_SLIDER.length; entry++) {
    random_walks_SLIDER[entry].oninput = function () {
      let elem_id = random_walks_SLIDER[entry].id;
      elem_id = elem_id.substring(0,elem_id.length-5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(random_walks_SLIDER[entry].id).value;
    }
    random_walks_SLIDER[entry].onchange = function () {
        window.plotRandomGraphs({
            n: document.getElementById('random_walks_n_slide').value,
            nsteps: document.getElementById('random_walks_nsteps_slide').value,
        });
    }
}
