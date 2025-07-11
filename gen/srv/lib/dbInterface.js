"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSession = logSession;
exports.updateSession = updateSession;
exports.deleteUnfinishedSessions = deleteUnfinishedSessions;
exports.deleteSessions = deleteSessions;
exports.generateFioriMetrics = generateFioriMetrics;
exports.getBestLap = getBestLap;
exports.logSimulatorInterfacePacket = logSimulatorInterfacePacket;
exports.getCarName = getCarName;
exports.getColorFromData = getColorFromData;
exports.getTrackCoordinates = getTrackCoordinates;
const cds_1 = __importDefault(require("@sap/cds"));
const pg_1 = require("pg");
const { Sessions, SimulatorInterfacePackets, Cars, Laps } = require('#cds-models/gt7');
let cars = []; // car name cache
function logSession(sessionId, sip, driver) {
    return __awaiter(this, void 0, void 0, function* () {
        let payload = {
            ID: sessionId,
            createdAt: new Date(),
            lapsInRace: sip.lapsInRace,
            car_ID: sip.carCode,
            timeOfDay: sip.timeOfDayProgression,
            bodyHeight: sip.bodyHeight,
            driver: driver
        };
        yield INSERT.into(Sessions).entries(payload);
    });
}
function updateSession(sessionId, driver, finished, sip) {
    return __awaiter(this, void 0, void 0, function* () {
        const bestLap = yield getBestLap(sessionId, sip.bestLapTime);
        yield UPDATE(Sessions, sessionId).with({
            finished: finished,
            lapsInRace: sip.lapsInRace,
            bestLap: bestLap,
            bestLapTime: sip.bestLapTime,
            raceTime: sip.raceTime,
            calculatedMaxSpeed: sip.calculatedMaxSpeed
        });
        yield generateFioriMetrics(sessionId);
        if (finished == false) {
            yield deleteUnfinishedSessions(sessionId);
            return;
        }
        if (cds_1.default.env.profiles.includes('sac')) {
            if (driver === null || driver === "" || driver === undefined)
                return;
            const api = yield cds_1.default.connect.to("sac_service");
            const client = new pg_1.Client({
                user: 'postgres',
                host: 'localhost',
                database: 'postgres',
                password: 'postgres',
                port: 5432,
            });
            yield client.connect();
            const result = yield client.query(`SELECT * FROM F_GT7PS5Agreg_V2('${sessionId}')`);
            // in the api, insert all data gotten from the sql function
            for (let row of result.rows) {
                // insert via sql query
                const data = {
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
                    Drivername: driver !== null && driver !== void 0 ? driver : "",
                };
                const res = yield api.post('ZC_SESSIONSV4', data);
            }
            yield client.end();
        }
    });
}
function deleteUnfinishedSessions(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const unfinishedSession = yield SELECT.from(Sessions).where({ finished: false, ID: id });
        if (unfinishedSession) {
            yield DELETE.from(Sessions).where({ finished: false, ID: id });
            yield DELETE.from(SimulatorInterfacePackets).where({ session_ID: id });
        }
    });
}
function deleteSessions(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield SELECT.from(Sessions).where({ ID: id });
        if (session) {
            yield DELETE.from(Sessions).where({ ID: id });
            yield DELETE.from(SimulatorInterfacePackets).where({ session_ID: id });
        }
    });
}
function generateFioriMetrics(sessionID) {
    return __awaiter(this, void 0, void 0, function* () {
        // delete old data
        yield DELETE
            .from(Laps)
            .where({ session_ID: sessionID });
        // get all session simulator packages 
        const sips = yield SELECT
            .from(SimulatorInterfacePackets)
            .where({ session_ID: sessionID })
            .columns(["packetId", "lapCount", "metersPerSecond", "brake", "throttle", "currentLapTime", "lapsInRace"])
            .orderBy("packetId");
        // write laps
        yield writeLaps(sessionID, sips);
    });
}
function writeLaps(sessionID, sips) {
    return __awaiter(this, void 0, void 0, function* () {
        // insert each lap into Laps
        let laps = [];
        let speeds = [];
        for (let sip of sips) {
            if (sip.lapCount != laps.length) {
                if (laps.length > 0) {
                    laps[laps.length - 1].avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
                }
                laps.push({
                    session_ID: sessionID,
                    lap: sip.lapCount,
                    time: sip.currentLapTime,
                    maxSpeed: sip.metersPerSecond * 3.6,
                    avgSpeed: 0,
                    best: false
                });
                speeds = [sip.metersPerSecond * 3.6];
            }
            else {
                laps[laps.length - 1].time = sip.currentLapTime;
                laps[laps.length - 1].maxSpeed = Math.max(laps[laps.length - 1].maxSpeed, sip.metersPerSecond * 3.6);
                speeds.push(sip.metersPerSecond * 3.6);
            }
        }
        if (laps.length > 0 && speeds.length > 0) {
            laps[laps.length - 1].avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        }
        // get best lap
        const bestLapTime = Math.min(...laps.map(lap => lap.time));
        laps.forEach(lap => lap.best = lap.time === bestLapTime);
        if ((sips === null || sips === void 0 ? void 0 : sips.length) > 0 && sips[0].lapsInRace < laps.length) {
            laps.pop();
        }
        // insert laps
        for (let lap of laps) {
            try {
                yield INSERT.into(Laps).entries(lap);
            }
            catch (e) {
                console.log('FioriExported::writeLaps ' + e);
            }
        }
    });
}
function getBestLap(sessionId, bestLapTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield SELECT
            .one
            .from(SimulatorInterfacePackets)
            .where({
            session_ID: sessionId,
            lastLapTime: bestLapTime
        })
            .columns(["lapCount"])
            .orderBy("packetId desc");
        return (result === null || result === void 0 ? void 0 : result.lapCount) ? result.lapCount - 1 : null;
    });
}
function logSimulatorInterfacePacket(sessionId, sip) {
    return __awaiter(this, void 0, void 0, function* () {
        const sipEntity = sip;
        const map = typeof (sipEntity.session_ID) === 'undefined';
        sipEntity.session_ID = sessionId;
        if (map) {
            sipEntity.car_ID = sipEntity.carCode;
            // position
            sipEntity.position_x = sipEntity.position.x;
            sipEntity.position_y = sipEntity.position.y;
            sipEntity.position_z = sipEntity.position.z;
            // velocity
            sipEntity.velocity_x = sipEntity.velocity.x;
            sipEntity.velocity_y = sipEntity.velocity.y;
            sipEntity.velocity_z = sipEntity.velocity.z;
            // rotation
            sipEntity.rotation_pitch = sipEntity.rotation.pitch;
            sipEntity.rotation_yaw = sipEntity.rotation.yaw;
            sipEntity.rotation_roll = sipEntity.rotation.roll;
            // angularVelocity
            sipEntity.angularVelocity_x = sipEntity.angularVelocity.x;
            sipEntity.angularVelocity_y = sipEntity.angularVelocity.y;
            sipEntity.angularVelocity_z = sipEntity.angularVelocity.z;
            // tireSurfaceTemperature
            sipEntity.tireSurfaceTemperature_fl = sipEntity.tireSurfaceTemperature.FrontLeft;
            sipEntity.tireSurfaceTemperature_fr = sipEntity.tireSurfaceTemperature.FrontRight;
            sipEntity.tireSurfaceTemperature_rl = sipEntity.tireSurfaceTemperature.RearLeft;
            sipEntity.tireSurfaceTemperature_rr = sipEntity.tireSurfaceTemperature.RearRight;
            // tireSuspensionHeight
            sipEntity.tireSuspensionHeight_fl = sipEntity.tireSusHeight.FrontLeft;
            sipEntity.tireSuspensionHeight_fr = sipEntity.tireSusHeight.FrontRight;
            sipEntity.tireSuspensionHeight_rl = sipEntity.tireSusHeight.RearLeft;
            sipEntity.tireSuspensionHeight_rr = sipEntity.tireSusHeight.RearRight;
            // wheelRevPerSecond
            sipEntity.wheelRevPerSecond_fl = sipEntity.wheelRevPerSecond.FrontLeft;
            sipEntity.wheelRevPerSecond_fr = sipEntity.wheelRevPerSecond.FrontRight;
            sipEntity.wheelRevPerSecond_rl = sipEntity.wheelRevPerSecond.RearLeft;
            sipEntity.wheelRevPerSecond_rr = sipEntity.wheelRevPerSecond.RearRight;
        }
        yield INSERT.into(SimulatorInterfacePackets).entries(sipEntity);
    });
}
function getCarName(carCode) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cars[carCode]) {
            return cars[carCode];
        }
        else {
            const result = yield SELECT.one.from(Cars).where({ ID: carCode }).columns(["name"]);
            return cars[carCode] = (result === null || result === void 0 ? void 0 : result.name) ? result.name : "unknown";
        }
    });
}
function getColorFromData(sessionID, sampleRate, lapCount, dataType) {
    return __awaiter(this, void 0, void 0, function* () {
        if (dataType == null)
            return null;
        let raceData = [];
        switch (dataType) {
            case "angularVelocity":
                raceData = ["angularVelocity_x", "angularVelocity_y", "angularVelocity_z"];
                break;
            case "tireSurfaceTemperature":
                raceData = ["tireSurfaceTemperature_fl", "tireSurfaceTemperature_fr", "tireSurfaceTemperature_rl", "tireSurfaceTemperature_rr"];
                break;
            case "engineRPM":
                raceData = ["engineRPM"];
                break;
            case "gasLevel":
                raceData = ["gasLevel"];
                break;
            case "metersPerSecond":
                raceData = ["metersPerSecond"];
                break;
            case "distance":
                raceData = ["distance"];
                break;
            case "turboBoost":
                raceData = ["turboBoost"];
                break;
            case "oilPressure":
                raceData = ["oilPressure"];
                break;
            case "oilTemperature":
                raceData = ["oilTemperature"];
                break;
            case "waterTemperature":
                raceData = ["waterTemperature"];
                break;
            case "currentGear":
                raceData = ["currentGear"];
                break;
            case "suggestedGear":
                raceData = ["suggestedGear"];
                break;
            case "throttle":
                raceData = ["throttle"];
                break;
            case "brake":
                raceData = ["brake"];
                break;
        }
        const sips = yield SELECT
            .from(SimulatorInterfacePackets)
            .where({
            session_ID: sessionID,
            lapCount: lapCount
        })
            .columns(raceData)
            .orderBy("packetId");
        let frames = [];
        for (let sip of sips) {
            let frame = 0;
            for (let data of raceData) {
                frame += sip[data];
            }
            frames.push(frame);
        }
        const colors = [];
        let counter = sampleRate;
        const min = Math.min(...frames);
        const max = Math.max(...frames);
        for (let frame of frames) {
            if (counter++ >= sampleRate) {
                const value = (frame - min) / (max - min);
                const color = [0, 0, 0];
                if (value < 0.5) {
                    color[1] = 255;
                    color[0] = 255 * (value * 2); // scale to 0..1 then 0..255
                }
                else {
                    color[0] = 255;
                    color[1] = 255 * (2 - value * 2); // fade green down to 0
                }
                colors.push(color);
                counter = 0;
            }
        }
        return colors;
    });
}
function getTrackCoordinates(sessionID, sampleRate, lapCount) {
    return __awaiter(this, void 0, void 0, function* () {
        const sips = yield SELECT
            .from(SimulatorInterfacePackets)
            .where({
            session_ID: sessionID,
            lapCount: lapCount
        })
            .columns(["position_x", "position_z"])
            .orderBy("packetId");
        const coordinates = [[]];
        let counter = sampleRate;
        for (let sip of sips) {
            if (counter++ >= sampleRate) {
                coordinates.push([sip.position_x, sip.position_z]);
                counter = 0;
            }
        }
        // how to defined an empty stacked array?!? hack to remove initiallly empty first entry
        coordinates.shift();
        return coordinates;
    });
}
//# sourceMappingURL=dbInterface.js.map