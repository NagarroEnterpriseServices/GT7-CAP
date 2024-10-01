import { SimulatorInterfacePacket } from "./utils/parser"

type SessionMetric = {
    session_ID: string,
    packetId: number,
    lapCount: number,
    currentLapTime: number,
    measure: number,
    value: number
}

type Metrics = {
    lapCount: number,
    metersPerSecond: number,
    brake: number,
    throttle: number
}

type Laps = {
    session_ID: string,
    lap: number,
    time: number,
    maxSpeed: number,
    avgSpeed: number,
    best: boolean
}

const { SessionMetric, SessionMetrics, SimulatorInterfacePackets, Laps } = require('#cds-models/gt7')

export async function generateFioriMetrics(sessionID: string) {
    const useSampling = false
    const sampleRate: number = 30
    const sampleMS: number = 200

    // drop old session data
    await DELETE
        .from(SessionMetrics)
        .where({ session_ID: sessionID })

    await DELETE
        .from(Laps)
        .where({ session_ID: sessionID })

    // get all session simulator packages 
    const sips: [SimulatorInterfacePacket] = await SELECT
        .from(SimulatorInterfacePackets)
        .where({ session_ID: sessionID })
        .columns(["packetId", "lapCount", "metersPerSecond", "brake", "throttle", "currentLapTime", "currentLapTime2", "lapsInRace"])
        .orderBy("packetId")

    const metrics: Metrics = {
        lapCount: undefined,
        metersPerSecond: undefined,
        brake: undefined,
        throttle: undefined,
    }

    // write laps
    await writeLaps(sessionID, sips)

    // loop over session simulator packages harmonized
    let count = 1
    let lastLap = -1
    for (let sip of sips) {
        if (useSampling) {
            if (count > sampleRate || sampleRate === 0) {
                await writePacket(sessionID, sip, metrics)
                count = 1
            }
            count++
        } else {
            // harmonized time points accross measures
            if (sip.lapCount !== lastLap) {
                count = 1
                lastLap = sip.lapCount
            }
            if (sip.currentLapTime >= sampleMS * count) {
                await writePacket(sessionID, sip, metrics)
                count++
            }
        }
    }
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

    // get best lap
    const bestLapTime = Math.min(...laps.map(lap => lap.time))
    laps.forEach(lap => lap.best = lap.time === bestLapTime)

    if (sips[0].lapsInRace < laps.length) {
        laps.pop()
    }


    // insert laps
    for (let lap of laps) {
        await INSERT.into(Laps).entries(lap)
    }

}

async function writePacket(sessionID: string, sip: SimulatorInterfacePacket, metrics: Metrics) {
    const sm: SessionMetric = {
        session_ID: sessionID,
        packetId: sip.packetId,
        lapCount: sip.lapCount,
        currentLapTime: sip.currentLapTime,
        measure: 0,
        value: 0
    }

    // new lap?
    if (metrics.lapCount != sip.lapCount) {
        // reset
        metrics.lapCount = sip.lapCount
        metrics.metersPerSecond = undefined
        metrics.brake = undefined
        metrics.throttle = undefined
    }

    // metersPerSecond
    metrics.metersPerSecond = sip.metersPerSecond
    sm.measure = SessionMetric.measure.metersPerSecond
    sm.value = ~~(metrics.metersPerSecond * 3.6) // kmh
    await INSERT.into(SessionMetrics).entries(sm)

    // brake
    metrics.brake = sip.brake
    sm.measure = SessionMetric.measure.brake
    sm.value = getBytePercent(metrics.brake)
    await INSERT.into(SessionMetrics).entries(sm)

    // throttle
    metrics.throttle = sip.throttle
    sm.measure = SessionMetric.measure.throttle
    sm.value = getBytePercent(metrics.throttle)
    await INSERT.into(SessionMetrics).entries(sm)
}

function getBytePercent(value: number): number {
    return Math.round(value * 0.392)  // .392 = 1 / 255 * 100
}
