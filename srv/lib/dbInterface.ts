import cds from "@sap/cds"
import { Client } from 'pg';
import { SimulatorInterfacePacket } from "./utils/parser"


const { Sessions, SimulatorInterfacePackets, Cars, Laps } = require('#cds-models/gt7')
let cars: Array<string> = [] // car name cache
type Laps = {
    session_ID: string,
    lap: number,
    time: number,
    maxSpeed: number,
    avgSpeed: number,
    best: boolean
}


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
}

export async function updateSession(sessionId: string, driver: string, finished: boolean, sip: any) {
    const bestLap = await getBestLap(sessionId, sip.bestLapTime)
    await UPDATE(Sessions, sessionId).with({
        finished: finished,
        lapsInRace: sip.lapsInRace,
        bestLap: bestLap,
        bestLapTime: sip.bestLapTime,
        raceTime: sip.raceTime,
        calculatedMaxSpeed: sip.calculatedMaxSpeed
    })
    await generateFioriMetrics(sessionId)

    if (finished == false) {
        await deleteUnfinishedSessions(sessionId)
        return;
    }

    if (cds.env.profiles.includes('sac')) {
        if (driver === null || driver === "" || driver === undefined) return;
        
        const api = await cds.connect.to("sac_service");

        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: 'postgres',
            port: 5432,
        });

        await client.connect();
        const result = await client.query(`SELECT * FROM F_GT7PS5Agreg_V2('${sessionId}')`);
        // in the api, insert all data gotten from the sql function
        for (let row of result.rows) {
            // insert via sql query
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

            const res = await api.post('ZC_SESSIONSV4', data)
        }

        await client.end();
    }
    
}

export async function deleteUnfinishedSessions(id: string) {
    const unfinishedSession = await SELECT.from(Sessions).where({ finished: false, ID: id });

    if (unfinishedSession) {
        await DELETE.from(Sessions).where({ finished: false, ID: id });
        await DELETE.from(SimulatorInterfacePackets).where({ session_ID: id });
    }
}

export async function deleteSessions(id: string) {
    const session = await SELECT.from(Sessions).where({ ID: id });

    if (session) {
        await DELETE.from(Sessions).where({ ID: id });
        await DELETE.from(SimulatorInterfacePackets).where({ session_ID: id });
    }
}

export async function generateFioriMetrics(sessionID: string) {
    // delete old data
    await DELETE
        .from(Laps)
        .where({ session_ID: sessionID })

    // get all session simulator packages 
    const sips: [SimulatorInterfacePacket] = await SELECT
        .from(SimulatorInterfacePackets)
        .where({ session_ID: sessionID })
        .columns(["packetId", "lapCount", "metersPerSecond", "brake", "throttle", "currentLapTime", "lapsInRace"])
        .orderBy("packetId")

    // write laps
    await writeLaps(sessionID, sips)
}

async function writeLaps(sessionID: string, sips: [SimulatorInterfacePacket]) {
    // insert each lap into Laps
    let laps: Laps[] = []
    let speeds: number[] = []

    for (let sip of sips) {
        if (sip.lapCount != laps.length) {
            if (laps.length > 0) {
                laps[laps.length - 1].avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length
            }
            laps.push({
                session_ID: sessionID,
                lap: sip.lapCount,
                time: sip.currentLapTime,
                maxSpeed: sip.metersPerSecond * 3.6,
                avgSpeed: 0,
                best: false
            })
            speeds = [sip.metersPerSecond * 3.6]
        } else {
            laps[laps.length - 1].time = sip.currentLapTime
            laps[laps.length - 1].maxSpeed = Math.max(laps[laps.length - 1].maxSpeed, sip.metersPerSecond  * 3.6)
            speeds.push(sip.metersPerSecond * 3.6)
        }
    }

    if (laps.length > 0 && speeds.length > 0) {
        laps[laps.length - 1].avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    }

    // get best lap
    const bestLapTime = Math.min(...laps.map(lap => lap.time))
    laps.forEach(lap => lap.best = lap.time === bestLapTime)

    if (sips?.length > 0 && sips[0].lapsInRace < laps.length) {
        laps.pop()
    }


    // insert laps
    for (let lap of laps) {
        try{await INSERT.into(Laps).entries(lap)}
        catch(e){console.log('FioriExported::writeLaps ' + e)}
    }
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



var hana = require('@sap/hana-client');
var conn = hana.createConnection();
var conn_params = {
  serverNode  : '8cf6e46c-2deb-4ded-8a35-dfe14b654268.hana.prod-eu10.hanacloud.ondemand.com:443',
  uid: "C_M_PS5GT7#TECH_USER",
  password: "", //put the password here
  type: "procedure",
  procedure_schema: "C_M_PS5GT7$TEC",
  procedure: "HDI_GRANTOR_FOR_CUPS"
};

async function InsertIntoDatasphere(sip: any) { 
  conn.connect(conn_params, async function(err: any) {
      if (err) throw err;
            const insertQuery = `
            INSERT INTO TLT_PS5GT7_RAWDATA (
                SOURCE, SESSION_ID, SESSION_DATETIME, PACKETID, DRIVER,
                CARID, ENGINERPM, METERSPERSECOND, LAPCOUNT, LAPSINRACE,
                CURRENTLAPTIME2, LASTLAPTIME, TIMEOFDAYPROGRESSION,THROTTLE,
                BRAKE,CLUTCHPEDAL,CURRENTGEAR,FLAGS,PRERACESTARTPOSITIONORQUALIPOS,
                ROWDATE
            ) VALUES (
                'temporary',
                `+sip.session_ID+`,
                CURRENT_TIMESTAMP,
                `+sip.packetId+`,
                undefined,
                `+sip.car_ID+`,
                `+sip.engineRPM+`,
                `+sip.metersPerSecond+`,
                `+sip.lapCount+`,
                `+sip.lapsInRace+`,
                `+sip.currentLapTime2+`,
                `+sip.lastLapTime+`,
                `+sip.timeOfDayProgression+`,
                `+sip.throttle+`,
                `+sip.brake+`,
                `+sip.clutchPedal+`,
                `+sip.currentGear+`,
                `+sip.flags+`,
                `+sip.preRaceStartPositionOrQualiPos+`,
                CURRENT_TIMESTAMP
            )
        `;
              await conn.exec(insertQuery, function (err: any, result: any) {
                  if (err) throw err;
                  console.log('Insert successful:', result);
              });
        conn.disconnect();
        });
};

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
    await InsertIntoDatasphere(sipEntity);
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

    const colors: number[][] = []
    let counter = sampleRate
    const min = Math.min(...frames)
    const max = Math.max(...frames)
    for (let frame of frames) {
        if (counter++ >= sampleRate) {
            const value = (frame - min) / (max - min)
            const color = [0, 0, 0]
            if (value < 0.5) {
                color[1] = 255;
                color[0] = 255 * (value * 2); // scale to 0..1 then 0..255
            } else {
                color[0] = 255;
                color[1] = 255 * (2 - value * 2); // fade green down to 0
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