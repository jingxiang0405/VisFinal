<template>

    <div class="home">
        <Sidebar />
        <TaiwanMap :traffic-data="trafficData" :county-colors="countyColors" :color-scale="colorScale"/>
    </div>

</template>

<script setup>
import TaiwanMap from '@/components/TaiwanMap.vue';
import Sidebar from '@/components/SideBar.vue';

import * as d3 from 'd3';
import trafficData from '@/services/data/DataService';
console.log("traffic=", trafficData);
const currentInterpolator = d3.interpolateRgb("#fff7ec", "#7f0000");

// 生成 countyColors
const countyColors = Object.fromEntries(
    Object.entries(trafficData).map(([county, data]) => {
        // 找出屬性名稱（非物件的值）
        const mainKey = Object.keys(data).find(key => typeof data[key] === "number");
        
        if (!mainKey) return; // 若未找到屬性名稱，跳過該縣市

        // 找出縣市的總值
        const countyValue = data[mainKey];

        // 找出所有區域的值
        const districtValues = Object.entries(data)
            .filter(([key, value]) => typeof value === "number") // 只選擇區域
            .map(([key, value]) => [key, value]);

        // 計算顏色比例尺範圍
        const maxValue = Math.max(countyValue, ...districtValues.map(([, val]) => val));
        const colorScale = d3.scaleSequential().domain([0, maxValue]).interpolator(currentInterpolator);

        // 生成縣市顏色
        const countyColor = colorScale(countyValue);

        // 生成區域顏色
        const districtColors = Object.fromEntries(
            districtValues.map(([district, value]) => [district, colorScale(value)])
        );

        return [
            county,
            {
                value: countyColor,
                districts: districtColors
            }
        ];
    }).filter(Boolean) // 過濾掉無法處理的縣市
);



// console.log("countyColors=", countyColors);


</script>

<style scoped>
.home {
    display: flex;
    width: 100vw;
    height: 100vh;
}
</style>