class QuestionHill extends Question {
    constructor() {
        super();
        this.title = "Hill's Muscle Model";
        this.text = `

<p>What you see here is <b>A.V. Hill</b>’s famous <b>quick-release experiment</b>.</p>
<p>
 Hill isolated a <b>frog muscle</b> and mounted it to an apparatus that he designed to study the muscle’s response to a <b>sudden change in force</b>.
 </p>
 <p> 
 The muscle is electrically or chemically <b>stimulated</b> so that it <b>generates force</b>.
  However, it <b>cannot change</b> its length because it is placed between a fixed end (bottom) and a bar (top) that is hold in place via an electrically controlled <b>catch mechanism</b>.
  </p>
  <p>
   When the muscle has reached a constant (isometric) force, the catch mechanism is released, and the force acting on the muscle depends on an adjustable weight.
</p>
    <p>
     If the force is <b>smaller</b> than the <b>maximum muscle force</b>, the muscle <b>shortens</b>.</p>
<p>
In the animation, you see the resulting muscle length over time just as Hill observed it in his experiment. Use the drag-and-drop feature and your knowledge of viscoelastic systems to find a simple muscle model consisting of springs and dashpots that qualitatively describes the experimental findings.
</p>
            `;
        this.test_cases = [{
            "name": "Muscle",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Force", "Theta", 1, 0, 1]
        },
        ];

        this.text_allowed_elements = `Use the parameters $$p1$$, $$p2$$,`;

        this.text_finshed = `
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

        d3.select("#info_text").append("p").html("Congratulations, you have re-created Hill's famous <b>active state model of muscle</b>!")

        this.sim3 = new System();
        //this.sim2.end_time = 3;
        this.sim3.setData({
            "name": "Muscle",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Force", "Theta", 1, 0, 1]
        });
        this.sim3.updateDrawOffsets();
        this.sim3.simulateOverdamped();

        this.display2 = addDisplay(this, 300);

        d3.select("#info_text").append("p").html(`The <b>sudden decrease</b> in muscle length after release can be modeled by a <b>spring</b>. 
 The subsequent <b>exponential decrease</b> in muscle length can be modeled by a <b>spring</b> and <b>dashpot</b> in <b>parallel</b> (Voigt body).`)
        d3.select("#info_text").append("p").html(`Hill published this model in <b>1938</b>. Despite its <b>simplicity</b>, it can <b>qualitatively</b> describe many mechanical aspects of muscle. `)
        d3.select("#info_text").append("img").attr("title", "Archibald Vivian Hill").attr("src", "https://upload.wikimedia.org/wikipedia/commons/c/c9/Archibald_Vivian_Hill.jpg").style("margin", "0 auto").style("display", "block").style("width", "150px")
        d3.select("#info_text").append("p").text("https://upload.wikimedia.org/wikipedia/commons/c/c9/Archibald_Vivian_Hill.jpg").style("font-size", "0.5em").style("color", "gray")
        d3.select("#info_text").append("p").html(`Congratulations! You have finished the <b>ElViS Lesson</b>.`)

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
/*
        let p = d3.select("#info_text").append("p");
        renderMathInElement(p.append("span").html(`$$\\frac{k}{D} = $$ `).node(), {delimiters: [{left: "$$", right: "$$", display: false}]});
        p.append("span").html(`xx`).attr("id", "ratio").style("width", "150px").style("display", "inline-block")

        p.append("span").html(` <input type="range" oninput="sliderRatioChanged();" min="0" max="100" value="50" class="slider" id="myRange">`);

        addPlotDisplacement(this, "");

 */
        d3.select("#button_next_question").style("display", "none");

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

        //addInput("Blackbox", v=>{this.sim.elements[1].strength = black_boxes[v][0]; this.sim.elements[0].strength = black_boxes[v][1]}, this.updateSim.bind(this)).select("input").attr("max", 5);
        addInput("F", v=>this.sim.external[0].strength = v, this.updateSim.bind(this));

        d3.select("#playground_content").append("br")
        d3.select("#playground_content").append("br")

        this.sim.setData({
            "name": "Spring (k = 1 N/m)",
            "plot_point": 2,
            "points": [[0, 0], [1, 1], [1, 2]],
            "elements": [["Dashpot", 0, 1, 1, 1], ["Spring", 0, 1, 1, 1], ["Spring", 1, 2, 1, 1]],
            "input": ["Force", "Theta", 1, 0, 1]
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

        // add info video
        d3.select("#question_text").append("div").attr("class", "info").text("?")
            .append("img").attr("src", "dragdrop.gif")
            .attr("class", "video_info")

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

        //this.plot1 = addPlotForce(this, "input");
        addPlot(this, "input", "external force (mN)", color_force,
            ()=>this.sim.dataF)

        //this.display = addDisplay(this, 150, true);
        this.svg = d3.select("#playground_content").append("svg").html(`
        
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   width="81.913734mm"
   height="31.307337mm"
   viewBox="0 0 81.913733 31.307336"
   version="1.1"
   id="svg918"
   inkscape:version="0.92.3 (2405546, 2018-03-11)"
   sodipodi:docname="Hill.svg">
  <defs
     id="defs912" />
  <sodipodi:namedview
     id="base"
     pagecolor="#ffffff"
     bordercolor="#666666"
     borderopacity="1.0"
     inkscape:pageopacity="0.0"
     inkscape:pageshadow="2"
     inkscape:zoom="3.6430108"
     inkscape:cx="164.28748"
     inkscape:cy="3.2369891"
     inkscape:document-units="mm"
     inkscape:current-layer="layer1"
     showgrid="false"
     showguides="true"
     inkscape:guide-bbox="true"
     fit-margin-top="0"
     fit-margin-left="15"
     fit-margin-right="0"
     fit-margin-bottom="0"
     inkscape:window-width="1920"
     inkscape:window-height="1137"
     inkscape:window-x="-8"
     inkscape:window-y="-8"
     inkscape:window-maximized="1">
    <sodipodi:guide
       position="53.575109,27.881921"
       orientation="0,1"
       id="guide5597"
       inkscape:locked="false" />
    <sodipodi:guide
       position="65.859335,3.2818526"
       orientation="0,1"
       id="guide5599"
       inkscape:locked="false" />
  </sodipodi:namedview>
  <metadata
     id="metadata915">
    <rdf:RDF>
      <cc:Work
         rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type
           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title />
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <g
     inkscape:label="Ebene 1"
     inkscape:groupmode="layer"
     id="layer1"
     transform="translate(11.749684,-28.424292)">
    <path
       style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       d="m 29.623884,31.80181 v 4.536358"
       id="path5298"
       inkscape:connector-curvature="0" />
    <g
       id="lever_parent"
       transformation="translate(29.5, 36.5)"
       transform="translate(29.5,36.5)">
      <g
         id="lever">
        <path
           style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:round;stroke-linejoin:miter;stroke-opacity:1"
           d="M -21,0 21.385044,-0.020092"
           id="lever_part"
           inkscape:connector-curvature="0"
           inkscape:label="#lever"
           sodipodi:nodetypes="cc" />
        <g
           id="weight_parent"
           inkscape:label="#weight"
           transform="translate(-21)">
          <g
             id="weight"
             inkscape:label="#weight">
            <path
               style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:round;stroke-linejoin:miter;stroke-opacity:1"
               d="M 0,0 V 4.204986"
               id="path5317"
               inkscape:connector-curvature="0" />
            <rect
               style="fill:#fefefe;fill-opacity:1;stroke:#000000;stroke-width:0.35277778;stroke-linecap:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:markers fill stroke"
               id="rect5319"
               width="6.4255953"
               height="5.4334078"
               x="-3.1786308"
               y="4.1951618" />
          </g>
        </g>
      </g>
    </g>
    <rect
       style="fill:#fefefe;fill-opacity:1;stroke:#000000;stroke-width:0.35277775;stroke-linecap:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:markers fill stroke"
       id="rect5435"
       width="2.4163039"
       height="6.6611853"
       x="28.371838"
       y="30.85751"
       ry="1.2081519" />
    <g
       id="g5454">
      <rect
         ry="0"
         y="28.424292"
         x="17.339657"
         height="3.4254105"
         width="24.485769"
         id="rect5437"
         style="fill:#fefefe;fill-opacity:1;stroke:none;stroke-width:0.35277778;stroke-linecap:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:markers fill stroke" />
      <g
         transform="translate(-0.2480474)"
         id="g5315">
        <path
           style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
           d="M 17.670387,31.849703 H 42.073475"
           id="path1463"
           inkscape:connector-curvature="0" />
        <g
           id="g5296"
           transform="translate(0,0.13363476)">
          <path
             inkscape:tile-y0="28.434213"
             inkscape:tile-x0="17.746696"
             inkscape:tile-h="3.3275056"
             inkscape:tile-w="3.3275056"
             inkscape:tile-cy="30.097966"
             inkscape:tile-cx="19.410449"
             inkscape:connector-curvature="0"
             id="path1465"
             d="m 17.840241,31.668175 3.140417,-3.140417"
             style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
          <use
             height="100%"
             width="100%"
             id="use5265"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5267"
             transform="translate(2.3292539)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5269"
             transform="translate(4.6585078)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5271"
             transform="translate(6.9877618)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5273"
             transform="translate(9.3170157)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5275"
             transform="translate(11.64627)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5277"
             transform="translate(13.975524)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5279"
             transform="translate(16.304777)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5281"
             transform="translate(18.634031)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
          <use
             height="100%"
             width="100%"
             id="use5283"
             transform="translate(20.963285)"
             xlink:href="#path1465"
             inkscape:tiled-clone-of="#path1465"
             y="0"
             x="0" />
        </g>
      </g>
    </g>
    <path
       style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
       d="M 54.109654,56.449773 H 41.471075"
       id="path1463-5"
       inkscape:connector-curvature="0" />
    <g
       id="g5296-9"
       transform="rotate(-180,41.772275,44.082921)">
      <path
         style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         d="m 29.486511,31.668175 3.140417,-3.140417"
         id="use5275-2"
         inkscape:connector-curvature="0"
         inkscape:tile-x0="17.746696"
         inkscape:tile-y0="28.434213" />
      <path
         style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         d="m 31.815765,31.668175 3.140417,-3.140417"
         id="use5277-7"
         inkscape:connector-curvature="0"
         inkscape:tile-x0="17.746696"
         inkscape:tile-y0="28.434213" />
      <path
         style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         d="m 34.145018,31.668175 3.140417,-3.140417"
         id="use5279-2"
         inkscape:connector-curvature="0"
         inkscape:tile-x0="17.746696"
         inkscape:tile-y0="28.434213" />
      <path
         style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         d="m 36.474272,31.668175 3.140417,-3.140417"
         id="use5281-2"
         inkscape:connector-curvature="0"
         inkscape:tile-x0="17.746696"
         inkscape:tile-y0="28.434213" />
      <path
         style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
         d="m 38.803526,31.668175 3.140417,-3.140417"
         id="use5283-9"
         inkscape:connector-curvature="0"
         inkscape:tile-x0="17.746696"
         inkscape:tile-y0="28.434213" />
    </g>
    <g
       id="muscle_parent"
       inkscape:label="#muscle"
       inkscape:transform-center-x="-0.010821921"
       inkscape:transform-center-y="-9.8705637"
       transform="translate(47.955729,56.323661)">
      <g
         id="muscle">
        <path
           inkscape:connector-curvature="0"
           id="path5385"
           d="M 0,0 V -19.749257"
           style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
        <path
           style="fill:#fefefe;fill-opacity:1;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
           d="m 0.0214764,-15.182624 c 0,0 -2.609303,2.909782 -2.645835,5.7641381 -0.03653,2.854356 2.598588,5.527902 2.598588,5.527902 0,0 2.738524,-3.09238 2.693079,-5.480655 -0.04545,-2.3882761 -2.645832,-5.8113851 -2.645832,-5.8113851 z"
           id="path5387"
           inkscape:connector-curvature="0"
           sodipodi:nodetypes="czczc" />
      </g>
    </g>
    <g
       id="catch_parent"
       transform="matrix(-2.1521241,0,0,-2.1521241,120.93759,147.99019)">
      <g
         inkscape:label="#catch"
         id="catch"
         style="stroke-width:0.46465722">
        <path
           sodipodi:nodetypes="cccc"
           inkscape:connector-curvature="0"
           id="path5389"
           d="m 32.934164,52.173748 h -0.587669 v -0.714266 h 0.587669"
           style="fill:none;stroke:#000000;stroke-width:0.12294055px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
        <path
           sodipodi:nodetypes="cc"
           inkscape:connector-curvature="0"
           id="path5391"
           d="M 32.304538,51.819566 H 29.280482"
           style="fill:none;stroke:#000000;stroke-width:0.12294055px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
      </g>
    </g>
    <text
       id="text5395"
       y="49.633335"
       x="10.234685"
       style="font-style:normal;font-weight:normal;font-size:3.17499995px;line-height:1.25;font-family:sans-serif;text-align:center;letter-spacing:0px;word-spacing:0px;text-anchor:middle;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.26458332"
       xml:space="preserve"><tspan
         style="stroke-width:0.26458332"
         y="49.633335"
         x="10.234685"
         id="tspan5393"
         sodipodi:role="line">weight</tspan></text>
    <text
       inkscape:transform-center-y="0.93544335"
       inkscape:transform-center-x="18.775684"
       id="text5395-1"
       y="54.98254"
       x="37.102608"
       style="font-style:normal;font-weight:normal;font-size:3.17499995px;line-height:1.25;font-family:sans-serif;text-align:center;letter-spacing:0px;word-spacing:0px;text-anchor:middle;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.26458332"
       xml:space="preserve"><tspan
         style="stroke-width:0.26458332"
         y="54.98254"
         x="37.102608"
         id="tspan5393-5"
         sodipodi:role="line">muscle</tspan></text>
    <text
       inkscape:transform-center-y="0.93544335"
       inkscape:transform-center-x="18.775684"
       id="text5395-1-3"
       y="30.800577"
       x="52.038734"
       style="font-style:normal;font-weight:normal;font-size:3.17499995px;line-height:1.25;font-family:sans-serif;text-align:start;letter-spacing:0px;word-spacing:0px;text-anchor:start;fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.26458332"
       xml:space="preserve"><tspan
         style="text-align:start;text-anchor:start;stroke-width:0.26458332"
         y="30.800577"
         x="52.038734"
         id="tspan5393-5-8"
         sodipodi:role="line">catch</tspan><tspan
         id="tspan5433"
         style="text-align:start;text-anchor:start;stroke-width:0.26458332"
         y="34.769329"
         x="52.038734"
         sodipodi:role="line">mechanism</tspan></text>
    <path
       sodipodi:nodetypes="cccccccc"
       inkscape:connector-curvature="0"
       id="path5601"
       d="m 43.145539,47.882259 h 0.851283 l -0.615043,1.860757 h 0.955556 l -1.447181,3.120607 0.397263,-2.274727 h -0.936411 z"
       style="fill:none;stroke:#000000;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
    <circle
       style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:0.35277778;stroke-linecap:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:markers fill stroke"
       id="path5456"
       cx="29.57999"
       cy="36.468056"
       r="0.2" />
  </g>
</svg>


`).style("margin-left", "-50px");

        addPlot(this, "output", "disp. (mm)", color_displacement,
            ()=>this.sim.data.map(x=>-x))
        let slider = addSlider(this);
        window.setState = function(i) {
            d3.select("#lever").attr("transform", `rotate(${i*20})`);
            d3.select("#weight").attr("transform", `rotate(${-i*20})`);
            d3.select("#muscle").attr("transform", `scale(1, ${1-(1-0.66)*i})`);
            d3.select("#catch").attr("transform", `translate(${-2*i}, 0)`);
        }

        this.update_slider_callbacks.push(
            function (sim, d) {
                setState(sim.data[d]/d3.max(sim.data)*0.8);
            }
        )
    }
}
