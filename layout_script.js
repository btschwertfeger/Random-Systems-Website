const n_slide = document.getElementById('n_slide'),
    nstep_slide = document.getElementById('nsteps_slide');
const SLIDER = document.getElementsByName('1drandomslider');
const INPUT_FIELDS = document.getElementsByName('sliderAmount');

const plot_variables = ["n", "nsteps"];

const RESET_BTN = document.getElementById('resetBtn');
RESET_BTN.onclick = function () {
    window.plotRandomGraphs(); // resets the plot
    [SLIDER, INPUT_FIELDS].forEach((input_list) => {
        input_list.forEach((element, index) => {
            const default_value = window.defaultInput[plot_variables[index]];
            document.getElementById(element.id).value = default_value;
            document.getElementById(plot_variables[index] + '_slide-amount').value = default_value;
        });
    })
}

const PLOT_AGAIN_BTN = document.getElementById('plotAgainBtn');
PLOT_AGAIN_BTN.onclick = function () {
    window.plotRandomGraphs({
        n: document.getElementById('n_slide').value,
        nsteps: document.getElementById('nsteps_slide').value,
    });
}

for (let entry = 0; entry < SLIDER.length; entry++) {
    SLIDER[entry].oninput = function () {
        document.getElementById(SLIDER[entry].id + "-amount").value = document.getElementById(SLIDER[entry].id).value;
    }
    SLIDER[entry].onchange = function () {
        window.plotRandomGraphs({
            n: document.getElementById('n_slide').value,
            nsteps: document.getElementById('nsteps_slide').value,
        });
    }
}