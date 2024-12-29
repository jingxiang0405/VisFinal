<template>

    <div class="home">
        <Sidebar @update-filter="onFilterChange"/>
        <TaiwanMap :traffic-data="trafficData" ref="mapRef" :color-scale="colorScale"/>
    </div>

</template>

<script setup>
import TaiwanMap from '@/components/TaiwanMap.vue';
import Sidebar from '@/components/SideBar.vue';
import DataService from '@/services/data/DataService';
import DataColorMapService from '@/services/data/DataColorMapService';
import { ref } from 'vue';

const mapRef = ref(null);

function onFilterChange(checkedFilters){
    const key = Object.keys(checkedFilters)[0];
    if(key === undefined) {
        mapRef.value.setColorData(null);
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

}

</script>

<style scoped>
.home {
    display: flex;
    width: 100vw;
    height: 100vh;
}
</style>