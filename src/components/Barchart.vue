<template>
    <div class="componet-barchart">
        <div style="overflow-x: auto; width: 100%;">
            <svg id="mainChart" width="1600" height="550"></svg>
        </div>
        <div class="tooltip"></div>
        <label for="yearSelect">選擇年份:</label>
        <select v-model="selectedYear" @change="draw()" required>
            <option value="" selected></option>
            <option v-for="year in years" :key="year" :value="year">
                {{ year }}
            </option>
        </select>
        <button id="backButtoncity" @click="this.selectedDistrict = ''; draw();"
            style="display: none;">返回distict層級</button>
        <button id="backButtontaiwan" @click="this.selectedDistrict = ''; this.selectedCounty = ''; draw();"
            style="display: none;">返回county層級</button>
    </div>
</template>

<script>
import * as d3 from "d3";

export default {
    data() {

        return {
            selectedCounty: "",
            selectedDistrict: "",
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

        setChartData(data){
            console.log("SetChartData")
            this.chartData = data;
            this.draw();
        },

        setYears(years){
            console.log("SetYears")
            this.years = years;
        },
        draw() {

            const self = this;


            if(this.chartData === undefined)return;
            console.log("[Barchart]data", this.chartData)
            console.log("draw()");

            let chartTitle;
            this.$props.chartData.sort((a, b) => (b.deathCount + b.injuryCount) - (a.deathCount + a.injuryCount));
            //console.log(chartData.count);
            const margin = { top: 40, right: 30, bottom: 60, left: 80 },
                width = 1600 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            const x = d3.scaleBand()
                .domain(this.$props.chartData.map(d => d.name))
                .range([0, width])
                .padding(0.1);

            const y = d3.scaleLinear()
                .domain([0, d3.max(this.$props.chartData, d => Math.max(d.deathCount, d.injuryCount))]).nice()
                .range([height, 0]);

            const svg = d3.select(selector)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            svg.selectAll("*").remove(); // 清空舊圖表

            const g = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            g.append("text")
                .attr("x", width / 2)
                .attr("y", -10)
                .attr("text-anchor", "middle")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .text(chartTitle);

            const tooltip = d3.select(".tooltip");
            // 繪製死亡柱狀圖
            g.selectAll(".death-bar")
                .data(this.$props.chartData)
                .enter().append("rect")
                .attr("class", "death-bar")
                .attr("x", d => x(d.name))
                .attr("y", d => y(d.deathCount))
                .attr("width", x.bandwidth() / 2)  // 設定死亡柱的寬度
                .attr("height", d => height - y(d.deathCount))
                .on("mouseover", function (event, d) {
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html(`名稱: ${d.name}<br>死亡人數: ${d.deathCount}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .on("click", function (event, d) {
                    console.log(d);
                    self.selectedYear = yearSelect.property("value");
                    self.selectedCounty = citySelect.property("value");
                    self.selectedDistrict = districtSelect.property("value");
                    if (!isNaN(d.name.slice(0, 1))) {
                        //draw(selectedYear, selectedCounty, selectedDistrict);
                    }
                    else if (selectedCounty === "") {
                        citySelect.property("value", d.name);
                        draw(); // 更新圖表
                    }
                    else if (self.selectedDistrict === "") {
                        //selectedDistrict = districtSelect.property("value", d.name);
                        districtSelect.property("value", d.name);
                        draw(); // 更新圖表
                    }
                });

            // 繪製受傷柱狀圖
            g.selectAll(".injury-bar")
                .data(this.$props.chartData)
                .enter().append("rect")
                .attr("class", "injury-bar")
                .attr("x", d => x(d.name) + x.bandwidth() / 2)  // 受傷柱的 x 坐標偏移
                .attr("y", d => y(d.injuryCount))
                .attr("width", x.bandwidth() / 2)  // 設定受傷柱的寬度
                .attr("height", d => height - y(d.injuryCount))
                .on("mouseover", function (event, d) {
                    tooltip.transition().duration(200).style("opacity", .9);
                    tooltip.html(`名稱: ${d.name}<br>受傷人數: ${d.injuryCount}`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
                    tooltip.transition().duration(500).style("opacity", 0);
                })
                .on("click", function (event, d) {
                    console.log(d);
                    const selectedYear = yearSelect.property("value");
                    const selectedCounty = citySelect.property("value");
                    const selectedDistrict = districtSelect.property("value");
                    if (!isNaN(d.name.slice(0, 1))) {
                        //draw(selectedYear, selectedCounty, selectedDistrict);
                    }
                    else if (selectedCounty === "") {
                        citySelect.property("value", d.name);
                        draw(); // 更新圖表
                    }
                    else if (selectedDistrict === "") {
                        //selectedDistrict = districtSelect.property("value", d.name);
                        districtSelect.property("value", d.name);
                        draw(); // 更新圖表
                    }
                });
            // 設定柱狀圖的尺度
            const xScale = d3.scaleBand()
                .domain(this.$props.chartData.map(d => d.name))  // X軸是速限的名稱
                .range([0, width])  // 設定寬度
                .padding(0.1);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(this.$props.chartData, d => Math.max(d.deathCount, d.injuryCount))])  // Y軸最大值是死亡和受傷的最大值
                .range([height, 0]);  // 設定高度

            g.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");
            g.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y));
        },
 
        setPlace(county, district) {
            this.selectedCounty = county;
            this.selectedDistrict = district;
            console.log("[Barchart] place set:", this.selectedCounty, this.selectedDistrict)
        },
        setCategories(categories) {
            this.categories = categories;
            console.log("[Barchart]Categories set:", this.categories);
            this.draw();
        }
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

#backButton {
    margin-top: 10px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}

#backButton:hover {
    background-color: #0056b3;
}
</style>