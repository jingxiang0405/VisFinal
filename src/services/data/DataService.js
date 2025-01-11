import * as d3 from "d3";
import structuredClone from '@ungap/structured-clone';
const url = new URL('@/assets/data/data.csv', import.meta.url).href;
function categorizeData() {

    const result = {
        death: [],
        injury: [],
        speedLimit: [],
        location: [],
        accidentType: [],
        roadType: []
    };

    rawData.forEach(row => {
        // Extract and transform relevant rawData
        const death = row.death;
        const injury = row.injury;
        const longitude = row.longitude;
        const latitude = row.latitude;

        // Push rawData into the result object
        result.death.push({
            year: row.year,
            month: row.month,
            day: row.day,
            county: row.county,
            district: row.district,
            value: death
        });

        result.injury.push({
            year: row.year,
            month: row.month,
            day: row.day,
            county: row.county,
            district: row.district,
            value: injury
        });

        result.speedLimit.push({
            year: row.year,
            month: row.month,
            day: row.day,
            county: row.county,
            district: row.district,
            value: row.speedLimit
        });

        result.location.push({
            year: row.year,
            month: row.month,
            day: row.day,
            county: row.county,
            district: row.district,
            coordinates: { longitude, latitude }
        });

        result.accidentType.push({
            year: row.year,
            month: row.month,
            day: row.day,
            county: row.county,
            district: row.district,
            value: row.accidentType
        });

        result.roadType.push({
            year: row.year,
            month: row.month,
            day: row.day,
            county: row.county,
            district: row.district,
            value: row.roadType
        });
    });

    return result;
}



const rawData = await d3.csv(url).then((data) => {
    {
        data.forEach((d) => {
            const year = d["發生日期"].substring(0, 4);
            const month = d["發生日期"].substring(4, 6);
            const day = d["發生日期"].substring(6);
            const county = d["發生地點"].substring(0, 3);
            const district = d["發生地點"].substring(3);

            const injuryData = d["死亡受傷人數"].match(/死亡(\d+);受傷(\d+)/);
            const death = parseInt(injuryData[1], 10);
            const injury = parseInt(injuryData[2], 10);

            const accidentType = d['事故類別名稱']

            const longitude = parseFloat(d['經度']);
            const latitude = parseFloat(d['緯度']);
            const speedLimit = parseInt(d["速限-第1當事者"], 10);
            const roadType = d['道路型態大類別名稱'];
            const roadClass = d['道路類別-第1當事者-名稱'];

            d.year = year;
            d.month = month;
            d.day = day;
            d.county = county;
            d.district = district;
            d.death = death;
            d.injury = injury;
            d.accidentType = accidentType
            d.longitude = longitude;
            d.latitude = latitude;
            d.speedLimit = speedLimit;
            d.roadType = roadType;
            d.roadClass = roadClass;

            delete d["發生日期"];
            delete d["發生地點"];
            delete d["死亡受傷人數"];
            delete d['事故類別名稱'];
            delete d['經度'];
            delete d['緯度'];
            delete d['速限-第1當事者'];
            delete d['道路型態大類別名稱'];
            delete d['道路類別-第1當事者-名稱'];
        })
        return data
    }
});

class DataBuilder {
    constructor() {
        this.records = rawData; // from the fetched data globally.
        this.wrapped = false;

    }

    keep(keys) {
        if (this.wrapped) throw "Keep Operation after wrapping operation."
        if (!Array.isArray(keys)) {
            keys = [keys];

        }

        this.records = this.records.map(record => {

            return Object.keys(record).reduce((filteredObj, key) => {
                if (keys.includes(key)) {
                    filteredObj[key] = record[key];
                }
                return filteredObj;
            }, {});
        });

        return this;
    }

    // specified key has unique value
    unique(key) {
        if (this.wrapped) throw "Unique Operation after wrapping operation."

        const seen = new Set();
        this.records = this.records.filter(record => {
            const compareValue = key !== undefined
                ? record[key]
                : JSON.stringify(record);

            if (seen.has(compareValue)) {
                return false;
            }
            seen.add(compareValue);
            return true;
        });

        return this;
    }

