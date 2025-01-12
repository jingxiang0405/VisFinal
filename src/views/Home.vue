<template>

    <div class="home">
        <Sidebar @update-filter="onFilterChange" />
        <TaiwanMap @select-new-place="onSelectNewPlace" ref="mapRef" />
        <Barchart @request-year-range="requestYearRange" ref="chartRef" />
    </div>

</template>

<script setup>
import TaiwanMap from '@/components/TaiwanMap.vue';
import Sidebar from '@/components/SideBar.vue';
import Barchart from '../components/Barchart.vue';
import DataService from '@/services/data/DataService';
import DataColorMapService from '@/services/data/DataColorMapService';
import { ref } from 'vue';

const mapRef = ref(null);
const chartRef = ref(null);
const years = new DataService.DataBuilder()
    .keep('year')
    .unique()
    .build()
    .map(element => {
        return element.year
    });
let data = null;
let filters = [];
let checked = []
let keepingColumns = ['county', 'district', 'injury', 'death']
let indexes = ['county'];

// checkedFilters: an array of filtered value
function onFilterChange(checkedFilters) {
    checked = checkedFilters;
    const key = Object.keys(checkedFilters)[0];
    if (key === undefined) {
        mapRef.value.setColorData(null);
        return;
    }
    filters = keepingColumns.concat([key]);
    data = new DataService.DataBuilder().keep(filters).countTimesByIndex(indexes, checked).build();
    const colorData = DataColorMapService.map(data);
    mapRef.value.setColorData(colorData);

    chartRef.value.setYears(years);
    chartRef.value.setChartData(data)
    chartRef.value.draw();

}

/*
    placeString = [County]
*/
function onSelectNewPlace(placeString) {

    if (placeString.length === 0) {
        indexes = ['county'];
    }

    else{
        indexes = ['county', 'district'];
    }
    data = new DataService.DataBuilder().keep(filters).countTimesByIndex(indexes, checked).build();
    const colorData = DataColorMapService.map(data);
    console.log("colorData:", colorData)
    mapRef.value.setColorData(colorData);

    chartRef.value.setYears(years);
    chartRef.value.setSelectedCounty(placeString);
    chartRef.value.setChartData(data)
    chartRef.value.draw();
}
</script>

<style scoped>
.home {
    display: flex;
    width: 100vw;
    height: 100vh;
}
</style>