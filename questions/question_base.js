color_force = "#fc5252"
color_displacement = "#1f77b4"

class Question {
    constructor() {
        this.update_sim_callbacks = [];
        this.update_slider_callbacks = [];

        this.question_type = "equation";
    }

    updateSim() {
        this.sim.simulateOverdamped();
        for(let callback of this.update_sim_callbacks) {
            callback(this.sim)
        }
    }

    updateSlider(d) {
        for(let callback of this.update_slider_callbacks)
            callback(this.sim, d);
    }

    callback_before_test() {

    }

    fill_answer() {

    }
}