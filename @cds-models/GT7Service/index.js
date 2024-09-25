// This is an automatically generated file. Please do not change its contents manually!
const cds = require('@sap/cds')
const csn = cds.entities('GT7Service')
module.exports = { name: 'GT7Service' }
module.exports.Session = { is_singular: true, __proto__: csn.Sessions }
module.exports.Sessions = { is_singular: true, __proto__: csn.Sessions }
module.exports.SessionMetric = { is_singular: true, __proto__: csn.SessionMetrics }
module.exports.SessionMetrics = { is_singular: true, __proto__: csn.SessionMetrics }
module.exports.Lap = { is_singular: true, __proto__: csn.Laps }
module.exports.Laps = { is_singular: true, __proto__: csn.Laps }
module.exports.SimulatorInterfacePacket = { is_singular: true, __proto__: csn.SimulatorInterfacePackets }
module.exports.SimulatorInterfacePackets = { is_singular: true, __proto__: csn.SimulatorInterfacePackets }
module.exports.Car = { is_singular: true, __proto__: csn.Cars }
module.exports.Cars = { is_singular: true, __proto__: csn.Cars }
module.exports.CarGroup = { is_singular: true, __proto__: csn.CarGroups }
module.exports.CarGroups = { is_singular: true, __proto__: csn.CarGroups }
module.exports.Country = { is_singular: true, __proto__: csn.Countries }
module.exports.Countries = { is_singular: true, __proto__: csn.Countries }
module.exports.CourseBas = { is_singular: true, __proto__: csn.CourseBases }
module.exports.CourseBases = { is_singular: true, __proto__: csn.CourseBases }
module.exports.Cours = { is_singular: true, __proto__: csn.Courses }
module.exports.Courses = { is_singular: true, __proto__: csn.Courses }
module.exports.EngineSwap = { is_singular: true, __proto__: csn.EngineSwaps }
module.exports.EngineSwaps = { is_singular: true, __proto__: csn.EngineSwaps }
module.exports.LotteryCar = { is_singular: true, __proto__: csn.LotteryCars }
module.exports.LotteryCars = { is_singular: true, __proto__: csn.LotteryCars }
module.exports.Maker = { is_singular: true, __proto__: csn.Makers }
module.exports.Makers = { is_singular: true, __proto__: csn.Makers }
module.exports.StockPerformance = { is_singular: true, __proto__: csn.StockPerformances }
module.exports.StockPerformances = { is_singular: true, __proto__: csn.StockPerformances }
module.exports.Trophy = { is_singular: true, __proto__: csn.Trophies }
module.exports.Trophies = { is_singular: true, __proto__: csn.Trophies }
// events
// actions
// enums
module.exports.SessionMetric.measure ??= { metersPerSecond: 1, brake: 2, throttle: 3, gear: 4 }
