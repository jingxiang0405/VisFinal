<template>
    <div class="sidebar">

        <div v-for="(filter, filterKey) in filters" :key="filterKey" class="filter">
            <div style="font-size: 40px;">{{ filterKey }}</div>
            <ul class="categories">

                <div v-for="(category, categoryKey) in filter" :key="categoryKey" class="category">
                    <span style="font-size: 24px; vertical-align: center;">{{ category }} </span>

                    <label class="switch">
                        <div>
                            <input :disabled="this.disabled[filterKey]" type="checkbox" :id="categoryKey"
                                :value="categoryKey"
                                @change="emitCheckedFilters(filterKey, categoryKey, $event.target.checked)">
                            <span class="slider"></span>
                        </div>


                    </label>
                </div>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            filters: {
                casualty: { injury: "受傷", death: "死亡" },

                // casualty: { injury: "Injury", death: "Death" },
                accidentType: { A1: "A1", A2: "A2" },
                roadType: { 交岔路: "交岔路", 單路部分: "單路部分", 圓環廣場: "圓環廣場" },
                speedLimit: []
            },
            checkedFilters: [],
            disabled: {}
        };
    },
    mounted() {
        Object.keys(this.filters).forEach(k => {
            this.disabled[k] = false;
        });
    },
    methods: {

        emitCheckedFilters(filterKey, categoryKey, isChecked) {
            if (this.disabled[filterKey]) {
                document.getElementById(categoryKey).checked = false;
                return;
            }
            Object.keys(this.disabled).forEach((k) => {
                this.disabled[k] = !(k == filterKey);
            })

            // Emit the current state of checked filters to the parent
            if (!this.checkedFilters[filterKey]) {
                this.checkedFilters[filterKey] = [];
            }
            if (isChecked) {

                this.checkedFilters[filterKey].push(categoryKey);

            } else {
                const index = this.checkedFilters[filterKey].indexOf(categoryKey);
                if (index > -1) {
                    this.checkedFilters[filterKey].splice(index, 1);
                }

                if (this.checkedFilters[filterKey].length == 0) {
                    this.checkedFilters = [];
                    Object.keys(this.filters).forEach(k => {
                        this.disabled[k] = false;
                    });
                }
            }
            this.$emit("update-filter", this.checkedFilters);
        },
    },
};
</script>

<style scoped>
.switch {
    position: relative;
    display: inline-block;
    align-items: center;
    width: 60px;
    height: 34px;
}

/* Hide default HTML checkbox */
.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

/* The slider */
.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
}

.slider:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
}

input:checked+.slider {
    background-color: #2196F3;
}

input:focus+.slider {
    box-shadow: 0 0 1px #2196F3;
}

input:checked+.slider:before {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
}

.slider {
    border-radius: 34px;
}

.slider:before {
    border-radius: 50%;
}

.sidebar {
    width: 250px;
    padding: 20px;
    background-color: #f4f4f4;
    border-right: 2px solid #ddd;
}

.filter {
    margin-top: 2vh;
    border-width: 1em;
}

.categories {
    padding-top: 1vh;
}

.category {
    display: flex;
    margin-top: 0.5vh;
}
</style>