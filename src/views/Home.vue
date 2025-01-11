<template>

    <div class="home">
        <Sidebar @update-filter="onFilterChange" />
        <TaiwanMap @select-new-place="onSelectNewPlace" ref="mapRef" />
        <Barchart @request-year-range="requestYearRange" ref="chartRef" :chart-data="chartData" />
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
    .build();
console.log('years:', years)
let chartData = null;

function requestYearRange() {
    chartRef.value.setYear(Number(Math.min(years)), Number(Math.max(years)));
}

// checkedFilters: an array of filtered value
function onFilterChange(checkedFilters) {

    const key = Object.keys(checkedFilters)[0];
    if (key === undefined) {
        mapRef.value.setColorData(null);
        chartRef.value.setCategories([]);
        return;
    }

    const extractColumns = ['county', 'district', 'injury', 'death', key];
    console.log('cols=', extractColumns, 'key=', key)
    const data = new DataService.DataBuilder().keep(extractColumns).countTimesByIndex(['county', 'district'], checkedFilters).build();
     console.log("processed data:", data)
    const colorData = DataColorMapService.map(data);
    console.log('colorData:', colorData)
    mapRef.value.setColorData(colorData);
}

/*
    placeString = [County]/[District]
*/
function onSelectNewPlace(placeString) {
    if (placeString.length === 0) {
        chartRef.value.setPlace("", "");
        return;
    }
    const place = placeString.split('/');
    if (place.length === 1) {
        chartRef.value.setPlace(place[0], "");
        return;
    }

    chartRef.value.setPlace(place[0], place[1]);

}
</script>

<style scoped>
.home {
    display: flex;
    width: 100vw;
    height: 100vh;
}
</style>