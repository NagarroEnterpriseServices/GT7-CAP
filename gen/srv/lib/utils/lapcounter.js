"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://www.gtplanet.net/forum/threads/gt7-is-compatible-with-motion-rig.410728/page-10
class LapCounter {
    constructor() {
        this.lap = -1;
        this.paused = false;
        this.tick = 0; // packetId
        this.pStartTick = 0;
        this.lStartTick = 0;
        this.lStartMS = 0;
        this.pausedTicks = 0;
        this.lastLapMS = 0;
        this.specialPacketTime = 0;
    }
    getLapTime() {
        let lapTime = (this.getLapTicks() * 1. / 60.) - (this.specialPacketTime / 1000.);
        //return Math.round(lapTime * 1000) / 1000; // 1000 = 3 digits, 100 = 2 Digits, etc.
        return Math.round(lapTime * 1000);
    }
    update(lap, paused, tick, lastLapMS) {
        if (lap === 0) {
            // we have not started a lap or have reset
            this.specialPacketTime = 0;
        }
        if (lap !== this.lap) {
            // we have entered a new lap
            if (this.lap !== 0) {
                // ??? normal_laptime = this.getLapTicks() * 1000.0 / 60.0
                this.specialPacketTime += lastLapMS - this.getLapTicks() * 1000.0 / 60.0;
            }
            this.lStartTick = this.tick;
            this.pausedTicks = 0;
        }
        if (paused != this.paused) {
            // paused has changed
            if (paused) {
                // we have switched to paused
                this.pStartTick = this.tick;
            }
            else {
                // we have switched to not paused
                this.pausedTicks += tick - this.pStartTick;
            }
        }
        this.paused = paused;
        this.lap = lap;
        this.tick = tick;
        this.lastLapMS = lastLapMS;
    }
    getPausedTicks() {
        if (this.paused) {
            return this.pausedTicks + (this.tick - this.pStartTick);
        }
        else {
            return this.pausedTicks;
        }
    }
    getLapTicks() {
        if (this.lap === 0)
            return 0;
        else
            return this.tick - this.lStartTick - this.getPausedTicks();
    }
}
exports.default = LapCounter;
//# sourceMappingURL=lapcounter.js.map