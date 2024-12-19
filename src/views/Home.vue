<template>

    <div class="home">
        <h1>Home</h1>
        <TaiwanMap />
    </div>

</template>

<script>
    import TaiwanMap from '@/components/TaiwanMap.vue';
    export default {
        name: 'Home',
        components: {
            TaiwanMap,
        },
    };
</script>