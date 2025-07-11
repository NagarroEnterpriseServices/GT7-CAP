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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cds = __importStar(require("@sap/cds"));
const cds_1 = require("@sap/cds");
const ws_1 = __importDefault(require("ws"));
const lapcounter_1 = __importDefault(require("./lib/utils/lapcounter"));
const dbInterface_1 = require("./lib/dbInterface");
const parser_1 = require("./lib/utils/parser");
if (cds.env.profiles.includes('plc')) {
    const LOG = (0, cds_1.log)('plc-service');
    module.exports = class PLCService extends cds_1.Service {
        constructor() {
            super(...arguments);
            this.lapCounter = new lapcounter_1.default();
            this.recording = false;
            this.sessionId = null;
            this.driver = null;
            this.lastLap = -1;
            this.distance = 0;
        }
        init() {
            const _super = Object.create(null, {
                init: { get: () => super.init }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const ws = new ws_1.default('ws://192.168.1.10:1880/ws/plc');
                const wsSrv = yield cds.connect.to('WebSocketService');
                this.on("driverAssigned", (msg) => __awaiter(this, void 0, void 0, function* () {
                    this.driver = msg.data.driver;
                    LOG.info("Driver assigned: ", this.driver);
                }));
                ws.on('open', () => {
                    LOG.info('Connected to WebSocket server');
                    ws.send(JSON.stringify({ type: 'subscribe', channel: 'updates' }));
                });
                ws.on('message', (data) => {
                    const jsonString = data.toString(); // Convert Buffer to UTF-8 string
                    try {
                        const json = JSON.parse(jsonString); // Parse JSON
                        this.onMessage(json, wsSrv);
                    }
                    catch (err) {
                        LOG.error('Invalid JSON received:', err);
                    }
                });
                ws.on('error', (err) => {
                    LOG.error('WebSocket error:', err);
                });
                ws.on('close', (code, reason) => {
                    LOG.warn(`WebSocket closed: ${code} - ${reason}`);
                });
                return _super.init.call(this);
            });
        }
        onMessage(message, wsSrv) {
            return __awaiter(this, void 0, void 0, function* () {
                // record if is in race (lapsInRace > 0) and if not in post-race (lapCount <= lapsInRace) and not in replay 
                if (message.lapsInRace > 0 && message.lapCount <= message.lapsInRace && message.lapCount > 0) {
                    this.recording = true;
                }
                else {
                    this.recording = false;
                }
                // start new session
                if (this.recording && !this.sessionId) {
                    this.sessionId = cds.utils.uuid();
                    LOG.info('new session', this.sessionId);
                    this.distance = 0;
                    this.raceStartTimeOfDayProgression = message.timeOfDayProgression;
                    (0, dbInterface_1.logSession)(this.sessionId, message, this.driver).catch((reason) => {
                        LOG.error("Error logging session: ", reason);
                    });
                }
                // reset counter
                if (this.lastLap !== message.lapCount) {
                    this.lastLap = message.lapCount;
                    this.lapStartTimeOfDayProgression = message.timeOfDayProgression;
                    this.distance = 0;
                }
                // calculate currentLapTime from sip
                this.lapCounter.update(message.lapCount, (message.flags & parser_1.SimulatorFlags.Paused) === parser_1.SimulatorFlags.Paused, message.packetId, message.lastLapTime);
                message.currentLapTime = message.timeOfDayProgression - this.lapStartTimeOfDayProgression;
                message.raceTime = message.timeOfDayProgression - this.raceStartTimeOfDayProgression;
                // calculate distance ontrack
                if (((message.flags & parser_1.SimulatorFlags.Paused) !== parser_1.SimulatorFlags.Paused) && this.recording) {
                    message.distance = this.distance += message.metersPerSecond * 0.01667;
                }
                // logging of packet
                if (this.recording && this.sessionId) {
                    if ((message.flags & parser_1.SimulatorFlags.CarOnTrack) === parser_1.SimulatorFlags.CarOnTrack) {
                        if ((message.flags & parser_1.SimulatorFlags.LoadingOrProcessing) !== parser_1.SimulatorFlags.LoadingOrProcessing) {
                            if ((message.flags & parser_1.SimulatorFlags.Paused) !== parser_1.SimulatorFlags.Paused) {
                                yield (0, dbInterface_1.logSimulatorInterfacePacket)(this.sessionId, message);
                            }
                        }
                    }
                }
                // session end handling
                if (!this.recording && this.sessionId) {
                    wsSrv.emit("STOPRECORDING"); // let the racedash know that the race is finished and resets the driver
                    LOG.info('stop recording');
                    if (message.lapCount > message.lapsInRace) {
                        LOG.info('driver finished: ' + this.driver);
                        yield (0, dbInterface_1.updateSession)(this.sessionId, this.driver, true, message);
                        LOG.info('session finished');
                    }
                    else {
                        LOG.info('driver did not finish: ' + this.driver);
                        yield (0, dbInterface_1.updateSession)(this.sessionId, this.driver, false, message);
                    }
                    this.driver = null;
                    this.sessionId = null;
                }
                // send message to websocket service
                wsSrv.emit("SIPGT7", message);
            });
        }
    };
}
//# sourceMappingURL=plc-service.js.map