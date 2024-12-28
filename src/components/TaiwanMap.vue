<template>

    <div ref="mapContainer" class="map-container">
        <svg ref="canvas" class="canvas" style="width: inherit; height: inherit;">
            <g ref="map">

            </g>
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
            currentSelectedDistrictID: null
        }
    },
    mounted() {
        this.geoData = TopoDataService;
        console.log("All geo=", this.geoData);
        window.addEventListener('resize', this.handleResize);
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
            // cleanup
            const container = this.$refs.mapContainer;
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const svg = d3.select(this.$refs.canvas);
            const map = d3.select(this.$refs.map);

            // Set up the projection and path generator
            const projection = d3.geoMercator()
                .center([121, 23.5]) // Centered around Taiwan
                .scale(width * 14)
                .translate([width / 2, height / 2 + 10]);

            const path = d3.geoPath().projection(projection);

            // for zooming
            const initialTransform = d3.zoomIdentity.scale(1);
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
            const self = this;
            map.selectAll('.geo-path')
                .data(self.geoData["Taiwan"].features)
                .enter().append('path')
                .attr('d', path)
                .attr('class', 'geo-path')
                .attr('fill', '#ccc')
                .attr('stroke', 'black')
                .attr('stroke-width', 0.5)
                .attr("pointer-events", "all")
                .on('mouseover', function (event, d) {
                    const tooltip = d3.select('.tooltip');
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
                    d3.selectAll('.geo-path').attr('fill', '#ccc')
                        .on("mouseover", null)
                        .on("mousemove", null)
                        .on("mouseout", null)

                    self.currentFocusCounty = d.properties.COUNTYENG;
                    console.log(self.currentFocusCounty);
                    // draw detailed district (use Taipei for testing)
                    map.selectAll(".district-path")
                        .data(self.geoData[self.currentFocusCounty].features)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .attr("class", d => `district-path id-${d.properties.ID}`)
                        .attr("fill", "none")
                        .attr("stroke", "pink")
                        .attr("stroke-width", 0.75)


                    // for interaction
                    map.selectAll(".interaction-circle")
                        .data(self.geoData["TaipeiCity"].features)
                        .enter()
                        .append("circle")
                        .attr("class", "interaction-circle")
                        .attr("cx", d => {
                            const [x] = path.centroid(d);
                            return x;
                        })
                        .attr("cy", d => {
                            const [, y] = path.centroid(d);
                            return y;
                        })
                        .attr("r", "0.25vh")
                        .attr("fill", "none")
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
                    const bounds = path.bounds(d);
                    const dx = bounds[1][0] - bounds[0][0];
                    const dy = bounds[1][1] - bounds[0][1];
                    const x = (bounds[0][0] + bounds[1][0]) / 2;
                    const y = (bounds[0][1] + bounds[1][1]) / 2;

                    const scale = Math.min(width / dx, height / dy) * 0.9;
                    const translate = [width / 2 - scale * x, height / 2 - scale * y];
                    map.transition().duration(500).call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));


                })

            // Click event for zooming back to original view
            svg.on("click", function (event) {
                if (!event.target.closest('path')) {
                    map.selectAll('.district-path').remove()
                    map.transition().duration(750).call(zoom.transform, initialTransform);
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