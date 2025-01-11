import * as d3 from 'd3';

const interpolate = d3.interpolateRgb("#fff7ec", "#7f0000");

function mergeData(data) {
    const result = {};
    Object.entries(data).forEach(([key, value])=>{
        value.forEach((datum)=>{
            const county = datum.county;
            const district = datum.district;
            const count = datum.count;
            if(!result[county])result[county] = {} 
            result[county][district] = (result[county][district] || 0) + count;
        })

    })

    Object.entries(result).forEach(([key, value])=>{
        let sum = 0;
        Object.values(value).forEach((v)=>{
            sum += v;
        })
        value.sum = sum;
    })
    return result;
}


function getMaxValues(data) {
    let maxSumValue = 0;
    let maxBasicValue = 0;

    // Iterate over the data to find the max values
    Object.keys(data).forEach(city => {
        Object.keys(data[city]).forEach(key => {
            if (key === "sum") {
                maxSumValue = Math.max(maxSumValue, data[city][key]);
            } else {
                maxBasicValue = Math.max(maxBasicValue, data[city][key]);
            }
        }
        )


    });

    return {
        maxSumValue, maxBasicValue

    };
}


function map(data) {
    const ndata = mergeData(data);
    const { maxSumValue, maxBasicValue } = getMaxValues(ndata);

    const scaleSum = d3.scaleSequential(interpolate)
        .domain([0, maxSumValue]);

    const scaleBasic = d3.scaleSequential(interpolate)
        .domain([0, maxBasicValue])

    const result = {};

    Object.keys(ndata).forEach(city => {
        result[city] = {};

        Object.keys(ndata[city]).forEach(region => {
            if (region === "sum") {
                // Map sum value
                result[city]["sum"] = scaleSum(ndata[city]["sum"]);
            } else {
                // Map basic value
                result[city][region] = scaleBasic(ndata[city][region]);
            }
        });
    });

    return result;
}

export default {
    map: map
}