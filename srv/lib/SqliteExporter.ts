import { generateFioriMetrics } from "./FioriExporter"
import LapCounter from "./utils/lapcounter"
import cds from "@sap/cds"
import { Client } from 'pg';

const { Sessions, SimulatorInterfacePackets, Cars } = require('#cds-models/gt7')
let cars: Array<string> = [] // car name cache

export async function logSession(sessionId: string, sip: any, driver: string) {

    let payload = {
        ID: sessionId,
        createdAt: new Date(),
        lapsInRace: sip.lapsInRace,
        car_ID: sip.carCode,
        timeOfDay: sip.timeOfDayProgression,
        bodyHeight: sip.bodyHeight,
        driver: driver
    }
    
    await INSERT.into(Sessions).entries(payload)
    
    // new request for create session in another table
    // const data =  {
    //     Id: sessionId,
    //     Createdat: new Date().toISOString(),
    //     Lapsinrace: sip.lapsInRace,
    //     CarId: sip.carCode,
    //     Timeofday: sip.timeOfDayProgression,
    //     Bodyheight:  parseFloat(sip.bodyHeight.toPrecision(10)),
    //     Driver: driver == null ? "" : driver
    // }

    // console.log("logSession:data")
    // console.log(data)

    // const api = await cds.connect.to("customrap");
 
    // try {
    //     const result = await api.post('ZC_SESSIONS', data)
    //     console.log("logSession:result")
    //     console.log(result)
    // }
    // catch (error) {
    //     console.error("logSession:error")
    //     console.error(error)
    // }

}

export async function updateSession(sessionId: string, driver: string, finished: boolean, sip: any) {
    const bestLap = await getBestLap(sessionId, sip.bestLapTime)
    await UPDATE(Sessions, sessionId).with({
        finished: finished,
        lapsInRace: sip.lapsInRace,
        bestLap: bestLap,
        bestLapTime: sip.bestLapTime,
        calculatedMaxSpeed: sip.calculatedMaxSpeed
    })
    generateFioriMetrics(sessionId)

    // new request for update session in another table
    // const api = await cds.connect.to("customrap");

    // const data =  {
    //     Id: sessionId,
    //     Createdat: new Date().toISOString(),
    //     Lapsinrace: sip.lapsInRace,
    //     CarId: sip.carCode,
    //     Timeofday: sip.timeOfDayProgression,
    //     Bodyheight:  parseFloat(sip.bodyHeight.toPrecision(10)),
    //     Finished: finished,
    //     Bestlap: bestLap,
    //     Bestlaptime: sip.bestLapTime,
    //     Calculatedmaxspeed: sip.calculatedMaxSpeed,
    //     Driver: driver == null ? "" : driver
    // }

    // api.run(INSERT.into(Sessions).entries(data))

    const api = await cds.connect.to("sac_service");

    const client = new Client({
        user: 'postgres',          // Replace with your PostgreSQL username
        host: 'localhost',              // Replace with your PostgreSQL host
        database: 'postgres', // Replace with your database name
        password: 'postgres',      // Replace with your password
        port: 5432,                     // Default PostgreSQL port
      });

    await client.connect();
    const result = await client.query(`SELECT * FROM F_GT7PS5Agreg_V2('${sessionId}')`);
    // console.log(result.rows);

    let entries = []
    let rows = []

    
    // in the api, insert all data gotten from the sql function
    for (let row of result.rows) {
        // insert via sql query
        console.log("row")
        // console.log(row)
        const data =  {
            Sessionid: row.session_id,
            Racesecond: row.racesecond,
            Speedinkmh: parseFloat(row.speed_kmh.toPrecision(3)),
            Gear: row.gear,
            Sessiontimestamp: row.sessiontimestamp,
            Sessiondate: row.sessiondate,
            Sessiontime: row.sessiontime,
            Lapcount: row.lapcount,
            Car: row.car,
            Distanceinkmh: parseFloat(row.distance_km.toPrecision(3)),
            Laptimeinms: row.lapprecisetime_ms,
            Raceposition: row.raceposition,
            Throttlepressureinpercent: parseFloat(row.throttlepercent),
            Breakpressureinpercent: parseFloat(row.brakepercent),
            Clutchdisengageinpercent: parseFloat(row.clutchdisengagepercent),
            Offtrackinpercent: parseFloat(row.offtrackpercent),
            Handbreakinpercent: parseFloat(row.handbrakepercent),
            Asminpercent: parseFloat(row.asmpercent),
            Tcsinpercent: parseFloat(row.tcspercent),
            Racetimeinms: row.raceprecisetime_ms,
            Drivername: driver ?? "",
        }
        // console.log("data")
        // console.log(data)

        // entries.push(data)

        // rows.push([
        //     data.Sessionid,
        //     data.Racesecond,
        //     data.Speedinkmh,
        //     data.Gear,
        //     data.Sessiondate,
        //     data.Distanceinkmh,
        //     data.Laptimeinms,
        //     data.Raceposition,
        //     data.Throttlepressureinpercent,
        //     data.Breakpressureinpercent,
        //     data.Clutchdisengageinpercent,
        //     data.Offtrackinpercent,
        //     data.Handbreakinpercent,
        //     data.Asminpercent,
        //     data.Tcsinpercent,
        //     data.Racetimeinms,
        //     data.Drivername
        // ])
        const res = await api.post('ZC_SESSIONSV4', data)

        // const res = await api.run(INSERT.into('ZC_SESSIONSV3').entries(
        //     data
        // ))
        
    }
    // console.log("data")
    // console.log(rows)

    // const res = await api.run(INSERT.into('ZC_SESSIONSV3').columns(
    //     'Sessionid',
    //     'Racesecond',
    //     'Speedinkmh',
    //     'Gear',
    //     'Sessiondate',
    //     'Distanceinkmh',
    //     'Laptimeinms',
    //     'Raceposition',
    //     'Throttlepressureinpercent',
    //     'Breakpressureinpercent',
    //     'Clutchdisengageinpercent',
    //     'Offtrackinpercent',
    //     'Handbreakinpercent',
    //     'Asminpercent',
    //     'Tcsinpercent',
    //     'Racetimeinms',
    //     'Drivername'
    // ).rows(rows))

    // const res = api.run(INSERT.into('ZC_SESSIONSV3').entries(
    //     entries
    // ))

    await client.end();
}

