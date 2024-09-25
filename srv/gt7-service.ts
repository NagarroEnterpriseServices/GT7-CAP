import * as cds from '@sap/cds'
import { ApplicationService, log } from '@sap/cds'
import { generateFioriMetrics } from './lib/FioriExporter'
import { getTrackCoordinates, getColorFromData } from './lib/SqliteExporter'

const LOG = log('gt7-service')
const { Laps, Session, SimulatorInterfacePackets } = require('#cds-models/GT7Service')
//const { Readable } = require("stream")
module.exports = class GT7Service extends ApplicationService {
    async init() {
        // bound actions

        this.on("generateFioriMetrics", Session, async (req) => {
            const sessionID = req.params[0] as string

            await generateFioriMetrics(sessionID)
        })

        /* replaced by auto simulation
        this.on("playSimulation", Session, async (req) => {
            const sessionID = req.params[0] as string
            const otSrv = await cds.connect.to('OpenTelemetryService')
            otSrv.emit("playSimulation", { sessionID: sessionID })
        })
        */

        // bound functions

        this.on("getLapTimes", Session, async (req) => {
            const sessionID = req.params[0] as string
            return await getLapTimes(sessionID)
        })

        this.on("getCompareLaps", Session, async (req) => {
            const sessionID = req.params[0] as string
            return await getCompareLaps(sessionID)
        })

        // http://localhost:4004/odata/v4/gt7/Sessions(52983d4d-bea3-4d5a-9867-b35639167df1)/GT7Service.getLapSVG()
        // https://gt-engine.com/gt7/tracks/track-maps.html
        this.on("getLapSVG", Session, async (req) => {
            const sessionID = req.params[0] as string
            const svg = await getLapSVG(sessionID)
            // @ts-ignore
            req._.res.set('Content-Type', 'image/svg+xml');
            // @ts-ignore
            req._.res.end(svg);
        })

        this.on("READ", Session, async (req, next) => {
            const { ID } = req.data
            const { columns } = req.query.SELECT

            LOG.info(req.http.req.query)
            // handle stream properties
            if (ID && columns[0]?.ref[0] == 'trackUrl') {
                const lap = req.http.req.query.lap
                const data = req.http.req.query.raceData
                
                LOG.info("getLapSVG")

                if (lap && data) {
                    const svg = await getLapSVG(ID, parseInt(lap), data)
                    return {
                        //value: Readable.from([svg]),
                        value: svg, // seems to be auto handled
                        $mediaContentType: columns[1]?.val // image/svg+xml
                    }
                } else if (lap) {
                    LOG.info("getCompareLapsSVG")
                    const svg = await getCompareLapsSVG(ID)

                    return {
                        //value: Readable.from([svg]),
                        value: svg, // seems to be auto handled
                        $mediaContentType: columns[1]?.val // image/svg+xml
                    }
                } else {
                // const lap = req.query.SELECT.where[2].val
                // const data = req.query.SELECT.where[4].val
                const svg = await getLapSVG(ID)
                return {
                    //value: Readable.from([svg]),
                    value: svg, // seems to be auto handled
                    $mediaContentType: columns[1]?.val // image/svg+xml
                }
            }
            }

            return next() //> delegate to next/default handlers
        })

        this.on("READ", Laps, async (req, next) => {
            const { where } = req.query.SELECT;
            //const ID = req.params[0] as string
            if (where && where[2].val) {
                // read by /Session(UUID)/Laps
                return await getLaps(where[2].val)
            } else {
                return next() //> delegate to next/default handlers
            }
        })

        return super.init()
    }
}

async function getLapTimes(sessionID: string) {
    const bestLapTime = await getBestLapTime(sessionID)

    if (!bestLapTime) {
        return []
    }

    const laps = await SELECT
        .from(SimulatorInterfacePackets)
        .where({ session_ID: sessionID })
        .columns(["lapCount", "lastLapTime"])
        .groupBy("lapCount", "lastLapTime")

    let results = []
    for (let lap of laps) {
        if (lap.lastLapTime !== -1) {
            results.push({
                lap: lap.lapCount - 1,
                time: lap.lastLapTime,
                best: lap.lastLapTime === bestLapTime
            })
        }
    }

    return results
}

async function getCompareLaps(sessionID: string) {
    const bestLapTime = await getBestLapTime(sessionID)

    if (!bestLapTime) {
        return []
    }

    const laps = await SELECT
        .from(SimulatorInterfacePackets)
        .where({ session_ID: sessionID })
        .columns(["lapCount", "lastLapTime"])
        .groupBy("lapCount", "lastLapTime")

    let results = []
    for (let lap of laps) {
        if (lap.lastLapTime !== -1 && lap.lastLapTime !== bestLapTime) {
            results.push({
                lap: lap.lapCount - 1,
                time: lap.lastLapTime
            })
        }
    }

    return results
}

