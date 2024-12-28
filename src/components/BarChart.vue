<template>
    <div>
      <svg ref="chart" width="1000" height="550"></svg>
      <!-- Tooltip div -->
      <div class="tooltip" ref="tooltip"></div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import trafficData from "@/services/data/DataService";
  
  export default {
    name: "TrafficChart",
    mounted() {
        
    //   this.renderChart();
    },
    methods: {
      renderChart() {
        // 讀取CSV資料
        d3.csv("data.csv").then((data) => {
          // 提取年份
          data.forEach((d) => {
            d.\u767C\u751F\u65E5\u671F = d.\u767C\u751F\u65E5\u671F.slice(0, 4); // 提取年份
          });
  
          // 根據年份分組並計算每年事故數量
          const yearData = Array.from(
            d3.group(data, (d) => d.\u767C\u751F\u65E5\u671F), // 按年份分組
            ([key, value]) => ({ year: key, count: value.length }) // 計算每年事故數量
          );
  
          // 定義圖表的寬高
          const margin = { top: 20, right: 30, bottom: 40, left: 100 },
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
  
          // 設定X和Y軸的範圍
          const x = d3
            .scaleBand()
            .domain(yearData.map((d) => d.year))
            .range([0, width])
            .padding(0.1);
  
          const y = d3
            .scaleLinear()
            .domain([0, d3.max(yearData, (d) => d.count)])
            .nice()
            .range([height, 0]);
  
          // 創建SVG畫布
          const svg = d3
            .select(this.$refs.chart)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
  
          // 在SVG內添加圖表標題
          svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text("每年交通事故統計圖");
  
          // Tooltip 設置
          const tooltip = d3.select(this.$refs.tooltip);
  
          // 繪製X軸
          svg
            .selectAll(".bar")
            .data(yearData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", (d) => x(d.year))
            .attr("y", (d) => y(d.count))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.count))
            .on("mouseover", function (event, d) {
              tooltip.transition().duration(200).style("opacity", 0.9);
              tooltip
                .html(`年份: ${d.year}<br>事故數量: ${d.count}`)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", function () {
              tooltip.transition().duration(500).style("opacity", 0);
            });
  
          svg
            .append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(yearData.length))
            .selectAll(".tick text")
            .attr("class", "axis-label");
  
          // 繪製Y軸
          svg
            .append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(5))
            .selectAll(".tick text")
            .attr("class", "axis-label");
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .bar {
    fill: steelblue;
  }
  .bar:hover {
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
  /* Tooltip 設置 */
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
  </style>
  