export async function getBestLap(sessionId: string, bestLapTime: number) {
    const result = await SELECT
        .one
        .from(SimulatorInterfacePackets)
        .where({
            session_ID: sessionId,
            lastLapTime: bestLapTime
        })
        .columns(["lapCount"])
        .orderBy("packetId desc")
    return (result?.lapCount) ? result.lapCount - 1 : null
}

export async function logSimulatorInterfacePacket(sessionId: string, sip: any) {
    const sipEntity = sip
    const map = typeof (sipEntity.session_ID) === 'undefined'
    
    sipEntity.session_ID = sessionId
    
    if (map) {
        sipEntity.car_ID = sipEntity.carCode
        // position
        sipEntity.position_x = sipEntity.position.x
        sipEntity.position_y = sipEntity.position.y
        sipEntity.position_z = sipEntity.position.z
        // velocity
        sipEntity.velocity_x = sipEntity.velocity.x
        sipEntity.velocity_y = sipEntity.velocity.y
        sipEntity.velocity_z = sipEntity.velocity.z
        // rotation
        sipEntity.rotation_pitch = sipEntity.rotation.pitch
        sipEntity.rotation_yaw = sipEntity.rotation.yaw
        sipEntity.rotation_roll = sipEntity.rotation.roll
        // angularVelocity
        sipEntity.angularVelocity_x = sipEntity.angularVelocity.x
        sipEntity.angularVelocity_y = sipEntity.angularVelocity.y
        sipEntity.angularVelocity_z = sipEntity.angularVelocity.z
        // tireSurfaceTemperature
        sipEntity.tireSurfaceTemperature_fl = sipEntity.tireSurfaceTemperature.FrontLeft
        sipEntity.tireSurfaceTemperature_fr = sipEntity.tireSurfaceTemperature.FrontRight
        sipEntity.tireSurfaceTemperature_rl = sipEntity.tireSurfaceTemperature.RearLeft
        sipEntity.tireSurfaceTemperature_rr = sipEntity.tireSurfaceTemperature.RearRight
        // tireSuspensionHeight
        sipEntity.tireSuspensionHeight_fl = sipEntity.tireSusHeight.FrontLeft
        sipEntity.tireSuspensionHeight_fr = sipEntity.tireSusHeight.FrontRight
        sipEntity.tireSuspensionHeight_rl = sipEntity.tireSusHeight.RearLeft
        sipEntity.tireSuspensionHeight_rr = sipEntity.tireSusHeight.RearRight
        // wheelRevPerSecond
        sipEntity.wheelRevPerSecond_fl = sipEntity.wheelRevPerSecond.FrontLeft
        sipEntity.wheelRevPerSecond_fr = sipEntity.wheelRevPerSecond.FrontRight
        sipEntity.wheelRevPerSecond_rl = sipEntity.wheelRevPerSecond.RearLeft
        sipEntity.wheelRevPerSecond_rr = sipEntity.wheelRevPerSecond.RearRight
    }
    
    await INSERT.into(SimulatorInterfacePackets).entries(sipEntity)
}

