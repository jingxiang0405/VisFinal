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
            map: null,
            width: null,
            height: null,
            projection: null,
            path: null,
            initialTransform: null,
            currentCountyD3: null,
            zoom: null,
            tooltip: null,
            isInitMapScale: true,
        }
    },
    props: {
        trafficData: Object,
        defaultLandColor:{
            type : String,
            default: "#cccccc"
        },
        landStrokeColor: {
            type: String,
            default: "#808080"
        },
        districtStrokeColor: {
            type: String,
            default: "black"
        },
        colorScale: Function,
        countyColors: Object

    },

    mounted() {
        console.log("countyColors=", this.countyColors)
        this.geoData = TopoDataService;
        this.container = this.$refs.mapContainer;
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.svg = d3.select(this.$refs.canvas);

        // Set up the projection and path generator
        this.projection = d3.geoMercator()
            .center([121, 23.5]) // Centered around Taiwan
            .scale(this.width * 14)
            .translate([this.width / 2, this.height / 2 + 10]);
        this.path = d3.geoPath().projection(this.projection);
        this.initialTransform = d3.zoomIdentity.scale(1);

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

            // 'this' indicates d3 Object.
            // 'self' indicates Vue execution context 
            const self = this;

            // clear and reappend
            self.svg.selectAll(".map").remove();
            self.map = self.svg.append("g").attr("class", "map");

            // for zooming
            self.zoom = d3.zoom()
                .on("zoom", (event) => {
                    d3.selectAll(".map").attr("transform", event.transform);

                });

            // setup tooltip
            self.tooltip = d3.select(".tooltip");
            self.map.on('mousemove', function (event, d) {
                self.tooltip.style('left', `${event.pageX}px`)
                    .style('top', `${event.pageY - 30}px`);
            })

            // Draw the map
            self.map.selectAll('.geo-path')
                .data(self.geoData["Taiwan"].features)
                .enter().append('path')
                .attr('d', self.path)
                .attr('class', 'geo-path')
                .attr('fill', d => self.countyColors[d.properties.COUNTYNAME].value | self.$props.defaultLandColor)
                .attr('stroke', self.$props.landStrokeColor)
                .attr('stroke-width', 0.5)
                .attr("pointer-events", "all")
                .on('mouseover', function (event, d) {

                    self.tooltip
                        .style('visibility', 'visible')
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`)
                        .text(d.properties.COUNTYNAME);

                    d3.select(this).attr('fill', '#ffcc00');

                })
                .on('mouseout', function (event) {

                    self.tooltip.style('visibility', 'hidden');
                    d3.select(this).attr('fill', d => self.countyColors[d.properties.COUNTYNAME].value | self.$props.defaultLandColor )
                })
                .on('click', function (_, d) {
                    d3.select(this).attr('fiil', d => self.countyColors[d.properties.COUNTYNAME].value | self.$props.defaultLandColor);
                    self.countyOnclick(this, d);
                })

            // zoom back
            self.svg.on("click", function (event) {
                if (!event.target.closest('path') && !self.isInitMapScale) {
                    console.log("zoom back to initial.");
                    self.enableCurrentCountyD3();
                    self.currentCountyD3 = null;
                    self.currentFocusCounty = null;
                    self.map.selectAll('.district-path').remove()
                    self.map.transition().duration(750).call(self.zoom.transform, self.initialTransform);
                    self.isInitMapScale = true;
                }
            });

        },

        countyOnclick(d3context, d) {

            const self = this;
            self.isInitMapScale = false;
            // If has selected a county at last move.
            if (self.currentCountyD3) {
                console.log("zoom from county to county");
                self.enableCurrentCountyD3();
            } else {
                console.log("zoom from init to county");

            }
            self.currentCountyD3 = d3.select(d3context);

            self.disableCurrentCountyD3();

            self.map.selectAll(".district-path").remove();

            self.currentFocusCounty = d.properties.COUNTYNAME;
            // draw detailed district (use Taipei for testing)
            self.map.selectAll(".district-path")
                .data(self.geoData[self.currentFocusCounty].features)
                .enter()
                .append("path")
                .attr("pointer-events", "visiblePainted") // Ensures only the painted area is interactive
                .attr("d", self.path)
                .attr("class", d => `district-path id-${d.properties.ID}`)
                .attr("fill", "none")
                .attr("stroke", self.$props.districtStrokeColor)
                .attr("stroke-width", 0.5)
                .on("mouseover", (event, d) => {
                    self.tooltip
                        .style('visibility', 'visible')
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`)
                        .text(d.properties.DISTRICT);
                    self.currentSelectedDistrictID = d.properties.ID;
                    d3.select(`.district-path.id-${d.properties.ID}`).attr('fill', '#ffcc00');

                })
                .on('mouseout', () => {

                    this.tooltip.style('visibility', 'hidden');

                    d3.select(`.district-path.id-${this.currentSelectedDistrictID}`).attr('fill', d => {
                        let county = d.properties.DISTRICT.substring(0, 3);
                        let district = d.properties.DISTRICT.substring(3);
                        console.log(`${county}/${district}`);
                        return self.countyColors[county][district] | self.$props.defaultLandColor;
                });
                })


            // zoom in
            const bounds = self.path.bounds(d);
            const dx = bounds[1][0] - bounds[0][0];
            const dy = bounds[1][1] - bounds[0][1];
            const x = (bounds[0][0] + bounds[1][0]) / 2;
            const y = (bounds[0][1] + bounds[1][1]) / 2;

            const scale = Math.min(self.width / dx, self.height / dy) * 0.9;
            const translate = [self.width / 2 - scale * x, self.height / 2 - scale * y];
            self.map.transition().duration(500).call(self.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));


        },
        disableCurrentCountyD3() {
            this.currentCountyD3
                .attr('stroke', "none")
                .attr("fill", d => this.countyColors[d.properties.COUNTYNAME].value)
                .on('click', null)
                .on('mouseover', null)
                .on('mouseout', null)
        },

        enableCurrentCountyD3() {
            const self = this;
            self.currentCountyD3
                .attr('stroke', self.$props.landStrokeColor)
                .attr("fill", d => self.countyColors[d.properties.COUNTYNAME].value)
                .on('click', function (_, d) { self.countyOnclick(this, d) })
                .on('mouseover', function (event, d) {
                    console.log("county mouse over");
                    self.tooltip
                        .style('visibility', 'visible')
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`)
                        .text(d.properties.COUNTYNAME);

                    d3.select(this).attr('fill', '#ffcc00');

                })
                .on('mouseout', function (event) {

                    self.tooltip.style('visibility', 'hidden');
                    d3.select(this).attr('fill', '#ccc');
                })
                .on('click', function (_, d) {
                    self.countyOnclick(this, d);
                })
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