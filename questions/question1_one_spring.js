class QuestionOneSpring extends Question {
    constructor() {
        super();
        this.title = "One Spring";
        this.text = `
<p>The first element we need to build visco-elastic systems, is the <b>spring</b> the elastic element.</p>
<p>In the <b>playground</b> you can experiment with this element and derive a formula for the force of such an element.</p>
<p>What force $$F$$ does a spring with a <b>spring constant</b> $$k$$ create when <b>displaced</b> by $$d$$?</p>
`;
        this.test_cases = [{
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Spring stiff (k = 2 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 2, 1]],
                "input": ["Displacement", "Rectangle", 1, 0, 2]
            },
            {
                "name": "Spring soft (k = 0.5 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 0.5, 1]],
                "input": ["Displacement", "Rectangle", 1, 0, 1]
            },
            {
                "name": "Ramp (k = 1 N/m)",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Spring", 0, 1, 1, 1]],
                "input": ["Displacement", "Ramp", 1, 0, 1]
            }
        ];

        this.text_allowed_elements = `Use, the spring constant \\(k\\), the displacement \\(d\\),`;
    }

    allowed_elements (sim, index) {
        return {
            t: sim.times[index],
            F: sim.dataF[index],
            k: sim.elements[0].strength,
            d: (sim.points_trajectory[index][sim.plot_point]-sim.points_trajectory[0][sim.plot_point])
        }
    }

    start_callback() {
        d3.select("#question_input").html('$$F$$');
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        addInput("k", v=>this.sim.elements[0].strength = v, this.updateSim.bind(this));
        addInput("d", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Spring", 0, 1, 1, 1]],
            "input": ["Displacement", "Rectangle", 1, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        this.plot1 = addPlotDisplacement(this, "input");
        this.display = addDisplay(this);
        this.plot1 = addPlotForce(this, "output");
        let slider = addSlider(this);
    }
}
