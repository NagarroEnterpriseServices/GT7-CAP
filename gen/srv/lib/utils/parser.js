"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gt7parser = exports.SimulatorFlags = exports.lapTick = void 0;
exports.getMockData = getMockData;
const binary_parser_1 = require("binary-parser");
let packetId = 1;
let timeOfDayProgression = 28934083;
exports.lapTick = 16.67;
/* Usage
** let flags = SimulatorFlags.CarOnTrack | !SimulatorFlags.LoadingOrProcessing; // (0001 | 0100) === 0101
**
** if ((flags & flags.CarOnTrack) === SimulatorFlags.CarOnTrack) {...}
*/
var SimulatorFlags;
(function (SimulatorFlags) {
    /*
    None = 0,
    Friendly = 1 << 0, // 0001 -- the bitshift is unnecessary, but done for consistency
    Mean = 1 << 1,     // 0010
    Funny = 1 << 2,    // 0100
    Boring = 1 << 3,   // 1000
    All = ~(~0 << 4)   // 1111
    */
    SimulatorFlags[SimulatorFlags["None"] = 0] = "None";
    /// <summary>
    /// The car is on the track or paddock, with data available.
    /// </summary>  
    SimulatorFlags[SimulatorFlags["CarOnTrack"] = 1] = "CarOnTrack";
    /// <summary>
    /// The game's simulation is paused. 
    /// Note: The simulation will not be paused while in the pause menu in online modes.
    /// </summary>
    SimulatorFlags[SimulatorFlags["Paused"] = 2] = "Paused";
    /// <summary>
    /// Track or car is currently being loaded onto the track.
    /// </summary>
    SimulatorFlags[SimulatorFlags["LoadingOrProcessing"] = 4] = "LoadingOrProcessing";
    /// <summary>
    /// Needs more investigation
    /// </summary>
    SimulatorFlags[SimulatorFlags["InGear"] = 8] = "InGear";
    /// <summary>
    /// Current car has a Turbo.
    /// </summary>
    SimulatorFlags[SimulatorFlags["HasTurbo"] = 16] = "HasTurbo";
    /// <summary>
    /// Rev Limiting is active.
    /// </summary>
    SimulatorFlags[SimulatorFlags["RevLimiterBlinkAlertActive"] = 32] = "RevLimiterBlinkAlertActive";
    /// <summary>
    /// Hand Brake is active.
    /// </summary>
    SimulatorFlags[SimulatorFlags["HandBrakeActive"] = 64] = "HandBrakeActive";
    /// <summary>
    /// Lights are active.
    /// </summary>
    SimulatorFlags[SimulatorFlags["LightsActive"] = 128] = "LightsActive";
    /// <summary>
    /// High Beams are turned on.
    /// </summary>
    SimulatorFlags[SimulatorFlags["HighBeamActive"] = 256] = "HighBeamActive";
    /// <summary>
    /// Low Beams are turned on.
    /// </summary>
    SimulatorFlags[SimulatorFlags["LowBeamActive"] = 512] = "LowBeamActive";
    /// <summary>
    /// Active Stability Control (ASM) is active.
    /// </summary>
    SimulatorFlags[SimulatorFlags["ASMActive"] = 1024] = "ASMActive";
    /// <summary>
    /// Traction Control System (TCS) is active.
    /// </summary>
    SimulatorFlags[SimulatorFlags["TCSActive"] = 2048] = "TCSActive";
})(SimulatorFlags || (exports.SimulatorFlags = SimulatorFlags = {}));
const wheel = new binary_parser_1.Parser()
    .floatle("FrontLeft")
    .floatle("FrontRight")
    .floatle("RearLeft")
    .floatle("RearRight");
const vector3 = new binary_parser_1.Parser().floatle("x").floatle("y").floatle("z");
const vector3rotation = new binary_parser_1.Parser()
    .floatle("pitch")
    .floatle("yaw")
    .floatle("roll");
