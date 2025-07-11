"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cds = __importStar(require("@sap/cds"));
const cds_1 = require("@sap/cds");
const dbInterface_1 = require("./lib/dbInterface");
const LOG = (0, cds_1.log)('gt7-service');
const { Laps, Session, SimulatorInterfacePackets } = require('#cds-models/GT7Service');
//const { Readable } = require("stream")
module.exports = class GT7Service extends cds_1.ApplicationService {
    init() {
        const _super = Object.create(null, {
            init: { get: () => super.init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            // bound actions
            this.on("generateFioriMetrics", Session, (req) => __awaiter(this, void 0, void 0, function* () {
                const sessionID = req.params[0];
                yield (0, dbInterface_1.generateFioriMetrics)(sessionID);
                console.log("generateFioriMetrics", sessionID);
                return {};
            }));
            this.on("assignDriver", Session, (req) => __awaiter(this, void 0, void 0, function* () {
                const { sessionID, driver } = req.data;
                console.log("assignDriver", sessionID, driver);
                yield cds.run(UPDATE(Session).set({ driver: driver }).where({ ID: sessionID }));
                return { driver: driver };
            }));
            this.on("changeDriver", Session, (req) => __awaiter(this, void 0, void 0, function* () {
                const { NewDriver } = req.data;
                const sessionID = req.params[0];
                yield cds.run(UPDATE(Session).set({ driver: NewDriver }).where({ ID: sessionID }));
            }));
            this.on("deleteSession", Session, (req) => __awaiter(this, void 0, void 0, function* () {
                const sessionID = req.params[0];
                LOG.info(`deleteSession ${sessionID}`);
                yield (0, dbInterface_1.deleteSessions)(sessionID);
            }));
            //bound functions
            // https://gt-engine.com/gt7/tracks/track-maps.html
            this.on("getLapSVG", Session, (req) => __awaiter(this, void 0, void 0, function* () {
                const sessionID = req.params[0];
                const svg = yield getLapSVG(sessionID);
                // @ts-ignore
                // req._.res.set('Content-Type', 'image/svg+xml');
                // @ts-ignore
                // req._.res.end(svg);
                return next();
            }));
            this.on("READ", SimulatorInterfacePackets, (req, next) => __awaiter(this, void 0, void 0, function* () {
                if (req.query.SELECT && req.query.SELECT.limit && req.query.SELECT.limit.rows) {
                    req.query.SELECT.limit.rows.val = 100000; // or more
                }
                else {
                    // forcibly inject if missing
                    req.query.SELECT.limit = { rows: { val: 100000 }, offset: { val: 0 } };
                }
                const data = yield next();
                const SAMPLING_RATE = 7;
                if (!Array.isArray(data))
                    return data;
                data.map((dat) => {
                    dat.metersPerSecond_average *= 3.6;
                    dat.throttle_average /= 2.5;
                    dat.brake_average /= 2.5;
                });
                const downsampled = data.filter((_, index) => index % SAMPLING_RATE === 0);
                downsampled.sort((a, b) => a.currentLapTime - b.currentLapTime);
                return downsampled;
            }));
            this.on("READ", Session, (req, next) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { ID } = req.data;
                const { columns } = req.query.SELECT;
                LOG.info(req.http.req.query);
                // handle stream properties
                if (ID && ((_a = columns[0]) === null || _a === void 0 ? void 0 : _a.ref[0]) == 'trackUrl') {
                    const lap = req.http.req.query.lap;
                    const data = req.http.req.query.raceData;
                    LOG.info("getLapSVG");
                    if (lap && data) {
                        const svg = yield getLapSVG(ID, parseInt(String(lap)), String(data));
                        return {
                            //value: Readable.from([svg]),
                            value: svg, // seems to be auto handled
                            // $mediaContentType: columns[1]?.val // image/svg+xml
                            $mediaContentType: 'image/svg+xml'
                        };
                    }
                    else if (lap) {
                        LOG.info("getCompareLapsSVG");
                        const svg = yield getCompareLapsSVG(ID);
                        return {
                            //value: Readable.from([svg]),
                            value: svg, // seems to be auto handled
                            // $mediaContentType: columns[1]?.val // image/svg+xml
                            $mediaContentType: 'image/svg+xml'
                        };
                    }
                    else {
                        // const lap = req.query.SELECT.where[2].val
                        // const data = req.query.SELECT.where[4].val
                        const svg = yield getLapSVG(ID);
                        return {
                            //value: Readable.from([svg]),
                            value: svg, // seems to be auto handled
                            // $mediaContentType: columns[1]?.val // image/svg+xml
                            $mediaContentType: 'image/svg+xml'
                        };
                    }
                }
                return next(); //> delegate to next/default handlers
            }));
            this.on("READ", Laps, (req, next) => __awaiter(this, void 0, void 0, function* () {
                const { where } = req.query.SELECT;
                //const ID = req.params[0] as string
                if (where && where[2].val) {
                    // read by /Session(UUID)/Laps
                    return yield getLaps(where[2].val);
                }
                else {
                    return next(); //> delegate to next/default handlers
                }
            }));
            return _super.init.call(this);
        });
    }
};
function getLaps(sessionID) {
    return __awaiter(this, void 0, void 0, function* () {
        const laps = yield SELECT
            .from(Laps)
            .where({ session_ID: sessionID });
        LOG.info(laps);
        return laps;
    });
}
function getCompareLapsSVG(sessionID) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sessionID)
            return;
        const laps = yield getLaps(sessionID);
        if (laps.length === 0)
            return;
        const baseCoords = yield (0, dbInterface_1.getTrackCoordinates)(sessionID, 1, 1);
        // Bounding box calc
        let xMin = 100000, xMax = -100000, yMin = 100000, yMax = -100000;
        for (const [x, y] of baseCoords) {
            xMin = Math.min(xMin, x);
            xMax = Math.max(xMax, x);
            yMin = Math.min(yMin, y);
            yMax = Math.max(yMax, y);
        }
        yMin -= laps.length >= 3 ? 40 * laps.length : 40 * 3; // Adjust yMin based on number of laps
        yMax += laps.length >= 3 ? 40 * laps.length : 40 * 3;
        const lapColors = [
            "red", "blue", "orange", "purple", "cyan", "magenta", "yellow", "pink", "brown", "gray"
        ];
        const pad = 10;
        const viewBox = `${xMin - pad} ${yMin - pad} ${(xMax - xMin) + 2 * pad} ${(yMax - yMin) + 2 * pad}`;
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`;
        const maxRows = 3;
        const columnWidth = 180; // width reserved per column
        const rowHeight = 40; // vertical space per entry
        svg += `<g font-size="36" font-family="Arial" fill="white">`;
        laps.forEach((lap, i) => {
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
            const coords = yield (0, dbInterface_1.getTrackCoordinates)(sessionID, 1, lap.lap);
            const pathStr = coords.map(([x, y]) => `${x} ${y + (laps.length >= 3 ? 40 * laps.length : 40 * 3)}`).join(" ");
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
    });
}
function getLapSVG(sessionID_1) {
    return __awaiter(this, arguments, void 0, function* (sessionID, lapCount = 1, data = null) {
        if (sessionID) {
            const sampleRate = 1;
            const polyCoords = yield (0, dbInterface_1.getTrackCoordinates)(sessionID, sampleRate, lapCount);
            const path = polyCoords.map((c) => `${c[0]} ${c[1]}`).join(" ");
            const pathColor = yield (0, dbInterface_1.getColorFromData)(sessionID, sampleRate, lapCount, data);
            // calc bounding box
            let xMin = 100000, xMax = -100000, yMin = 100000, yMax = -100000;
            for (let coord of polyCoords) {
                if (coord[0] < xMin) {
                    xMin = coord[0];
                }
                if (coord[0] > xMax) {
                    xMax = coord[0];
                }
                if (coord[1] < yMin) {
                    yMin = coord[1];
                }
                if (coord[1] > yMax) {
                    yMax = coord[1];
                }
            }
            // some padding
            const pad = 30;
            xMin -= pad;
            yMin -= pad;
            xMax += pad;
            yMax += pad;
            // distance
            xMax = Math.abs(xMin) + Math.abs(xMax);
            yMax = Math.abs(yMin) + Math.abs(yMax);
            // create SVG with pathcolor which is a list of rgb colors
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${xMin} ${yMin} ${xMax} ${yMax}">`;
            svg += `<image href="{app>/path}/tracks/high-speed-ring.png" x="${xMin}" y="${yMin}" width="${xMax}" height="${yMax}" />`;
            svg += `<path d="M ${path}" fill="none" stroke="white" stroke-width="4"/>`;
            if (data !== null) {
                for (let i = 0; i < polyCoords.length; i++) {
                    const color = pathColor[i];
                    svg +=
                        `<circle cx="${polyCoords[i][0]}" cy="${polyCoords[i][1]}" r="6" fill="rgb(${color[0]},${color[1]},${color[2]})" data-tooltip="${data}: TEST" class="track-data-point"/>`;
                }
            }
            svg += "</svg>";
            return svg;
        }
        else {
            return '';
        }
    });
}
//# sourceMappingURL=gt7-service.js.map