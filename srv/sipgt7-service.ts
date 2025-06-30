import * as cds from '@sap/cds'
import { Service, log } from '@sap/cds'
import { Socket, createSocket, RemoteInfo } from 'node:dgram'
import { decrypt } from './lib/utils/decoder'
import LapCounter from './lib/utils/lapcounter'
import { SimulatorFlags, SimulatorInterfacePacket, getMockData, gt7parser } from './lib/utils/parser'
import { logSession, updateSession, logSimulatorInterfacePacket, getCarName } from './lib/SqliteExporter'


if (!cds.env.profiles.includes('plc')) {

const LOG = log('sipgt7-service')

const bindPort: number =    process.env.GT_VERSION == 'GTS' ? 33340 :
                            process.env.GT_VERSION == 'GT7' ? 33740 : 33340;
const receivePort: number = process.env.GT_VERSION == 'GTS' ? 33339 :
                            process.env.GT_VERSION == 'GT7' ? 33739 : 33339;
const psIp: string = process.env.PLAYSTATION_IP

module.exports = class SIPGT7Service extends Service {
    socket: Socket
    lapCounter = new LapCounter()
    isUdpSocketReady = false
    recording = false
    sessionId: string = null
    packetCount = 0
    lastLapRecorded = false
    driver: string = null
    lastLap = -1
    distance = 0
    startTimeOfDayProgression: number

    async init() {
        const socket = this.socket = createSocket('udp4')
        const { SimulatorInterfacePackets } = require('#cds-models/gt7')

        // cross service dependencies
        const wsSrv = await cds.connect.to('WebSocketService')

        this.on("driverAssigned", async (msg) => {
            this.driver = msg.data.driver
        })

        socket.on('message', (data: Buffer, rinfo: RemoteInfo) => {
            if (data.length === 0x128) {
                const packet: Buffer = decrypt(data)
                const magic = packet.readInt32LE()
                // 0x30533647 = G6S0 - GT6
                // 0x47375330 = 0S7G - GTSport/GT7
                if (magic != 0x47375330) { // GT6 should also work!
                    // 0S7G - G7S0
                    LOG._error && LOG.error('on packet:', "Magic error!", magic)
                } else {
                    const message = gt7parser.parse(packet) as SimulatorInterfacePacket
                    this.onMessage(message, wsSrv)
                }
            }
        })

        socket.on('listening', () => {
            const address = this.socket.address()
            this.isUdpSocketReady = true
            LOG._info && LOG.info(`SIP ${process.env.GT_VERSION} server listening on UDP ${address.address}:${address.port} for IP ${psIp}`)
            this.sendHeartbeat()
        })

        socket.on('error', (err) => {
            LOG._error && LOG.error(`server error:\n${err.stack}`)
            socket.close()
        })
        socket.bind(bindPort)
        return super.init()
    }

    sendHeartbeat() {
        if (!this.isUdpSocketReady) return
        this.socket.send(Buffer.from("A"), 0, 1, receivePort, psIp, (err) => {
            if (err) {
                this.socket.close()
                return
            }
        })
    }

    async onMessage(message: any, wsSrv: cds.Service) {
        //send packet to PS5
        if (this.packetCount++ >= 200) {
            this.sendHeartbeat()
            this.packetCount = 0
        }

        // record if is in race (lapsInRace > 0) and if not in post-race (lapCount <= lapsInRace) and not in replay 
        if (message.lapsInRace > 0 && message.lapCount <= message.lapsInRace && message.lapCount > 0) {
            this.recording = true
        } else {
            this.recording = false
        }

        // start new session
        if (this.recording && !this.sessionId) {
            this.sessionId = cds.utils.uuid()
            console.log('new session', this.sessionId)
            this.distance = 0
            logSession(this.sessionId, message, this.driver).catch((reason: any) => {
                console.error("Error logging session: ", reason);
            });            
        }

        // reset counter
        if (this.lastLap !== message.lapCount) {
            this.lastLap = message.lapCount
            this.startTimeOfDayProgression = message.timeOfDayProgression
            this.distance = 0
        }

        // update lap infos
        this.lapCounter.update(
            message.lapCount,
            (message.flags & SimulatorFlags.Paused) === SimulatorFlags.Paused,
            message.packetId,
            message.lastLapTime
        )
        
        // update lap time
        message.currentLapTime = message.timeOfDayProgression - this.startTimeOfDayProgression
        
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
                await updateSession(this.sessionId, this.driver, true, message)
                LOG.info('session finished')
            }
            this.driver = null
            this.sessionId = null
        }


        // send message to websocket service
        wsSrv.emit("SIPGT7", message)
    }
}

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