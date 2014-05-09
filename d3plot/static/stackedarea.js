require(["//cdnjs.cloudflare.com/ajax/libs/d3/3.4.1/d3.min.js", "widgets/js/manager"], function(d3, WidgetManager){

    // Define the D3StackedAreaView
    var D3StackedAreaView = IPython.DOMWidgetView.extend({
        
        render: function(){
            this.guid = 'd3force' + IPython.utils.uuid();
            this.setElement($('<div />', {id: this.guid}));
            
            this.model.on('displayed', this.handle_attached, this);
            this.model.on('change:_values', this.handle_values, this);
            this.model.on('change:_scale', this.handle_scale, this);
            this.model.on('change:width', this.handle_width, this);
            this.model.on('change:height', this.handle_height, this);
            this.model.on('change:hide_xaxis', this.handle_hidex, this);
        },

        handle_hidex: function () {
            $("#" + this.guid + " .x.axis").css('display', this.model.get('hide_xaxis') ? 'none' : '');
        },

        handle_width: function () {
            this.rerender();
        },

        handle_height: function () {
            this.rerender();
        },

        rerender: function () {
            $("#" + this.guid + " svg").remove();
            this.rendered = undefined;
            this.handle_draw();
        },

        handle_scale: function (){
            var scale = this.model.get('_scale');
            this.scale_x
                .domain(scale[0]);
            this.scale_y
                .domain(scale[1]);

            this.svg.select('.x.axis')
                .transition().duration(750)
                .call(this.x_axis);

            this.svg.select('.y.axis')
                .transition().duration(750)
                .call(this.y_axis);
        },

        handle_values: function (){

            var areas = this.svg.selectAll('path.area')
                .data(this.stack_values(this.model.get('_values')));

            areas
                .transition().duration(750)
                .attr('d', this._format_area)
                .attr("fill", this._format_color);

            areas
                .enter()
                .append('path')
                .attr("class", "area")
                .transition().duration(750)
                .attr('d', this._format_area)
                .attr("fill", this._format_color);

            areas
                .exit()
                .transition()
                .duration(750)
                .attr("y", 60)
                .style("fill-opacity", 1e-6)
                .remove();

            var lines = this.svg.selectAll('path.line')
                .data(this.model.get('_line_values'));

            lines
                .transition().duration(750)
                .attr('d', this._format_line)
                .attr("stroke-dasharray", this._format_line_dashes)
                .attr("stroke", this._format_line_color)
                .attr("stroke-width", this._format_line_width)
                .attr("fill", "none");

            lines
                .enter()
                .append('path')
                .attr("class", "line")
                .transition().duration(750)
                .attr('d', this._format_line)
                .attr("stroke-dasharray", this._format_line_dashes)
                .attr("stroke", this._format_line_color)
                .attr("stroke-width", this._format_line_width)
                .attr("fill", "none");
                // .on('mouseover', this.tip.show)
                // .on('mouseout', this.tip.hide);

            lines
                .exit()
                .transition()
                .duration(750)
                .attr("y", 60)
                .style("fill-opacity", 1e-6)
                .remove();
        },

        stack_values: function(data) {
            var last_index = -1;
            for (var i = 0; i < data.length; i++) {
                var values = data[i].values;

                if (values[0].length == 2) {
                    for (var j = 0; j < values.length; j++) {
                        if (last_index == -1) {
                            values[j] = [values[j][0], 0, values[j][1]];
                        } else {
                            values[j] = [values[j][0], data[last_index].values[j][2], data[last_index].values[j][2] + values[j][1]];
                        }
                    }
                    last_index = i;
                }
                data[i].values = values;
            }
            
            return data;
        },

        _calc_width: function(width_str){
            if (typeof width_str === 'number') {
                return width_str;
            }
            width_str = width_str.toLowerCase();
            if (width_str.indexOf('%') > -1) {
                width_str = width_str.replace('%', '');
                return (parseFloat(width_str)  / 100.0) * $("#" + this.guid).parent().width();
            } else if (width_str.indexOf('px') > -1) {
                width_str = width_str.replace('px', '');
                return parseFloat(width_str);
            } else {
                return parseFloat(width_str);
            }
        },

        _calc_height: function(height_str){
            if (typeof height_str === 'number') {
                return height_str;
            }
            height_str = height_str.toLowerCase();
            if (height_str.indexOf('%') > -1) {
                height_str = height_str.replace('%', '');
                return (parseFloat(height_str)  / 100.0) * $("#" + this.guid).parent().height();
            } else if (height_str.indexOf('px') > -1) {
                height_str = height_str.replace('px', '');
                return parseFloat(height_str);
            } else {
                return parseFloat(height_str);
            }
        },

        handle_attached: function(){
            this.handle_draw();
            // var that = this;
            // $( window ).on('resize', function () {
            //     console.log('parent resize');
            //     that.rerender();
            // });
        },

        handle_draw: function(){
            // var format = d3.time.format("%m/%d/%y");
            if (!this.rendered) {
                this.rendered = true;

                var data = this.stack_values(this.model.get('_values'));
                var line_data = this.model.get('_line_values');


                var margin = {top: 20, right: 20, bottom: 30, left: 50},
                    width = this._calc_width(this.model.get('width')) - margin.left - margin.right,
                    height = this._calc_height(this.model.get('height')) - margin.top - margin.bottom;
                var scale = this.model.get('_scale');
                var x = d3.scale.linear()
                    .domain(scale[0])
                    .range([0, width]);
                var y = d3.scale.linear()
                    .domain(scale[1])
                    .range([0, height]);

                this.x_axis = d3.svg.axis()
                    .scale(x)
                    .orient('bottom');

                this.y_axis = d3.svg.axis()
                    .scale(y)
                    .orient('left');

                var vmargin = (margin.top+margin.bottom);
                this.svg = d3.select("#" + this.guid)
                    .append("svg")
                    .attr("height", height+vmargin)
                    .attr("width", width+(margin.left+margin.right))
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                var area = d3.svg.area()
                    .x(function(d) { return x(d[0]); })
                    .y0(function(d) { return (y(d[1])); })
                    .y1(function(d) { return (y(d[2])); });
                var line = d3.svg.line()
                    .x(function(d) { return x(d[0]); })
                    .y(function(d) { return y(d[1]); });
                this._format_area = function (d) {return area(d.values);};
                this._format_line = function (d) {return line(d.values);};
                this._format_color = function (d) {return d.fill;};
                this._format_line_color = function (d) {return d.color;};
                this._format_line_width = function (d) {return d.thickness;};
                this._format_line_dashes = function (d) {return d.dashes;};

                this.svg.selectAll('path.area')
                    .data(data)
                .enter().append('path')
                    .attr("class", "area")
                    .attr("d", this._format_area)
                    .attr("fill", this._format_color);

                this.svg.selectAll('path.line')
                    .data(line_data)
                .enter().append('path')
                    .attr("class", "line")
                    .attr("d", this._format_line)
                    .attr("stroke", this._format_line_color)
                    .attr("stroke-width", this._format_line_width)
                    .attr("stroke-dasharray", this._format_line_dashes)
                    .attr("fill", "none");
                    // .on('mouseover', this.tip.show)
                    // .on('mouseout', this.tip.hide);

                this.svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + height + ")")
                  .call(this.x_axis);

                $("#" + this.guid + " .x.axis").css('display', this.model.get('hide_xaxis') ? 'none' : '');

                this.svg.append("g")
                  .attr("class", "y axis")
                  .call(this.y_axis);

                this.scale_x = x;
                this.scale_y = y;   
            }
        },
        
    });
        
    // Register the D3StackedAreaView with the widget manager.
    WidgetManager.register_widget_view('D3StackedAreaView', D3StackedAreaView);
});