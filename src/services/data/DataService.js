import * as d3 from "d3";
const url = new URL('@/assets/data/data.csv', import.meta.url).href;
const trafficData = await d3.csv(url).then((data) => {

    const result = {
        death: [],
        injury: [],
        speedLimit: [],
        location: [],
        accidentType: [],
        roadType: []
    };

    data.forEach(row => {
        // Extract and transform relevant data
        const injuryData = row["死亡受傷人數"].match(/死亡(\d+);受傷(\d+)/);
        const death = parseInt(injuryData[1], 10);
        const injury = parseInt(injuryData[2], 10);
        const speedLimit = parseInt(row["速限-第1當事者"], 10);
        const longitude = parseFloat(row["經度"]);
        const latitude = parseFloat(row["緯度"]);

        // Extract county and district
        const county = row["發生地點"].substring(0, 3);  // Extract county (first 3 characters)
        const district = row["發生地點"].substring(3);  // Extract district (rest of the string)

        // Extract additional fields
        const accidentType = row["事故類別名稱"];
        const roadType = row["道路型態大類別名稱"];

        // Push data into the result object
        result.death.push({
            date: row["發生日期"],
            county: county,
            district: district,
            value: death
        });

        result.injury.push({
            date: row["發生日期"],
            county: county,
            district: district,
            value: injury
        });

        result.speedLimit.push({
            date: row["發生日期"],
            county: county,
            district: district,
            value: speedLimit
        });

        result.location.push({
            date: row["發生日期"],
            county: county,
            district: district,
            coordinates: { longitude, latitude }
        });

        result.accidentType.push({
            date: row["發生日期"],
            county: county,
            district: district,
            value: accidentType
        });

        result.roadType.push({
            date: row["發生日期"],
            county: county,
            district: district,
            value: roadType
        });
    });

    return result;
})


export default trafficData;