export async function getCarName(carCode: number) {
    if (cars[carCode]) {
        return cars[carCode]
    } else {
        const result = await SELECT.one.from(Cars).where({ ID: carCode }).columns(["name"])
        return cars[carCode] = (result?.name) ? result.name : "unknown"
    }
}

export async function getColorFromData(sessionID: string, sampleRate: number, lapCount: number, dataType: string) {
    if (dataType == null)
        return null

    let raceData: string[] = []
    switch (dataType) {
        case "velocity":
            raceData = ["velocity_x", "velocity_y", "velocity_z"]
            break
        case "angularVelocity":
            raceData = ["angularVelocity_x", "angularVelocity_y", "angularVelocity_z"]
            break
        case "tireSurfaceTemperature":
            raceData = ["tireSurfaceTemperature_fl", "tireSurfaceTemperature_fr", "tireSurfaceTemperature_rl", "tireSurfaceTemperature_rr"]
            break
        case "engineRPM":
            raceData = ["engineRPM"]
            break
        case "gasLevel":
            raceData = ["gasLevel"]
            break
        case "metersPerSecond":
            raceData = ["metersPerSecond"]
            break
        case "distance":
            raceData = ["distance"]
            break
        case "turboBoost":
            raceData = ["turboBoost"]
            break
        case "oilPressure":
            raceData = ["oilPressure"]
            break
        case "oilTemperature":
            raceData = ["oilTemperature"]
            break
        case "waterTemperature":
            raceData = ["waterTemperature"]
            break
        case "currentGear":
            raceData = ["currentGear"]
            break
        case "suggestedGear":
            raceData = ["suggestedGear"]
            break
        case "throttle":
            raceData = ["throttle"]
            break
        case "brake":
            raceData = ["brake"]
            break
    }

    const sips = await SELECT
        .from(SimulatorInterfacePackets)
        .where({
            session_ID: sessionID,
            lapCount: lapCount
        })
        .columns(raceData)
        .orderBy("packetId")


    let frames = []
    for (let sip of sips) {
        let frame = 0
        for (let data of raceData) {
            frame += sip[data]
        }
        frames.push(frame)
    }

    // generate for each frames a color (rgb) with green for low values and red for high values and white for middle values
    const colors: [number[]] = [[]]
    let counter = sampleRate
    const min = Math.min(...frames)
    const max = Math.max(...frames)
    for (let frame of frames) {
        if (counter++ >= sampleRate) {
            //map value to 0 - 255
            const value = (frame - min) / (max - min)
            const color = [0, 0, 0]

            if (value < min + (max - min) / 2) {
                color[1] = 255
                color[0] = 255 * value
            } else {
                color[0] = 255
                color[1] = 255 - 255 * value
            }
            colors.push(color)
            counter = 0
        }
    }
    return colors
}


export async function getTrackCoordinates(sessionID: string, sampleRate: number, lapCount: number) {
    const sips = await SELECT
        .from(SimulatorInterfacePackets)
        .where({
            session_ID: sessionID,
            lapCount: lapCount
        })
        .columns(["position_x", "position_z"])
        .orderBy("packetId")

    const coordinates: [number[]] = [[]]
    let counter = sampleRate
    for (let sip of sips) {
        if (counter++ >= sampleRate) {
            coordinates.push([sip.position_x, sip.position_z])
            counter = 0
        }
    }
    // how to defined an empty stacked array?!? hack to remove initiallly empty first entry
    coordinates.shift()

    return coordinates
}