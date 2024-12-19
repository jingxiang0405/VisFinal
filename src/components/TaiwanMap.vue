<template>
    <div ref="mapContainer" style="width: 100%; height: 600px;"></div>
</template>

<script>
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { watch } from 'vue';

export default {
    name: 'TaiwanMap',
    data() {
        return {
            geoJsonUrl: 'https://raw.githubusercontent.com/Zovjsra/taiwan-map/main/COUNTY_MOI_1090820.json',
            topoJsonData: null,
            currenetTopoJsonData: null,
            countyMap: {
                "臺北市": {
                    "path": "/Taipei",
                    "textDisplay": {
                        "offsetX": -50,
                        "offsetY": -20
                    },
                    "lineDisplay": {
                        "offsetX": 0,
                        "offsetY": 3
                    }
                },
                "新北市": {
                    "path": "/NewTaipei",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 25
                    }
                },
                "桃園市": {
                    "path": "/Taoyuan",
                    "textDisplay": {
                        "offsetX": -15,
                        "offsetY": -15
                    }
                },
                "臺中市": {
                    "path": "/Taichung",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 10
                    }
                },
                "臺南市": {
                    "path": "/Tainan",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "高雄市": {
                    "path": "/Kaohsiung",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "基隆市": {
                    "path": "/Keelung",
                    "textDisplay": {
                        "offsetX": 20,
                        "offsetY": -20
                    },
                    "lineDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "新竹市": {
                    "path": "/Hsinchu",
                    "textDisplay": {
                        "offsetX": -40,
                        "offsetY": 0
                    },
                    "lineDisplay": {
                        "offsetX": 18,
                        "offsetY": -5
                    }
                },
                "新竹縣": {
                    "path": "/HsinchuCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "苗栗縣": {
                    "path": "/MiaoliCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "彰化縣": {
                    "path": "/ChanghuaCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "南投縣": {
                    "path": "/NantouCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "雲林縣": {
                    "path": "/YunlinCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "嘉義市": {
                    "path": "/Chiayi",
                    "textDisplay": {
                        "offsetX": -100,
                        "offsetY": 10
                    },
                    "lineDisplay": {
                        "offsetX": 20,
                        "offsetY": -4
                    }
                },
                "嘉義縣": {
                    "path": "/ChiayiCounty",
                    "textDisplay": {
                        "offsetX": 30,
                        "offsetY": 0
                    },

                },
                "屏東縣": {
                    "path": "/PingtungCounty",
                    "textDisplay": {
                        "offsetX": -10,
                        "offsetY": 0
                    }
                },
                "宜蘭縣": {
                    "path": "/YilanCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "花蓮縣": {
                    "path": "/HualienCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "臺東縣": {
                    "path": "/TaitungCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                },
                "澎湖縣": {
                    "path": "/PenghuCounty",
                    "textDisplay": {
                        "offsetX": -40,
                        "offsetY": 0
                    }
                },
                "金門縣": {
                    "path": "/KinmenCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": -20
                    }
                },
                "連江縣": {
                    "path": "/LienchiangCounty",
                    "textDisplay": {
                        "offsetX": 0,
                        "offsetY": 0
                    }
                }
            }
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            // fetch GeoJSON data
            try {
                const response = await fetch(this.geoJsonUrl);
                const geoJsonData = await response.json();

                this.topoJsonData = topojson.feature(geoJsonData, geoJsonData.objects.COUNTY_MOI_1090820);
                this.currenetTopoJsonData = this.topoJsonData;

            } catch (error) {
                console.error('Error fetching the GeoJSON data:', error);
            }

            console.log('topoJsonData:', this.topoJsonData);

            this.drawMap();
        },
        filterCounty(countyName) {
            this.currenetTopoJsonData = this.topoJsonData.features.filter((d) => d.properties.COUNTYNAME === countyName);
        },
        drawMap() {
            const width = 1200;
            const height = 700;

            // Set up the projection and path generator
            const projection = d3.geoMercator()
                .center([121, 23.5]) // Centered around Taiwan
                .scale(10000)
                .translate([width / 2, height / 2]);

            const path = d3.geoPath().projection(projection);

            // Create an SVG container
            const svg = d3.select(this.$refs.mapContainer)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            // Draw the map: Taiwan's counties
            svg.selectAll('path')
                .data(this.topoJsonData.features)
                .enter().append('path')
                .attr('d', path)
                .attr('fill', '#ccc')
                .attr('stroke', 'blue')
                .attr('stroke-width', 1)
                .on('mouseover', function (event) {
                    d3.select(this).attr('fill', '#ffcc00'); // Highlight on hover
                })
                .on('mouseout', function (event) {
                    d3.select(this).attr('fill', '#ccc'); // Reset color after hover
                })
                .on('click', function (event, d) {
                    console.log('Clicked on:', d.properties.COUNTYNAME);
                });

            // Add county names and lines
            const self = this; // Store reference to Vue component instance
            svg.selectAll('text')
                .data(this.topoJsonData.features)
                .enter().append('g')
                .each(function (d) {
                    const centroid = path.centroid(d);
                    const countyData = self.countyMap[d.properties.COUNTYNAME];
                    const offsetX = parseInt(countyData.textDisplay.offsetX);
                    const offsetY = parseInt(countyData.textDisplay.offsetY);
                    const displayLine = countyData.lineDisplay;


                    if (displayLine) {
                        const lineOffsetX = parseInt(displayLine.offsetX);
                        const lineOffsetY = parseInt(displayLine.offsetY);
                        d3.select(this).append('line')
                            .attr('x1', centroid[0])
                            .attr('y1', centroid[1])
                            .attr('x2', centroid[0] + offsetX + lineOffsetX)
                            .attr('y2', centroid[1] + offsetY + lineOffsetY)
                            .attr('stroke', 'black')
                            .attr('stroke-width', 1);
                    }

                    d3.select(this).append('text')
                        .attr('x', centroid[0] + offsetX)
                        .attr('y', centroid[1] + offsetY)
                        .text(d.properties.COUNTYNAME)
                        .attr('font-size', '12px')
                        .attr('fill', 'black')
                        .attr('text-anchor', 'middle');
                });
        },

        
    }
};
</script>