import * as cds from '@sap/cds'
import { ApplicationService, log } from '@sap/cds'
import { getTrackCoordinates, getColorFromData, updateSession, deleteSessions, generateFioriMetrics } from './lib/dbInterface'

const LOG = log('gt7-service')
const { Laps, Session, SimulatorInterfacePackets } = require('#cds-models/GT7Service')
//const { Readable } = require("stream")
module.exports = class GT7Service extends ApplicationService {
    async init() {
        // bound actions

        this.on("generateFioriMetrics", Session, async (req) => {
            const sessionID = req.params[0] as string

            await generateFioriMetrics(sessionID)
            console.log("generateFioriMetrics", sessionID)

            return {}
        })

        this.on("assignDriver", Session, async (req) => {
            const { sessionID, driver } = req.data;
            console.log("assignDriver", sessionID, driver)
            await cds.run(UPDATE(Session).set({ driver: driver }).where({ ID: sessionID }));
            
            return { driver: driver };
        })

        this.on("changeDriver", Session, async (req) => {
            const { NewDriver } = req.data;
            const sessionID = req.params[0] as string;

            await cds.run(UPDATE(Session).set({ driver: NewDriver }).where({ ID: sessionID }));

        })


        this.on("deleteSession", Session, async (req) => {
            const sessionID = req.params[0] as string;
            

            LOG.info(`deleteSession ${sessionID}`)
            await deleteSessions(sessionID)
        })


        //bound functions

        // https://gt-engine.com/gt7/tracks/track-maps.html
        this.on("getLapSVG", Session, async (req) => {
            const sessionID = req.params[0] as string
            const svg = await getLapSVG(sessionID)
            // @ts-ignore
            // req._.res.set('Content-Type', 'image/svg+xml');
            // @ts-ignore
            // req._.res.end(svg);
            return next();
        })

        this.on("READ", SimulatorInterfacePackets, async (req, next) => {
            if (req.query.SELECT && req.query.SELECT.limit && req.query.SELECT.limit.rows) {
                req.query.SELECT.limit.rows.val = 100000; // or more
              } else {
                // forcibly inject if missing
                req.query.SELECT.limit = { rows: { val: 100000 }, offset: { val: 0 } };
              }
              const data = await next();
              const SAMPLING_RATE = 7;

              if (!Array.isArray(data)) return data;

              data.map((dat) => {
                dat.metersPerSecond_average *= 3.6;
                dat.throttle_average /= 2.5;
                dat.brake_average /= 2.5
              })
            
              const downsampled = data.filter((_, index) => index % SAMPLING_RATE === 0);
              downsampled.sort((a, b) => a.currentLapTime - b.currentLapTime);
              return downsampled;
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
                    const svg = await getLapSVG(ID, parseInt(String(lap)), String(data))
                    return {
                        //value: Readable.from([svg]),
                        value: svg, // seems to be auto handled
                        // $mediaContentType: columns[1]?.val // image/svg+xml
                        $mediaContentType: 'image/svg+xml'
                    }
                } else if (lap) {
                    LOG.info("getCompareLapsSVG")
                    const svg = await getCompareLapsSVG(ID)

                    return {
                        //value: Readable.from([svg]),
                        value: svg, // seems to be auto handled
                        // $mediaContentType: columns[1]?.val // image/svg+xml
                        $mediaContentType: 'image/svg+xml'
                    }
                } else {
                // const lap = req.query.SELECT.where[2].val
                // const data = req.query.SELECT.where[4].val
                const svg = await getLapSVG(ID)
                return {
                    //value: Readable.from([svg]),
                    value: svg, // seems to be auto handled
                    // $mediaContentType: columns[1]?.val // image/svg+xml
                    $mediaContentType: 'image/svg+xml'
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

async function getLaps(sessionID: string) {
    const laps = await SELECT
        .from(Laps)
        .where({ session_ID: sessionID })

    LOG.info(laps)
    return laps
    
}

async function getCompareLapsSVG(sessionID: string): Promise<string | undefined> {
    if (!sessionID) return;

    const laps = await getLaps(sessionID);
    if (laps.length === 0) return;

    const baseCoords = await getTrackCoordinates(sessionID, 1, 1);

    // Bounding box calc
    let xMin = 100000, xMax = -100000, yMin = 100000, yMax = -100000;
    for (const [x, y] of baseCoords) {
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
    }

    yMin -= laps.length >= 3? 40 * laps.length : 40 * 3; // Adjust yMin based on number of laps
    yMax += laps.length >= 3? 40 * laps.length : 40 * 3;

    const lapColors = [
        "red", "blue", "orange", "purple", "cyan", "magenta", "yellow", "pink", "brown", "gray"
      ];

    const pad = 10;
    const viewBox = `${xMin - pad} ${yMin - pad} ${(xMax - xMin) + 2 * pad} ${(yMax - yMin) + 2 * pad}`;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`;

    const maxRows = 3;
    const columnWidth = 180;  // width reserved per column
    const rowHeight = 40;     // vertical space per entry

    svg += `<g font-size="36" font-family="Arial" fill="white">`;

    laps.forEach((lap: { best: boolean; lap: number }, i: number) => {
        const col = Math.floor(i / maxRows);
        const row = i % maxRows;

        const x = xMin + pad + col * columnWidth;
        const y = yMin - pad + 10 + row * rowHeight;

        const color = lap.best ? "limegreen" : lapColors[(lap.lap - 1) % lapColors.length];
        const label = `Lap ${lap.lap}${lap.best ? " (Best)" : ""}`;

        svg += `
            <circle cx="${x}" cy="${y + 30}" r="10" fill="${color}" stroke="black" stroke-width="0.5"/>
            <text x="${x + 20}" y="${y + 40}" fill="white">${label}</text>
        `;
    });

    svg += `</g>`;


    for (const lap of laps) {
        const coords = await getTrackCoordinates(sessionID, 1, lap.lap);
        const pathStr = coords.map(([x, y]) => `${x} ${y + (laps.length >= 3? 40 * laps.length : 40 * 3)}`).join(" ");
          const color = lap.best ? "limegreen" : lapColors[(lap.lap - 1) % lapColors.length];
        const start = coords[0];

        svg += `<g>
            <path d="M ${pathStr}" fill="none" stroke="${color}" stroke-width="4"/>
            <title>Lap ${lap.lap}${lap.best ? " (Best Lap)" : ""}</title>
            <text x="${start[0]}" y="${start[1]}" font-size="10" fill="${color}" text-anchor="middle" dy="-5">#${lap.lap}</text>
        </g>`;
    }

    svg += "</svg>";
    return svg;
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
        svg += `<image href="{app>/path}/tracks/high-speed-ring.png" x="${xMin}" y="${yMin}" width="${xMax}" height="${yMax}" />`
        svg += `<path d="M ${path}" fill="none" stroke="white" stroke-width="4"/>`
        if (data !== null) {
            for (let i = 0; i < polyCoords.length; i++) {
                const color = pathColor[i]
                svg += 
                `<circle cx="${polyCoords[i][0]}" cy="${polyCoords[i][1]}" r="6" fill="rgb(${color[0]},${color[1]},${color[2]})" data-tooltip="${data}: TEST" class="track-data-point"/>`
            }
        }
        svg += "</svg>"
        return svg
    } else {
        return ''
    }
}