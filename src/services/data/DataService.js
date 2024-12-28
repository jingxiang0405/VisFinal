import { csv } from "d3";

const trafficData = await csv("@/assets/data/data.csv")
.then((data) => {
        console.log(data[0])
        return data
    })
    .catch(e => { console.error(e) });

export default trafficData;