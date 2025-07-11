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
exports.getCloudEvent = getCloudEvent;
const ws_1 = __importDefault(require("ws"));
const cds = __importStar(require("@sap/cds"));
const cds_1 = require("@sap/cds");
const parser_1 = require("./lib/utils/parser");
const dbInterface_1 = require("./lib/dbInterface");
const LOG = (0, cds_1.log)('websocket-service');
let simulatorData = null;
let recording = false;
let driver = null;
module.exports = class WebSocketService extends cds_1.Service {
    init() {
        const _super = Object.create(null, {
            init: { get: () => super.init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const wss = new ws_1.default.Server({ noServer: true });
            // attach to cap express http server
            cds.on("listening", ({ server }) => {
                server.on("upgrade", (request, socket, head) => {
                    if (request.url === "/ws") {
                        wss.handleUpgrade(request, socket, head, function done(ws) {
                            wss.emit("connection", ws, request);
                        });
                    }
                    else {
                        LOG._warn && LOG.warn(`Pathname ${request.url} not allowed for WebSocket connection`);
                        socket.destroy();
                    }
                });
            });
            this.on("SIPGT7", (msg) => __awaiter(this, void 0, void 0, function* () {
                simulatorData = msg.data;
                simulatorData.recording = recording;
                simulatorData.connections = wss.clients.size;
                simulatorData.carName = yield (0, dbInterface_1.getCarName)(simulatorData.carCode);
                wss.clients.forEach(function each(client) {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify(getCloudEvent("sip", simulatorData)));
                    }
                });
                //ws.send(JSON.stringify(getCloudEvent("sip", simulatorData)))
            }));
            this.on("STOPRECORDING", () => __awaiter(this, void 0, void 0, function* () {
                LOG._info && LOG.info("on STOPRECORDING");
                wss.clients.forEach(function each(client) {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify(getCloudEvent("recording", {
                            "recording": false
                        })));
                    }
                });
            }));
            wss.on("connection", (ws) => {
                //ws.id = req.headers.get("sec-websocket-key") 
                // send one test dataset mockdata for offline testing
                //const mockData = simulatorMockData
                const mockData = (0, parser_1.getMockData)();
                // mockData.recording = recording
                mockData.connections = wss.clients.size;
                ws.send(JSON.stringify(getCloudEvent("sip", mockData)));
                ws.on("message", function message(data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        //@ts-ignore
                        const event = JSON.parse(data);
                        switch (event.type) {
                            case "racedash.event.driver":
                                driver = (_a = event === null || event === void 0 ? void 0 : event.data) === null || _a === void 0 ? void 0 : _a.driver;
                                LOG._debug && LOG.debug("racedash.event.driver", driver);
                                if (!cds.env.profiles.includes('plc')) {
                                    const sipgt7Srv = yield cds.connect.to('SIPGT7Service');
                                    sipgt7Srv.emit("driverAssigned", { driver: driver });
                                }
                                else {
                                    const plcSrv = yield cds.connect.to('PLCService');
                                    plcSrv.emit("driverAssigned", { driver: driver });
                                }
                                // broadcast to all clients
                                // wss.clients.forEach(function each(client) {
                                //     if (client.readyState === WebSocket.OPEN) {
                                //         client.send(JSON.stringify(getCloudEvent("driver", {
                                //             "recording": recording
                                //         })))
                                //     }
                                // })
                                break;
                        }
                    });
                });
            });
            //return await super.init()
            return _super.init.call(this);
        });
    }
};
function getCloudEvent(type, data) {
    return {
        "id": "1",
        "specversion": "1.0",
        "type": `racedash.event.${type}`,
        "source": "/message",
        "time": new Date().toISOString(),
        "datacontenttype": "application/json",
        "data": data
    };
}
//# sourceMappingURL=websocket-service.js.map