exports.gt7parser = new binary_parser_1.Parser()
    .endianness("little")
    .int32le("magic", { assert: 0x47375330 })
    .nest("position", { type: vector3 })
    .nest("velocity", { type: vector3 })
    .nest("rotation", { type: vector3rotation })
    .floatle("relativeOrientationToNorth")
    .nest("angularVelocity", { type: vector3 })
    .floatle("bodyHeight")
    .floatle("engineRPM")
    .skip(4)
    .floatle("gasLevel")
    .floatle("gasCapacity")
    .floatle("metersPerSecond")
    .floatle("turboBoost")
    .floatle("oilPressure")
    .floatle("waterTemperature")
    .floatle("oilTemperature")
    .nest("tireSurfaceTemperature", { type: wheel })
    .int32le("packetId")
    .int16le("lapCount")
    .int16le("lapsInRace")
    .int32le("bestLapTime") // 0x74
    .int32le("lastLapTime") // 0x
    .int32le("timeOfDayProgression")
    .int16le("preRaceStartPositionOrQualiPos")
    .int16le("numCarsAtPreRace")
    .int16le("minAlertRPM")
    .int16le("maxAlertRPM")
    .int16le("calculatedMaxSpeed")
    .int16le("flags")
    .bit4("currentGear")
    .bit4("suggestedGear")
    .uint8("throttle")
    .uint8("brake")
    .skip(1)
    .nest("roadPlane", { type: vector3 })
    .floatle("roadPlaneDistance")
    .nest("wheelRevPerSecond", { type: wheel })
    .nest("tireTireRadius", { type: wheel })
    .nest("tireSusHeight", { type: wheel })
    .skip(32)
    .floatle("clutchPedal")
    .floatle("clutchEngagement")
    .floatle("rpmFromClutchToGearbox")
    .floatle("transmissionTopSpeed")
    .array("gearRatios", { type: "floatle", length: 8 })
    .int32le("carCode");
function getMockData() {
    timeOfDayProgression += 17; // setInterval ms
    return {
        // ws info
        connections: 0,
        recording: false,
        carName: "McLaren F1 GTR Race Car '97",
        // sip
        packetId: packetId++,
        position: { x: 0.1, y: 0.2, z: 0.3 },
        velocity: { x: 0.1, y: 0.2, z: 0.3 },
        rotation: { pitch: 0.1, yaw: 0.2, roll: 0.2 },
        relativeOrientationToNorth: 0.75,
        angularVelocity: { x: 0.1, y: 0.2, z: 0.3 },
        bodyHeight: 22,
        engineRPM: getRandomInt(9000),
        gasLevel: 60,
        gasCapacity: 60,
        metersPerSecond: getRandomInt(80),
        distance: 0,
        turboBoost: 0,
        oilPressure: 8,
        waterTemperature: 85,
        oilTemperature: 110,
        tireSurfaceTemperature: {
            FrontLeft: 58.25,
            FrontRight: 58.25,
            RearLeft: 58.25,
            RearRight: 58.25,
        },
        lapCount: 1,
        lapsInRace: 3,
        currentLapTime: 31550,
        currentLapTime2: 31551,
        lastLapTime: 47400,
        bestLapTime: 47300,
        timeOfDayProgression: timeOfDayProgression,
        preRaceStartPositionOrQualiPos: 3,
        numCarsAtPreRace: 16,
        minAlertRPM: 8000,
        maxAlertRPM: 9000,
        calculatedMaxSpeed: 257,
        flags: SimulatorFlags.CarOnTrack | SimulatorFlags.ASMActive,
        currentGear: 4,
        suggestedGear: 2,
        throttle: getRandomInt(255),
        brake: getRandomInt(255),
        roadPlane: { x: 0, y: 0, z: 0 },
        roadPlaneDistance: 123,
        wheelRevPerSecond: { FrontLeft: 0.1, FrontRight: 0.2, RearLeft: 0.3, RearRight: 0.4 },
        tireTireRadius: { FrontLeft: 0.1, FrontRight: 0.2, RearLeft: 0.3, RearRight: 0.4 },
        tireSusHeight: { FrontLeft: 0.1, FrontRight: 0.2, RearLeft: 0.3, RearRight: 0.4 },
        clutchPedal: 0,
        clutchEngagement: 0,
        rpmFromClutchToGearbox: 1234,
        transmissionTopSpeed: 273,
        gearRatios: [{ ratio: 0 }],
        carCode: 216,
    };
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//# sourceMappingURL=parser.js.map