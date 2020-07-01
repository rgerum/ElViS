color_force = "#fc5252"
color_displacement = "#1f77b4"

class Question {
    constructor() {
        this.update_sim_callbacks = [];
        this.update_slider_callbacks = [];
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
}