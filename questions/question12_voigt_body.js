class QuestionVoigtBody extends Question {
    constructor() {
        super();
        this.title = "Voigt Body";
        this.text = `

<p>Another important viscoelastic model is the so-called <b>Voigt body</b>.</p>

<p>You see that the <b>deformation response</b> here is much <b>smoother</b> than that of a Maxwell body.</p>
 
 <p>This model can be used to describe the deformation of an <b>elastic cell</b> (e.g. a blood cell) within a <b>fluid</b> (e.g. blood). </p>
 
 <p>Again, use the drag-and-drop editor below to find the simplest representation of the Voigt body, using springs and dashports.</p>
            `;
        this.test_cases = [{
            "name": "Force 1 N",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        },
            {
                "name": "Force 2 N",
                "plot_point": 1,
                "points": [[0, 0], [1, 1]],
                "elements": [["Dashpot", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
                "input": ["Force", "Rectangle", 2, 0, 1]
            },
        ];

        this.text_allowed_elements = `Use the parameters $$p1$$, $$p2$$,`;

        this.text_finshed = `
<p></p>
<p></p>
 <p></p>
  
        `;

        this.question_type = "system";
    }

    fill_answer() {

        function addDisplay(parent, width=undefined, black=false) {
            let scale = 6;
            let svg = d3.select("#info_text").append("svg").attr("width", 300).attr("height", 20);
            width = width || 30*scale;
            let max = 2.8/(30*scale)*width - 0.4;
            let display = new Display(svg, {
                width: width,
                height: 8 * scale,
                xlim: [-0.4, max],
                interactive: false
            });
            if(black) {

            }
            else {
                display.setData(parent.sim3.draw(), parent.sim3);
                display.setPoints(parent.sim3.points, parent.sim3);
            }
            /*
                        parent.update_slider_callbacks.push(function (sim, d) {
                            if(black) {
                                display.setData(sim.drawBlackBox(d));
                                display.setPoints(sim.drawBlackBoxPoints(d), sim);
                            }
                            else {
                                display.setData(sim.draw(d));
                                display.setPoints(sim.get_points(d), sim);
                            }
                        })*/
        }

        d3.select("#info_text").append("p").html("You have found the right representation of a <b>Voigt body</b>!")

        this.sim3 = new System();
        //this.sim2.end_time = 3;
        this.sim3.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 1]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        });
        this.sim3.updateDrawOffsets();
        this.sim3.simulateOverdamped();

        this.display2 = addDisplay(this, 300);

        d3.select("#info_text").append("p").html("Since the spring and the dashpot are aligned in <b>parallel</b>, we have eliminated the rather unrealistic \"<b>jump</b>\" in deformation we saw in the Maxwell body.")
        d3.select("#info_text").append("p").html("There is also <b>no plastic</b> deformation for the Voigt body, as the spring determines the total amplitude of deformation.")
        d3.select("#info_text").append("p").html("However, the parallel dashpot \"<b>slows down</b>\" the deformation of the spring, and the qualitative deformation of the Voigt body depends heavily on the <b>relationship</b> between spring constant and damping coefficient.")

        function addPlotDisplacement(parent, title) {
            let plot1 = new Plot(d3.select("#info_text").append("svg"), {
                xlabel: "time (s)",
                ylabel: "disp. (m)",
                left: 50,
                top: 15,
                bottom: 7,
                innerwidth: 150,
                width: 150 + 50 + 10,
                innerheight: 76,
                height: 76 + 15 + 60
            });
            plot1.setTitle(title)
            //let plot2 = new Plot(d3.select("#plot2"), {xlabel: "time (s)", ylabel: "force (N)", left: 100, top:5, bottom: 100, innerheight: 150, height: 150+5+100});

            let sim = parent.sim3;
            plot1.setXlim(sim.times[0], sim.times[sim.times.length - 1]);
            plot1.setYlim(d3.min(sim.data), d3.max(sim.data));
            plot1.setData([{x: sim.times, y: sim.data}], ["displacement"])

            plot1.y_axis.ticks(3)
            plot1.y_axis_svg.call(plot1.y_axis)
            plot1.y_axis_svg.selectAll(".tick").selectAll("text").attr("x", -18);

            plot1.x_axis.ticks(5)
            plot1.x_axis_svg.call(plot1.x_axis)
            /*
                        function update(sim) {
                            plot1.setXlim(sim.times[0], sim.times[sim.times.length - 1]);
                            plot1.setYlim(d3.min(sim.data), d3.max(sim.data));
                            plot1.setData([{x: sim.times, y: sim.data}], ["displacement"])
                        }
                        function slider_changed(sim, d) {
                            plot1.setCursor([[sim.times[d], sim.data[d]]]);
                        }
                        parent.update_sim_callbacks.push(update)
                        parent.update_slider_callbacks.push(slider_changed)*/
            function setSim(value) {
                console.log(value)
                if(value === 0) {
                    sim.elements[0].strength = 1;
                    sim.elements[1].strength = 0;
                }
                else {
                    let k = sim.elements[1].strength = value;//Math.tan(value*Math.PI/2)

                    sim.elements[0].strength = -k / (Math.log(1 - k))
                    console.log("->", 1 / sim.elements[1].strength * (1 - Math.exp(-sim.elements[0].strength)))
                }
                d3.select("#ratio").text((sim.elements[1].strength / sim.elements[0].strength).toFixed(2))
                sim.simulateOverdamped()

                plot1.setXlim(sim.times[0], sim.times[sim.times.length - 1]);
                plot1.setYlim(d3.min(sim.data), 1);
                plot1.setData([{x: sim.times, y: sim.data}], ["displacement"])
            }
            setSim(0.5);
            window.sliderRatioChanged = function() {
                let value = d3.select("#myRange").node().value / 100;
                setSim(value);
            }

            return plot1
        }

        let p = d3.select("#info_text").append("p");
        renderMathInElement(p.append("span").html(`$$\\frac{k}{D} = $$ `).node(), {delimiters: [{left: "$$", right: "$$", display: false}]});
        p.append("span").html(`xx`).attr("id", "ratio").style("width", "150px").style("display", "inline-block")

        p.append("span").html(` <input type="range" oninput="sliderRatioChanged();" min="0" max="100" value="50" class="slider" id="myRange">`);

        addPlotDisplacement(this, "");
    }

    allowed_elements (sim, index) {
        ///console.log("allowed_elements", sim, this.sim2, this.sim2.points_trajectory, this.sim2.points_trajectory[index]);
        return {
            d : (this.sim2.points_trajectory[index][this.sim2.plot_point]-this.sim2.points_trajectory[0][this.sim2.plot_point])
        }
    }

    callback_before_test(sim) {
        /*
        let data = {
            p1 : 1/sim.elements[1].strength,
            p2 : 1/sim.elements[0].strength,
        }

        let template = create_context_function_template(this.input_value2.node().value, data);
        let user_function = undefined

        user_function = Function(template)();
        this.sim2.elements[0].strength = user_function(data)

        template = create_context_function_template(this.input_value.node().value, data);
        user_function = undefined

        user_function = Function(template)();
        this.sim2.elements[1].strength = user_function(data)
        console.log("data", data, this.sim2.elements[0].strength, this.sim2.elements[1].strength, this.sim2);
        */
        this.sim2.external_protocol = sim.external_protocol;
        this.sim2.external[0].strength = sim.external[0].strength;
        this.sim2.simulateOverdamped();
    }

    start_callback() {
        document.getElementById("equation").value = "d";
        d3.select(d3.select("#question_input").node().parentNode).style("display", "none");
        d3.select("#valid_inputs_box").style("display", "none");
        console.log("start question 1")
        this.sim = new System();
        this.sim.end_time = 3;

        let black_boxes = [
            [1, 1],
            [4, 2],
            [8, 1],
            [1, 8],
            [2, 4],
        ]

        addInput("Blackbox", v=>{this.sim.elements[1].strength = black_boxes[v-1][0]; this.sim.elements[0].strength = black_boxes[v-1][1]}, this.updateSim.bind(this)).select("input").attr("max", 5);
        addInput("F", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 1,
            "points": [[0, 0], [1, 2]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        });
        this.sim.updateDrawOffsets();
        this.sim.simulateOverdamped();

        /*
        this.input = d3.select("#question_text").append("p");
        this.input_text = this.input.append("span").text("Spring $$k$$ = ");
        this.input_value = this.input.append("input").style("width", "40px")

        this.input2 = d3.select("#question_text").append("span");
        this.input_text2 = this.input2.append("span").text("Dashpot $$D$$ = ");
        this.input_value2 = this.input2.append("input").style("width", "40px")
*/
        this.sim2 = new System();
        //this.sim2.end_time = 3;
        this.sim2.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 0,
            "points": [[0, 0]],//, [1, 1], [1, 2]],
            "elements": [],//["Dashpot", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Force", "Rectangle", 1, 0, 1]
        });
        this.sim2.updateDrawOffsets();
        this.sim2.simulateOverdamped();

        let input_select = d3.select("#question_text").append("select")
        input_select.append("option").attr("value", "Spring").text("Spring")
        input_select.append("option").attr("value", "Dashpot").text("Dashpot")

        input_select.on("input", function () {
            let element = self.sim2.elements[self.selected_element_id]
            let element2 = new {"Spring": Spring, "Dashpot": Dashpot, "ForceGenerator": ForceGenerator}[this.value](element.target_ids[0], element.target_ids[1], element.strength);
            self.sim2.elements[self.selected_element_id] = element2;
            self.sim2.init_elements();

            self.sim2.updateDrawOffsets();
            self.display2.setData(self.sim2.draw());
            self.display2.setPoints(self.sim2.points, self.sim2);

            selectedElement(self.selected_element_id);
        })

        let input = d3.select("#question_text").append("span").style("display", "none");
        let input_text = input.append("span");
        let input_value = input.append("input").style("width", "40px").on("input", function() {
            self.parameter_inputs[self.selected_element_id] = this.value;
        });
        let input_unit = input.append("span");
        let button_delete = d3.select("#question_text").append("button").text("remove").style("float", "none");

        this.display2 = addInputDisplay(this, 300);

        self = this;
        this.selected_element_id = undefined;
        this.parameter_inputs = [];

        function selectedElement(i) {
            let element = self.sim2.elements[i];
            self.selected_element_id = i;
            if(self.parameter_inputs[i] === undefined)
                self.parameter_inputs[i] = "";
            input_value.node().value = self.parameter_inputs[i];
            input_value.node().disabled = false;
            input_select.node().value = element.constructor.name;
            input_select.node().disabled = false;

            input_unit.text(element.unit+" ")
            input_text.text(" "+element.strength_name+" = ");

            button_delete.node().disabled = false;

            self.display2.selectElement(i);
        }
        this.display2.selectElementCallback = selectedElement;

        function removeElement() {
            if(self.selected_element_id != undefined) {
                self.sim2.elements.splice(self.selected_element_id, 1);
                self.sim2.removeUnusedPoints();
                deselectElement();

                self.display2.setData(self.sim2.draw());
                self.display2.setPoints(self.sim2.points, self.sim2);
            }
        }
        button_delete.on("click", removeElement);

        function deselectElement() {
            self.display2.selectElement(undefined);
            self.selected_element_id = undefined;
            input_value.attr("disabled", true);
            input_select.attr("disabled", true);
            button_delete.attr("disabled", true);
        }
        deselectElement();

        this.plot1 = addPlotForce(this, "input");
        this.display = addDisplay(this, 150, true);
        this.plot1 = addPlotDisplacement(this, "output");
        let slider = addSlider(this);

        d3.select("#question_text").append("p").html(`<i>Note: find the simplest representation of a Voigt body.<br/>
The evaluation will use $$k=1$$ N/m for every spring and $$D=1$$ Ns/m for each dashpot.</i>`)

        self = this;
        this.update_slider_callbacks.push(
            function (sim, d) {
                self.display.selectAll("path").attr("fill", "black").attr("stroke", "black")
            }
        )
    }
}
