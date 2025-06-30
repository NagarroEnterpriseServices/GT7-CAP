import * as cds from '@sap/cds'
import { Service, log } from '@sap/cds'
import WebSocket from 'ws'
import LapCounter from './lib/utils/lapcounter'
import { logSession, updateSession, logSimulatorInterfacePacket, getCarName } from './lib/SqliteExporter'
import { SimulatorFlags } from './lib/utils/parser'


if (cds.env.profiles.includes('plc')) {
const LOG = log('plc-service')

module.exports = class PLCService extends Service {
    lapCounter = new LapCounter()
    recording = false
    sessionId: string| null = null
    driver: string | null = null
    lastLap = -1
    distance = 0
    lapStartTimeOfDayProgression!: number
    raceStartTimeOfDayProgression!: number

    async init() {
        const ws = new WebSocket('ws://192.168.1.10:1880/ws/plc');
        const wsSrv = await cds.connect.to('WebSocketService')

        this.on("driverAssigned", async (msg) => {
            this.driver = msg.data.driver
            LOG.info("Driver assigned: ", this.driver)
        });

        ws.on('open', () => {
            LOG.info('Connected to WebSocket server');
            ws.send(JSON.stringify({ type: 'subscribe', channel: 'updates' }));
        });
    
        ws.on('message', (data) => {
            const jsonString = data.toString(); // Convert Buffer to UTF-8 string
            try {
                const json = JSON.parse(jsonString); // Parse JSON
                this.onMessage(json, wsSrv)
            } catch (err) {
                LOG.error('Invalid JSON received:', err);
            }
        });
    
        ws.on('error', (err) => {
            LOG.error('WebSocket error:', err);
        });
    
        ws.on('close', (code, reason) => {
            LOG.warn(`WebSocket closed: ${code} - ${reason}`);
        });


        return super.init()
    }


    async onMessage(message: any, wsSrv: cds.Service) {

            // record if is in race (lapsInRace > 0) and if not in post-race (lapCount <= lapsInRace) and not in replay 
            if (message.lapsInRace > 0 && message.lapCount <= message.lapsInRace && message.lapCount > 0) {
                this.recording = true
            } else {
                this.recording = false
            }
    
            // start new session
            if (this.recording && !this.sessionId) {
                this.sessionId = cds.utils.uuid()
                LOG.info('new session', this.sessionId)
                this.distance = 0
                this.raceStartTimeOfDayProgression = message.timeOfDayProgression
                logSession(this.sessionId, message, this.driver).catch((reason: any) => {
                    LOG.error("Error logging session: ", reason);
                });            
            }
    
            // reset counter
            if (this.lastLap !== message.lapCount) {
                this.lastLap = message.lapCount
                this.lapStartTimeOfDayProgression = message.timeOfDayProgression
                this.distance = 0
            }
    
            // calculate currentLapTime from sip
            this.lapCounter.update(
                message.lapCount,
                (message.flags & SimulatorFlags.Paused) === SimulatorFlags.Paused,
                message.packetId,
                message.lastLapTime
            )
            message.currentLapTime = message.timeOfDayProgression - this.lapStartTimeOfDayProgression
            message.raceTime = message.timeOfDayProgression - this.raceStartTimeOfDayProgression
    
            // calculate distance ontrack
            if (((message.flags & SimulatorFlags.Paused) !== SimulatorFlags.Paused) && this.recording) {
                message.distance = this.distance += message.metersPerSecond * 0.01667
            }
    
            // logging of packet
            if(this.recording && this.sessionId) {
                if ((message.flags & SimulatorFlags.CarOnTrack) === SimulatorFlags.CarOnTrack) {
                    if ((message.flags & SimulatorFlags.LoadingOrProcessing) !== SimulatorFlags.LoadingOrProcessing) {
                        if ((message.flags & SimulatorFlags.Paused) !== SimulatorFlags.Paused) {
                            await logSimulatorInterfacePacket(this.sessionId, message)
                        }
                    }
                }
            }
    
    
            // session end handling
            if (!this.recording && this.sessionId) {
                wsSrv.emit("STOPRECORDING") // let the racedash know that the race is finished and resets the driver
                LOG.info('stop recording')
                if (message.lapCount > message.lapsInRace) {
                    LOG.info('driver finished: ' + this.driver)
                    await updateSession(this.sessionId, this.driver, true, message)
                    LOG.info('session finished')
                } else {
                    LOG.info('driver did not finish: ' + this.driver)
                    await updateSession(this.sessionId, this.driver, false, message)
                }
                this.driver = null
                this.sessionId = null
            }
    
            // send message to websocket service
            wsSrv.emit("SIPGT7", message)
        }
      
}

}