/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// LINEAR STOCHASTIC EQUATIONS
*/
const linstocheq_A_slide = document.getElementById('linstocheq_A_slide'),
    linstocheq_T_slide = document.getElementById('linstocheq_T_slide'),
    linstocheq_Y0_slide = document.getElementById('linstocheq_Y0_slide'),
    linstocheq_SLIDER = document.getElementsByName('linstocheq_slide'),
    linstocheq_value_fields = document.getElementsByName('linstocheq_slide_value'),
    linstocheq_plot_variables = ["A", "T", "Y0"];

const linstocheq_RESET_BTN = document.getElementById('linstocheq_resetBtn');
linstocheq_RESET_BTN.onclick = function () {
    window.plotLinStochEq(); // resets the plot
    linstocheq_SLIDER.forEach((element, index) => { // reset the sliders
        const default_value = window.linstocheq_default_input[linstocheq_plot_variables[index]];
        document.getElementById(element.id).value = default_value;
    });
    linstocheq_value_fields.forEach((element, index) => { // Reset value fields
        const default_value = window.linstocheq_default_input[linstocheq_plot_variables[index]];
        document.getElementById(element.id).innerHTML = default_value;
    });

}

const linstocheq_PLOT_AGAIN_BTN = document.getElementById('linstocheq_plotAgainBtn');
linstocheq_PLOT_AGAIN_BTN.onclick = function () {
    window.plotLinStochEq({
        A: document.getElementById('linstocheq_A_slide').value,
        T: document.getElementById('linstocheq_T_slide').value,
        h: 1,
        Y0: document.getElementById('linstocheq_Y0_slide').value,
        sigma: -0.3
    });
}

for (let entry = 0; entry < linstocheq_SLIDER.length; entry++) {
    linstocheq_SLIDER[entry].oninput = function () {
        let elem_id = linstocheq_SLIDER[entry].id;
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(linstocheq_SLIDER[entry].id).value;
    }
    linstocheq_SLIDER[entry].onchange = function () {
        window.plotLinStochEq({
            A: document.getElementById('linstocheq_A_slide').value,
            T: document.getElementById('linstocheq_T_slide').value,
            h: 1,
            Y0: document.getElementById('linstocheq_Y0_slide').value,
            sigma: -0.3
        });
    }
}

/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// RANDOM WALKS
*/

const random_walks_n_slide = document.getElementById('random_walks_n_slide'),
    random_walks_nstep_slide = document.getElementById('random_walks_nsteps_slide'),
    random_walks_SLIDER = document.getElementsByName('1drandomslider'),
    random_walks_value_fields = document.getElementsByName('random_walks_slide_value'),
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
        elem_id = elem_id.substring(0, elem_id.length - 5)
        document.getElementById(elem_id + "value").innerHTML = document.getElementById(random_walks_SLIDER[entry].id).value;
    }
    random_walks_SLIDER[entry].onchange = function () {
        window.plotRandomGraphs({
            n: document.getElementById('random_walks_n_slide').value,
            nsteps: document.getElementById('random_walks_nsteps_slide').value,
        });
    }
}


/*
# =========
# =====================
# =====================================
# ===================================================================================
# ===================================================================================
// SIMULATION OF 2D DIFFUSION
*/


const ddiff_goBtn = document.getElementById('ddiff_goBtn');
const ddiff_stepBtn = document.getElementById('ddiff_stepBtn');
const ddiff_stopBtn = document.getElementById('ddiff_stopBtn');
const ddiff_resetBtn = document.getElementById('ddiff_resetBtn');

ddiff_goBtn.onclick = function () {
    clearInterval(window.do2ddiffintervalId);
    window.do2ddiff();
}

ddiff_stepBtn.onclick = function () {
    window.update2ddiffPlot();
}

ddiff_stopBtn.onclick = function () {
    clearInterval(window.do2ddiffintervalId);
}

ddiff_resetBtn.onclick = function () {
    clearInterval(window.do2ddiffintervalId);
    window.do2diff_default();
}