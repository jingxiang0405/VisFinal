<template>
    <div class="componet-barchart">
        <div style="overflow-x: auto; width: 100%;">
            <svg id="mainChart"></svg>
        </div>
        <div class="tooltip"></div>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
    data() {

        return {
            selectedCounty: "",
            selectedYear: "",
            years: [],
            chartData: undefined,
        }

    },

    props: {

    },

    mounted() {
        this.draw();
    },

    methods: {

        setChartData(data) {
            this.chartData = data;
        },

        setYears(years) {
            this.years = years;
        },
        draw() {
            console.log("[Barchart]data", this.chartData)

            const self = this;

            if (this.chartData === undefined || Object.keys(self.chartData)[0] == "undefined") return;


            const domains = Object.keys(self.chartData);
            let bands;

            const bandType = (self.selectedCounty.length === 0) ? 'county' : 'district'

            let set = new Set();
            Object.entries(self.chartData).forEach(([_, dataPerDomain]) => {

                dataPerDomain.forEach((data) => {
                    if (bandType == 'county' || data.county == self.selectedCounty) {
                        set.add(data[bandType]);
                    }
                })
            })


            bands = Array.from(set);

            const processedData = bands.map(b => {
                const entry = { b };
                domains.forEach(domain => {
                    const found = self.chartData[domain].find(d => d[bandType] === b);
                    entry[domain] = found ? found.count : 0;
                });
                return entry;
            }).sort((a, b) => a.value - b.value);

            console.log('processed:', processedData)

            let title = "";
            const svg = d3.select("#mainChart");
            svg.selectAll("*").remove();

            const width = parseFloat(svg.style("width"));
            const height = parseFloat(svg.style("height"));
            const margin = { top: 20, right: 20, bottom: 40, left: 50 };
            const chartWidth = width - margin.left - margin.right;
            const chartHeight = height - margin.top - margin.bottom;
            // Scales
            const x0 = d3.scaleBand()
                .domain(bands)
                .range([0, chartWidth])
                .padding(0.2);

            const x1 = d3.scaleBand()
                .domain(domains)
                .range([0, x0.bandwidth()])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(processedData.flatMap(d => domains.map(domain => d[domain])))])
                .range([chartHeight, 0])

            const color = d3.scaleOrdinal()
                .domain(domains)
                .range(d3.schemeCategory10);

            const barPadding = 0.05; // Padding between bars in a group
            const adjustedBarWidth = (x0.bandwidth() - barPadding * (domains.length - 1)) / domains.length;

            // Create chart group
            const chart = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            // Add axes
            const xAxis = d3.axisBottom(x0);
            const yTick = y.ticks()
                .filter(tick => Number.isInteger(tick));
            const yAxis = d3.axisLeft(y).tickValues(yTick).tickFormat(d3.format('d'))


            chart.append("g")
                .attr("transform", `translate(0, ${chartHeight})`)
                .call(xAxis);

            chart.append("g")
                .call(yAxis);

            const tooltip = d3.select("#tooltip")
            // Add bars
            chart.selectAll(".band-group")
                .data(processedData)
                .join("g")
                .attr("class", "band-group")
                .attr("transform", d => `translate(${x0(d.b)}, 0)`)
                .selectAll(".bar")
                .data(d => domains.map(domain => ({ domain, value: d[domain] })))
                .join("rect")
                .attr("class", "bar")
                .attr("x", (d, i) => i * (adjustedBarWidth + barPadding))
                .attr("y", chartHeight)
                .attr("width", adjustedBarWidth)
                .attr("height", 0)
                .attr("fill", d => color(d.domain))
                .transition()
                .duration(1000)
                .ease(d3.easeCubicOut)
                .attr("y", d => y(d.value))
                .attr("height", d => chartHeight - y(d.value))


            // Add legend
            const legend = svg.append("g")
                .attr("transform", `translate(${chartWidth - 100}, 20)`);

            legend.selectAll(".legend-item")
                .data(domains)
                .join("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(0, ${i * 20})`)
                .call(g => {
                    g.append("rect")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", 15)
                        .attr("height", 15)
                        .attr("fill", color);
                    g.append("text")
                        .attr("x", 20)
                        .attr("y", 12)
                        .text(d => d);
                });

        },

        setSelectedCounty(county) {
            this.selectedCounty = county;
        },

    },

}


</script>

<style scoped>
.componet-barchart {
    display: block;
}

.injury-bar {
    fill: steelblue;
}

.injury-bar:hover {
    fill: orange;
}

.death-bar {
    fill: #97CBFF;
}

.death-bar:hover {
    fill: orange;
}

.axis-label {
    font-size: 14px;
    font-weight: bold;
}

.axis path,
.axis line {
    fill: none;
    shape-rendering: crispEdges;
}

.tooltip {
    position: absolute;
    text-align: center;
    padding: 5px;
    font-size: 12px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 5px;
    pointer-events: none;
    opacity: 0;
}

#mainChart {
    width: 50vw;
    height: 75vh;
}
</style>