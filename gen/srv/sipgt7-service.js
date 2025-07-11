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
const node_dgram_1 = require("node:dgram");
const decoder_1 = require("./lib/utils/decoder");
const lapcounter_1 = __importDefault(require("./lib/utils/lapcounter"));
const parser_1 = require("./lib/utils/parser");
const dbInterface_1 = require("./lib/dbInterface");
if (!cds.env.profiles.includes('plc')) {
    const LOG = (0, cds_1.log)('sipgt7-service');
    const bindPort = process.env.GT_VERSION == 'GTS' ? 33340 :
        process.env.GT_VERSION == 'GT7' ? 33740 : 33340;
    const receivePort = process.env.GT_VERSION == 'GTS' ? 33339 :
        process.env.GT_VERSION == 'GT7' ? 33739 : 33339;
    const psIp = process.env.PLAYSTATION_IP;
    module.exports = class SIPGT7Service extends cds_1.Service {
        constructor() {
            super(...arguments);
            this.lapCounter = new lapcounter_1.default();
            this.isUdpSocketReady = false;
            this.recording = false;
            this.sessionId = null;
            this.packetCount = 0;
            this.lastLapRecorded = false;
            this.driver = null;
            this.lastLap = -1;
            this.distance = 0;
        }
        init() {
            const _super = Object.create(null, {
                init: { get: () => super.init }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const socket = this.socket = (0, node_dgram_1.createSocket)('udp4');
                const { SimulatorInterfacePackets } = require('#cds-models/gt7');
                // cross service dependencies
                const wsSrv = yield cds.connect.to('WebSocketService');
                this.on("driverAssigned", (msg) => __awaiter(this, void 0, void 0, function* () {
                    this.driver = msg.data.driver;
                }));
                socket.on('message', (data, rinfo) => {
                    if (data.length === 0x128) {
                        const packet = (0, decoder_1.decrypt)(data);
                        const magic = packet.readInt32LE();
                        // 0x30533647 = G6S0 - GT6
                        // 0x47375330 = 0S7G - GTSport/GT7
                        if (magic != 0x47375330) { // GT6 should also work!
                            // 0S7G - G7S0
                            LOG._error && LOG.error('on packet:', "Magic error!", magic);
                        }
                        else {
                            const message = parser_1.gt7parser.parse(packet);
                            this.onMessage(message, wsSrv);
                        }
                    }
                });
                socket.on('listening', () => {
                    const address = this.socket.address();
                    this.isUdpSocketReady = true;
                    LOG._info && LOG.info(`SIP ${process.env.GT_VERSION} server listening on UDP ${address.address}:${address.port} for IP ${psIp}`);
                    this.sendHeartbeat();
                });
                socket.on('error', (err) => {
                    LOG._error && LOG.error(`server error:\n${err.stack}`);
                    socket.close();
                });
                socket.bind(bindPort);
                return _super.init.call(this);
            });
        }
        sendHeartbeat() {
            if (!this.isUdpSocketReady)
                return;
            this.socket.send(Buffer.from("A"), 0, 1, receivePort, psIp, (err) => {
                if (err) {
                    this.socket.close();
                    return;
                }
            });
        }
        onMessage(message, wsSrv) {
            return __awaiter(this, void 0, void 0, function* () {
                //send packet to PS5
                if (this.packetCount++ >= 200) {
                    this.sendHeartbeat();
                    this.packetCount = 0;
                }
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
                    console.log('new session', this.sessionId);
                    this.distance = 0;
                    (0, dbInterface_1.logSession)(this.sessionId, message, this.driver).catch((reason) => {
                        console.error("Error logging session: ", reason);
                    });
                }
                // reset counter
                if (this.lastLap !== message.lapCount) {
                    this.lastLap = message.lapCount;
                    this.startTimeOfDayProgression = message.timeOfDayProgression;
                    this.distance = 0;
                }
                // update lap infos
                this.lapCounter.update(message.lapCount, (message.flags & parser_1.SimulatorFlags.Paused) === parser_1.SimulatorFlags.Paused, message.packetId, message.lastLapTime);
                // update lap time
                message.currentLapTime = message.timeOfDayProgression - this.startTimeOfDayProgression;
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
                        yield (0, dbInterface_1.updateSession)(this.sessionId, this.driver, true, message);
                        LOG.info('session finished');
                    }
                    this.driver = null;
                    this.sessionId = null;
                }
                // send message to websocket service
                wsSrv.emit("SIPGT7", message);
            });
        }
    };
    // async onRecording(data: Recording, wsSrv: cds.Service) {
    //     // change recording flag
    //     this.recording = data.recording
    //     if (this.recording) {
    //         // reset
    //         this.sessionId = null
    //         this.lastLapRecorded = false
    //     }        
    // }
    // async onMessage(message: any, wsSrv: cds.Service) {
    //     // use UDP headbeat as a gauge of liveness
    //     // record if is in race (lapsInRace > 0) and if not in post-race (lapCount <= lapsInRace) and not in replay 
    //     if (message.lapsInRace > 0 && message.lapCount <= message.lapsInRace && !this.recording && message.lapCount > 0) {
    //         //console.log('recording')
    //         //console.log(message)
    //         this.recording = true
    //     }
    //     if (this.packetCount++ >= 200) {
    //         this.sendHeartbeat()
    //         this.packetCount = 0 // reset loop
    //     }
    //     // session handling
    //     if (this.recording && !this.sessionId) {
    //         // start new session
    //         this.sessionId = cds.utils.uuid()
    //         console.log('new session', this.sessionId)
    //         this.lastLapRecorded = false
    //         logSession(this.sessionId, message, this.driver).catch((reason: any) => {
    //             console.error("Error logging session: ", reason);
    //         });            
    //     }
    //     // reset counter
    //     if (this.lastLap !== message.lapCount) {
    //         this.lastLap = message.lapCount
    //         this.startTimeOfDayProgression = message.timeOfDayProgression
    //         this.distance = 0
    //     }
    //     // calculate currentLapTime from sip
    //     this.lapCounter.update(
    //         message.lapCount,
    //         (message.flags & SimulatorFlags.Paused) === SimulatorFlags.Paused,
    //         message.packetId,
    //         message.lastLapTime
    //     )
    //     message.currentLapTime = this.lapCounter.getLapTime()
    //     // calculate currentLapTime2 from timeOfDayProgression
    //     message.currentLapTime2 = message.timeOfDayProgression - this.startTimeOfDayProgression
    //     // calculate distance ontrack
    //     if (((message.flags & SimulatorFlags.Paused) !== SimulatorFlags.Paused)){
    //         message.distance = this.distance += message.metersPerSecond * 0.01667
    //     }
    //     if(this.recording && this.sessionId) {
    //         //const flags = message.flags as SimulatorFlags
    //         if ((message.flags & SimulatorFlags.CarOnTrack) === SimulatorFlags.CarOnTrack) {
    //             if ((message.flags & SimulatorFlags.LoadingOrProcessing) !== SimulatorFlags.LoadingOrProcessing) {
    //                 if ((message.flags & SimulatorFlags.Paused) !== SimulatorFlags.Paused) {
    //                     if (message.lapCount > 0) {
    //                         // check if post race (lapCount > lapsInRace)
    //                         if (message.lapCount <= message.lapsInRace) {
    //                             await logSimulatorInterfacePacket(this.sessionId, message)
    //                         } else if (!this.lastLapRecorded) {
    //                             this.lastLapRecorded = true
    //                             this.recording = false
    //                             wsSrv.emit("STOPRECORDING") // let the racedash know that the race is finished and resets the driver
    //                             console.log('stop recording')
    //                             // record one sip after last lap to get lastLapTime
    //                             await logSimulatorInterfacePacket(this.sessionId, message)
    //                             //updateSession(sessionId, true, message.bestLapTime, message.lapsInRace)
    //                             await updateSession(this.sessionId, this.driver, true, message)
    //                             this.driver = null
    //                             this.sessionId = null
    //                         }
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     wsSrv.emit("SIPGT7", message)
    // }
}
//# sourceMappingURL=sipgt7-service.js.map