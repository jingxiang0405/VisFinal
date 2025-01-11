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
    console.log("[FilterChange]: ", data)
    checked = checkedFilters;
    const key = Object.keys(checkedFilters)[0];
    if (key === undefined) {
        mapRef.value.setColorData(null);
        return;
    }
    filters = keepingColumns.concat([key]);
    data = new DataService.DataBuilder().keep(filters).countTimesByIndex(indexes, checked).build();
    console.log("processed data:", data)
    const colorData = DataColorMapService.map(data);
    console.log("color data:", colorData);
    mapRef.value.setColorData(colorData);
    chartRef.value.setChartData(data)
    chartRef.value.setYears(years);

}

/*
    placeString = [County]/[District]
*/
function onSelectNewPlace(placeString) {
    console.log("[NewPlace]: ", data)


    if (placeString.length === 0) {
        console.log("No selection")
        indexes = ['county'];
        data = new DataService.DataBuilder().keep(filters).countTimesByIndex(indexes, checked).build();
        return;
    }
    const place = placeString.split('/');
    if (place.length === 1) {
        console.log("County selection")
        indexes = ['county', 'district'];
        data = new DataService.DataBuilder().keep(filters).countTimesByIndex(indexes, checked).build();
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