    filter(fn) {
        this.records = this.records.filter(fn)
        return this;
    }

    //  *** Wrapping Operation ***
    sumByIndex(indexes, toSum) {
        if (!Array.isArray(indexes)) {
            indexes = [indexes]; // Ensure indexes is an array
        }

        if (!Array.isArray(toSum)) {
            toSum = [toSum]; // Ensure toSum is an array
        }

        const grouped = this.records.reduce((acc, record) => {
            const groupKey = indexes.map(index => record[index]).join('+'); // Composite key for indexes
            const outerKey = toSum.join('+'); // Create an outer key by joining toSum columns

            // Initialize outer group if it doesn't exist
            if (!acc[outerKey]) {
                acc[outerKey] = {};
            }

            // Initialize inner group if it doesn't exist
            if (!acc[outerKey][groupKey]) {
                acc[outerKey][groupKey] = {
                    ...indexes.reduce((obj, index) => {
                        obj[index] = record[index];
                        return obj;
                    }, {}),
                    count: 0, // Initialize value (combined sum) field
                };
            }

            // Sum the values for each toSum key
            let combinedSum = 0;
            toSum.forEach(sumKey => {
                if (typeof record[sumKey] !== 'number') {
                    throw new Error(`toSum column "${sumKey}" must contain numeric values.`);
                }
                combinedSum += record[sumKey];
            });

            // Add combined sum to the "value" field
            acc[outerKey][groupKey].count += combinedSum;

            return acc;
        }, {});

        // Convert grouped object into the desired format
        this.records = Object.entries(grouped).reduce((finalResult, [outerKey, groupData]) => {
            finalResult[outerKey] = Object.values(groupData); // Convert inner groups to an array
            return finalResult;
        }, {});

        this.wrapped = true;
        return this;
    }

    //  *** Wrapping Operation ***
    countTimesByIndex(indexes, target) {
        if (!Array.isArray(indexes)) {
            indexes = [indexes];
        }
        
        let targetKey = Object.keys(target)[0];
        let targetValues = Object.values(target)[0];
        const grouped = {};

        if (!Array.isArray(targetValues)) {
            targetValues = [targetValues];
        }

        targetValues.forEach((v) => {
            grouped[v] = {}
        })
        this.records.forEach(record => {
            const groupKey = indexes.map(index => record[index]).join('+');


            const targetValue = record[targetKey];
            if (!grouped[targetValue]) {
                return;
            }

            if (!grouped[targetValue][groupKey]) {
                grouped[targetValue][groupKey] = {
                    ...indexes.reduce((obj, index) => {
                        obj[index] = record[index];
                        return obj;
                    }, {}), count: 0
                };
            }

            grouped[targetValue][groupKey].count += 1;

        });

        console.log("grouped", grouped)
        // Convert the grouped data into an array format
        const result = {};
        Object.entries(grouped).forEach(([target, targetGroups]) => {
            result[target] = Object.values(targetGroups); // Convert each group to an array
        });

        this.records = result; // Store the result back in the records
        this.wrapped = true; // Mark as wrapped
        return this;
    }






    //  *** Wrapping Operation ***
    //  county:Taipei, district:A  val:1       
    //  county:Taipei, district:B  val:2   =>   Taipei : [{district: A, val: 1}, {district: B, val: 2}]
    //  county:Tainan, district:C  val:3        Tainan : [{district: C, val: 3}]        
    groupBy(index) {
        const grouped = this.records.reduce((acc, record) => {
            const key = record[index];
            if (!acc[key]) {
                acc[key] = [];
            }
            const { [index]: _, ...rest } = record; // Remove the 'index'
            acc[key].push(rest);
            return acc;
        }, {});

        this.records = grouped;
        this.wrapped = true;
        return this;
    }

    //  *** Ultimate Operation ***
    build() {
        return this.records;
    }
}

console.log("rawdData:", rawData)
console.log(new DataBuilder().keep(['county', 'district', 'accidentType']).countTimesByIndex(['county', 'district'], { accidentType: ['A2', 'A1'] }).build())


export default {

    DataBuilder: DataBuilder
}