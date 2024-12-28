<template>

    <div ref="mapContainer" class="map-container">
        <svg ref="canvas" class="canvas" style="width: inherit; height: inherit;">
        </svg>

    </div>
    <div class="tooltip"></div>

</template>

<script>
import * as d3 from 'd3';
import TopoDataService from '@/services/map/TopoDataService';

export default {
    name: 'TaiwanMap',
    data() {
        return {
            geoData: null,
            currentFocusCounty: null, // A string of county/city name
            currentSelectedDistrictID: null,
            container: null,
            svg: null,
            width : null,
            height : null,
            projection : null,
            path : null,
            initialTransform : null
        }
    },
    mounted() {
        this.geoData = TopoDataService;
        console.log("All geo=", this.geoData);
        window.addEventListener('resize', this.handleResize);

        this.container = this.$refs.mapContainer;
        this.width = this.container.offsetWidth;
        this.height =  this.container.offsetHeight;
        this.svg = d3.select(this.$refs.canvas);

        // Set up the projection and path generator
        this.projection = d3.geoMercator()
                .center([121, 23.5]) // Centered around Taiwan
                .scale(this.width * 14)
                .translate([this.width / 2, this.height / 2 + 10]);
        this.path = d3.geoPath().projection(this.projection);
        this.initialTransform = d3.zoomIdentity.scale(1);

        this.drawMap();
    },
    methods: {
        handleResize() {
            d3.select('.tooltip').style('visibility', 'hidden');
            console.log("resize")
            this.drawMap();
        },

        drawMap() {
            console.log("drawing map");

            // 'this' indicates d3 Object.
            // 'self' indicates Vue execution context 
            const self = this;
            self.svg.selectAll(".map").remove();

            const map = self.svg.append("g").attr("class", "map");

            // for zooming
            const zoom = d3.zoom()
                .on("zoom", (event) => {
                    map.attr("transform", event.transform);

                });

            // setup tooltip
            const tooltip = d3.select(".tooltip");

            map.on('mousemove', function (event, d) {
                tooltip.style('left', `${event.pageX}px`)
                    .style('top', `${event.pageY - 30}px`);
            })

            // Draw the map
            map.selectAll('.geo-path')
                .data(self.geoData["Taiwan"].features)
                .enter().append('path')
                .attr('d', self.path)
                .attr('class', 'geo-path')
                .attr('fill', '#ccc')
                .attr('stroke', 'black')
                .attr('stroke-width', 0.5)
                .attr("pointer-events", "all")
                .on('mouseover', function (event, d) {
                    
                    tooltip
                        .style('visibility', 'visible')
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`)
                        .text(d.properties.COUNTYNAME);

                    d3.select(this).attr('fill', '#ffcc00');

                })
                .on('mouseout', function (event) {

                    tooltip.style('visibility', 'hidden');
                    d3.select(this).attr('fill', '#ccc');
                })
                .on('click', function (event, d) {


                    d3.select(this)
                        .attr('fill', '#ccc')
                        .on("mouseover", null)
                        .on("mousemove", null)
                        .on("mouseout", null)
                        .on("click", null);
                    map.selectAll('.geo-path').attr('fill', '#ccc')
                        .on("mouseover", null)
                        .on("mousemove", null)
                        .on("mouseout", null)
                    map.selectAll(".district-path").remove();
                    map.selectAll(".interaction-circle").remove();

                    self.currentFocusCounty = d.properties.COUNTYENG;
                    console.log(self.currentFocusCounty);

                    // draw detailed district (use Taipei for testing)
                    map.selectAll(".district-path")
                        .data(self.geoData[self.currentFocusCounty].features)
                        .enter()
                        .append("path")
                        .attr("d", self.path)
                        .attr("class", d => `district-path id-${d.properties.ID}`)
                        .attr("fill", "none")
                        .attr("stroke", "pink")
                        .attr("stroke-width", 0.75)


                    // for interaction
                    map.selectAll(".interaction-circle")
                        .data(self.geoData[self.currentFocusCounty].features)
                        .enter()
                        .append("circle")
                        .attr("class", "interaction-circle")
                        .attr("cx", d => {
                            const [x] = self.path.centroid(d);
                            return x;
                        })
                        .attr("cy", d => {
                            const [, y] = self.path.centroid(d);
                            return y;
                        })
                        .attr("r", "0.25vh")
                        .attr("fill", "green")
                        .attr("pointer-events", "all")
                        .on("mouseover", (event, d) => {
                            console.log("d=", d.properties.ID)
                            tooltip
                                .style('visibility', 'visible')
                                .style('left', `${event.pageX + 10}px`)
                                .style('top', `${event.pageY + 10}px`)
                                .text(d.properties.DISTRICT);
                            self.currentSelectedDistrictID = d.properties.ID;
                            d3.select(`.district-path.id-${d.properties.ID}`).attr('fill', '#ffcc00');

                        })
                        .on('mouseout', function () {

                            tooltip.style('visibility', 'hidden');
                            d3.select(`.district-path.id-${self.currentSelectedDistrictID}`).attr('fill', '#ccc');
                        })

                    // zoom in
                    const bounds = self.path.bounds(d);
                    const dx = bounds[1][0] - bounds[0][0];
                    const dy = bounds[1][1] - bounds[0][1];
                    const x = (bounds[0][0] + bounds[1][0]) / 2;
                    const y = (bounds[0][1] + bounds[1][1]) / 2;

                    const scale = Math.min(self.width / dx, self.height / dy) * 0.9;
                    const translate = [self.width / 2 - scale * x, self.height / 2 - scale * y];
                    map.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));


                })

            // zoom back
            self.svg.on("click", function (event) {
                if (!event.target.closest('path')) {
                    map.selectAll('.district-path').remove()
                    map.transition().duration(750).call(zoom.transform, self.initialTransform);
                    self.currentFocusCounty = null;

                    // Reset tooltip
                    map.selectAll(".geo-path")
                        .attr("stroke-width", 0.5)
                        .on('mouseover', function (event, d) {
                            tooltip
                                .style('visibility', 'visible')
                                .style('left', `${event.pageX + 10}px`)
                                .style('top', `${event.pageY + 10}px`)
                                .text(d.properties.COUNTYNAME);

                            d3.select(this).attr('fill', '#ffcc00');

                        }).on('mousemove', function (event, d) {

                            // Update tooltip position
                            tooltip
                                .style('left', `${event.pageX}px`)
                                .style('top', `${event.pageY - 30}px`);
                        })
                        .on('mouseout', function (event) {

                            tooltip.style('visibility', 'hidden');
                            d3.select(this).attr('fill', '#ccc');
                        })
                }
            });

        },

        clearZoom(){

        }
    },



}
</script>

<style scoped>
.tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 20px;
    pointer-events: none;
    visibility: hidden;
    white-space: nowrap;
    z-index: 1000;
}

.map-container {
    width: 50vw;
    height: 100vh;
    border: thick double black;
    margin: 1vh;
    border-width: 2px;
    border-color: black;
}
</style>