async function getBestLapTime(sessionId: string) {
    const result = await SELECT
        .one
        .from(SimulatorInterfacePackets)
        .where({ session_ID: sessionId })
        .columns(["bestLapTime"])
        .orderBy("packetId desc")

    return result?.bestLapTime
}

async function getLaps(sessionID: string) {
    const bestLapTime = await getBestLapTime(sessionID)

    if (!bestLapTime) {
        return []
    }

    const sipLaps = await SELECT
        .from(SimulatorInterfacePackets)
        .where({ session_ID: sessionID })
        .columns(["lapCount", "lastLapTime"])
        .groupBy("lapCount", "lastLapTime")

    let laps: any = []
    for (let lap of sipLaps) {
        if (lap.lastLapTime !== -1) {
            laps.push({
                session_ID: sessionID,
                lap: lap.lapCount - 1,
                time: lap.lastLapTime,
                best: lap.lastLapTime === bestLapTime
            })
        }
    }
    laps.$count = laps.length

    return laps
}

async function getCompareLapsSVG(sessionID: string) {
    if (!sessionID) {
        return
    }
    const laps = await getLaps(sessionID)
    const polyCoords = await getTrackCoordinates(sessionID, 1, 1)

    if (laps.length === 0) {
        return
    }

    let xMin = 100000, xMax = -100000, yMin = 100000, yMax = -100000
        for (let coord of polyCoords) {
            if (coord[0] < xMin) {
                xMin = coord[0]
            }
            if (coord[0] > xMax) {
                xMax = coord[0]
            }
            if (coord[1] < yMin) {
                yMin = coord[1]
            }
            if (coord[1] > yMax) {
                yMax = coord[1]
            }
        }

        // some padding
        const pad = 10
        xMin -= pad
        yMin -= pad
        xMax += pad
        yMax += pad

        // distance
        xMax = Math.abs(xMin) + Math.abs(xMax)
        yMax = Math.abs(yMin) + Math.abs(yMax)

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${xMin} ${yMin} ${xMax} ${yMax}">`
    for (let lap of laps) {
        const path = await getTrackCoordinates(sessionID, 1, lap.lap)
        const color = lap.best ? "green" : lap.lap === 1 ? "red" : lap.lap === 2 ? "blue" : lap.lap === 3 ? "yellow" : "white"
        svg += `<path d="M ${path}" fill="none" stroke="${color}" stroke-width="4"/>`
    }
    // draw best lap on top
    const bestLap = laps.find((lap: any) => lap.best)
    if (bestLap) {
        const path = await getTrackCoordinates(sessionID, 1, bestLap.lap)
        svg += `<path d="M ${path}" fill="none" stroke="green" stroke-width="4"/>`
    }
    svg += "</svg>"
    return svg
}

async function getLapSVG(sessionID: string, lapCount: number = 1, data: string = null) {
    if (sessionID) {
        const sampleRate = 1
        const polyCoords = await getTrackCoordinates(sessionID, sampleRate, lapCount)
        const path = polyCoords.map((c) => `${c[0]} ${c[1]}`).join(" ")
        const pathColor = await getColorFromData(sessionID, sampleRate, lapCount, data)


        // calc bounding box
        let xMin = 100000, xMax = -100000, yMin = 100000, yMax = -100000
        for (let coord of polyCoords) {
            if (coord[0] < xMin) {
                xMin = coord[0]
            }
            if (coord[0] > xMax) {
                xMax = coord[0]
            }
            if (coord[1] < yMin) {
                yMin = coord[1]
            }
            if (coord[1] > yMax) {
                yMax = coord[1]
            }
        }

        // some padding
        const pad = 30
        xMin -= pad
        yMin -= pad
        xMax += pad
        yMax += pad

        // distance
        xMax = Math.abs(xMin) + Math.abs(xMax)
        yMax = Math.abs(yMin) + Math.abs(yMax)


        // create SVG with pathcolor which is a list of rgb colors
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${xMin} ${yMin} ${xMax} ${yMax}">`
        svg += `<path d="M ${path}" fill="none" stroke="white" stroke-width="4"/>`
        if (data !== null) {
            for (let i = 0; i < polyCoords.length; i++) {
                const color = pathColor[i]
                svg += `<circle cx="${polyCoords[i][0]}" cy="${polyCoords[i][1]}" r="6" fill="rgb(${color[0]},${color[1]},${color[2]})"/>`
            }
        }
        svg += "</svg>"




        return svg
    } else {
        return ''
    }
}