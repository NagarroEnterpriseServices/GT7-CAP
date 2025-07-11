"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalLapCount = exports.gear = exports.percent = exports.rpmPercentInt = exports.rpmPercent = exports.kmh = exports.int = exports.time = void 0;
const time = (t = 0) => {
    //if (t <= 0) return `00'00:00`;
    if (t <= 0)
        return `00:00.000`;
    const ms = `${t % 1000}`.padStart(3, "0");
    const ss = `${Math.floor(t / 1000) % 60}`.padStart(2, "0");
    const mm = `${Math.floor(t / 1000 / 60)}`;
    //return `${mm}'${ss}.${ms}`;
    return `${mm}:${ss}.${ms}`;
};
exports.time = time;
const int = (f) => {
    if (f === undefined)
        return "";
    else
        return ~~f;
};
exports.int = int;
const kmh = (f) => {
    if (f === undefined)
        return "0";
    else
        return ~~(f * 3.6);
};
exports.kmh = kmh;
const rpmPercent = (f, max) => {
    if (f === undefined || max === undefined)
        return 0;
    else
        return (100 / max * f);
};
exports.rpmPercent = rpmPercent;
const rpmPercentInt = (f, max) => {
    console.log(~~(0, exports.rpmPercent)(f, max));
    if (f === undefined || max === undefined)
        return 0;
    else
        return ~~(0, exports.rpmPercent)(f, max);
};
exports.rpmPercentInt = rpmPercentInt;
const percent = (f) => {
    if (f === undefined)
        return "0";
    else
        return 100 / 255 * f;
};
exports.percent = percent;
const gear = (g) => {
    if (g === undefined || g === -1)
        return "N";
    else if (g === 0)
        return "R";
    else
        return g;
};
exports.gear = gear;
const totalLapCount = (l) => {
    if (l === undefined)
        return "";
    else if (l === 0)
        return "\u221E"; // Infinity
    else
        return l;
};
exports.totalLapCount = totalLapCount;
//# sourceMappingURL=formatter.js.map