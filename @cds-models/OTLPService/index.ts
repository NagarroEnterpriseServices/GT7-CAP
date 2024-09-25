// This is an automatically generated file. Please do not change its contents manually!
import * as __ from './../_';
export default { name: 'OTLPService' }
export function _SIPGT7Aspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class SIPGT7 extends Base {
        session_ID?: string | null;
        packetId?: number | null;
        car_ID?: number | null;
        position_x?: number | null;
        position_y?: number | null;
        position_z?: number | null;
        velocity_x?: number | null;
        velocity_y?: number | null;
        velocity_z?: number | null;
        rotation_pitch?: number | null;
        rotation_yaw?: number | null;
        rotation_roll?: number | null;
        relativeOrientationToNorth?: number | null;
        angularVelocity_x?: number | null;
        angularVelocity_y?: number | null;
        angularVelocity_z?: number | null;
        bodyHeight?: number | null;
        engineRPM?: number | null;
        gasLevel?: number | null;
        gasCapacity?: number | null;
        metersPerSecond?: number | null;
        distance?: number | null;
        turboBoost?: number | null;
        oilPressure?: number | null;
        waterTemperature?: number | null;
        oilTemperature?: number | null;
        lapCount?: number | null;
        lapsInRace?: number | null;
        currentLapTime?: number | null;
        currentLapTime2?: number | null;
        bestLapTime?: number | null;
        lastLapTime?: number | null;
        timeOfDayProgression?: number | null;
        preRaceStartPositionOrQualiPos?: number | null;
        numCarsAtPreRace?: number | null;
        minAlertRPM?: number | null;
        maxAlertRPM?: number | null;
        calculatedMaxSpeed?: number | null;
        flags?: number | null;
        currentGear?: number | null;
        suggestedGear?: number | null;
        throttle?: number | null;
        brake?: number | null;
        roadPlane_x?: number | null;
        roadPlane_y?: number | null;
        roadPlane_z?: number | null;
        roadPlaneDistance?: number | null;
        tireRadius_fl?: number | null;
        tireRadius_fr?: number | null;
        tireRadius_rl?: number | null;
        tireRadius_rr?: number | null;
        tireSuspensionHeight_fl?: number | null;
        tireSuspensionHeight_fr?: number | null;
        tireSuspensionHeight_rl?: number | null;
        tireSuspensionHeight_rr?: number | null;
        tireSurfaceTemperature_fl?: number | null;
        tireSurfaceTemperature_fr?: number | null;
        tireSurfaceTemperature_rl?: number | null;
        tireSurfaceTemperature_rr?: number | null;
        wheelRevPerSecond_fl?: number | null;
        wheelRevPerSecond_fr?: number | null;
        wheelRevPerSecond_rl?: number | null;
        wheelRevPerSecond_rr?: number | null;
        clutchPedal?: number | null;
        clutchEngagement?: number | null;
        rpmFromClutchToGearbox?: number | null;
        transmissionTopSpeed?: number | null;
        carCode?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class SIPGT7 extends _SIPGT7Aspect(__.Entity) {}
Object.defineProperty(SIPGT7, 'name', { value: 'OTLPService.SIPGT7' })
Object.defineProperty(SIPGT7, 'is_singular', { value: true })

// event
export declare class packet {
    session_ID: string | null;
    packetId: number | null;
    car_ID: number | null;
    position_x: number | null;
    position_y: number | null;
    position_z: number | null;
    velocity_x: number | null;
    velocity_y: number | null;
    velocity_z: number | null;
    rotation_pitch: number | null;
    rotation_yaw: number | null;
    rotation_roll: number | null;
    relativeOrientationToNorth: number | null;
    angularVelocity_x: number | null;
    angularVelocity_y: number | null;
    angularVelocity_z: number | null;
    bodyHeight: number | null;
    engineRPM: number | null;
    gasLevel: number | null;
    gasCapacity: number | null;
    metersPerSecond: number | null;
    distance: number | null;
    turboBoost: number | null;
    oilPressure: number | null;
    waterTemperature: number | null;
    oilTemperature: number | null;
    lapCount: number | null;
    lapsInRace: number | null;
    currentLapTime: number | null;
    currentLapTime2: number | null;
    bestLapTime: number | null;
    lastLapTime: number | null;
    timeOfDayProgression: number | null;
    preRaceStartPositionOrQualiPos: number | null;
    numCarsAtPreRace: number | null;
    minAlertRPM: number | null;
    maxAlertRPM: number | null;
    calculatedMaxSpeed: number | null;
    flags: number | null;
    currentGear: number | null;
    suggestedGear: number | null;
    throttle: number | null;
    brake: number | null;
    roadPlane_x: number | null;
    roadPlane_y: number | null;
    roadPlane_z: number | null;
    roadPlaneDistance: number | null;
    tireRadius_fl: number | null;
    tireRadius_fr: number | null;
    tireRadius_rl: number | null;
    tireRadius_rr: number | null;
    tireSuspensionHeight_fl: number | null;
    tireSuspensionHeight_fr: number | null;
    tireSuspensionHeight_rl: number | null;
    tireSuspensionHeight_rr: number | null;
    tireSurfaceTemperature_fl: number | null;
    tireSurfaceTemperature_fr: number | null;
    tireSurfaceTemperature_rl: number | null;
    tireSurfaceTemperature_rr: number | null;
    wheelRevPerSecond_fl: number | null;
    wheelRevPerSecond_fr: number | null;
    wheelRevPerSecond_rl: number | null;
    wheelRevPerSecond_rr: number | null;
    clutchPedal: number | null;
    clutchEngagement: number | null;
    rpmFromClutchToGearbox: number | null;
    transmissionTopSpeed: number | null;
    carCode: number | null;
}
// event
export declare class recording {
    recording: boolean | null;
}