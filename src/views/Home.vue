<template>

    <div class="home">
        <TaiwanMap />
        <BarChart />
    </div>

</template>

<script setup>
import BarChart from '@/components/BarChart.vue';
import TaiwanMap from '@/components/TaiwanMap.vue';

</script>

<style scoped>
.home {
    display: flex;
    width: 100vw;
    height: 100vh;
}
</style>