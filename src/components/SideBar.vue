<template>
    <div class="sidebar">
        <li v-for="(filter, filterKey) in filters" :key="filterKey">
            <h3>{{ filterKey }}</h3>
            <ul>
                <!-- Inner v-for for products inside each category -->
                <li v-for="(category, categoryKey) in filter" :key="categoryKey">
                    {{ categoryKey }}
                </li>
            </ul>
        </li>
    </div>
</template>

<script>
export default {
    data() {
        return {
            filters: {
                casualty: {injury: "Injury", death: "Death"},
                accidentType: {a1: "A1",a2: "A2"},
                roadType: { crossroad: "Crossroad", oneWay: "OneWay"},
            }
        }
        // speedLimits =[40, 50, 60, 70, 80, 90]
    }

}



</script>

<style scoped>
.sidebar {
    width: 250px;
    padding: 20px;
    background-color: #f4f4f4;
    border-right: 2px solid #ddd;
}

.filter-section {
    margin-bottom: 20px;
}

.filter-section h3 {
    margin-bottom: 10px;
}

.filter-section label {
    display: block;
    margin: 5px 0;
}
</style>