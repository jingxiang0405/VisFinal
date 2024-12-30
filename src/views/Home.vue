<template>

    <div class="home">
        <Sidebar @update-filter="onFilterChange"/>
        <TaiwanMap  @select-new-place="onSelectNewPlace" ref="mapRef" :color-scale="colorScale"/>
        <Barchart @request-year-range="requestYearRange" ref="chartRef" :raw-data="DataService.rawData"/>
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
const years = DataService.getYearRange();

function requestYearRange(){
    chartRef.value.setYear(Number(Math.min(years)), Number(Math.max(years)));
}
function onFilterChange(checkedFilters){
    const key = Object.keys(checkedFilters)[0];
    if(key === undefined) {
        mapRef.value.setColorData(null);
        chartRef.value.setCategories([]);
        return;
    }

    let service = null;
    let para  = null;
    switch(key){
        case "casualty":
            service = DataService.countValues;
            para = checkedFilters[key];
            break;
        case "accidentType":
        case "roadType":
            service = DataService.countTimes;
            para = {[key]:checkedFilters[key]};
            break;
    }
    
    const data = service(para);
    console.log("processed data:", data)
    const colorData = DataColorMapService.map(data);
    
    mapRef.value.setColorData(colorData);
    chartRef.value.setCategories(checkedFilters);
}

/*
    placeString = [County]/[District]
*/
function onSelectNewPlace(placeString){
    if(placeString.length === 0){
        chartRef.value.setPlace("", "");
        return;
    }
    const place = placeString.split('/');
    if(place.length === 1){
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