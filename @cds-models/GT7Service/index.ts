// This is an automatically generated file. Please do not change its contents manually!
import * as __ from './../_';
import * as _ from './..';
import * as _gt7 from './../gt7';
export default { name: 'GT7Service' }
// enum
const SessionMetric_measure = {
  metersPerSecond: 1,
  brake: 2,
  throttle: 3,
  gear: 4,
} as const;
type SessionMetric_measure = 1 | 2 | 3 | 4

/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export function _SessionAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Session extends Base {
        ID?: string;
        createdAt?: __.CdsTimestamp | null;
        driver?: string | null;
        car?: __.Association.to<Car> | null;
        car_ID?: number | null;
        lapsInRace?: number | null;
        bestLap?: number | null;
        bestLapTime?: number | null;
        finished?: boolean | null;
        timeOfDay?: number | null;
        calculatedMaxSpeed?: number | null;
        bodyHeight?: number | null;
        trackUrl?: string | null;
        Laps?: __.Association.to.many<Laps>;
        Packets?: __.Composition.of.many<SimulatorInterfacePackets>;
        Measures?: __.Composition.of.many<SessionMetrics>;
        Speed?: __.Composition.of.many<SessionMetrics>;
        Brake?: __.Composition.of.many<SessionMetrics>;
        Throttle?: __.Composition.of.many<SessionMetrics>;
        Gear?: __.Composition.of.many<SessionMetrics>;
      static readonly actions: {
        assignDriver: { (sessionID: string | null, driver: string | null): boolean, __parameters: {sessionID: string | null, driver: string | null}, __returns: boolean, kind: 'action'}
        generateFioriMetrics: { (): boolean, __parameters: Record<never, never>, __returns: boolean, kind: 'function'}
        getLapTimes: { (): Array<_.LapTime>, __parameters: Record<never, never>, __returns: Array<_.LapTime>, kind: 'function'}
        getCompareLaps: { (): Array<_.LapTime>, __parameters: Record<never, never>, __returns: Array<_.LapTime>, kind: 'function'}
        getLapSVG: { (): string, __parameters: Record<never, never>, __returns: string, kind: 'function'}
      }
  };
}
export class Session extends _._cuidAspect(_SessionAspect(__.Entity)) {}
Object.defineProperty(Session, 'name', { value: 'GT7Service.Sessions' })
Object.defineProperty(Session, 'is_singular', { value: true })
export class Sessions extends Array<Session> {$count?: number}
Object.defineProperty(Sessions, 'name', { value: 'GT7Service.Sessions' })

export function _SessionMetricAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class SessionMetric extends Base {
        session?: __.Association.to<Session>;
        session_ID?: string;
        packetId?: number;
        measure?: SessionMetric_measure;
        value?: number | null;
        lapCount?: number | null;
        currentLapTime?: number | null;
      static measure = SessionMetric_measure
      static readonly actions: Record<never, never>
  };
}
export class SessionMetric extends _SessionMetricAspect(__.Entity) {}
Object.defineProperty(SessionMetric, 'name', { value: 'GT7Service.SessionMetrics' })
Object.defineProperty(SessionMetric, 'is_singular', { value: true })
export class SessionMetrics extends Array<SessionMetric> {$count?: number}
Object.defineProperty(SessionMetrics, 'name', { value: 'GT7Service.SessionMetrics' })

export function _LapAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Lap extends Base {
        session_ID?: __.DeepRequired<_gt7.Session>['ID'];
        lap?: number;
        time?: number | null;
        maxSpeed?: number | null;
        avgSpeed?: number | null;
        best?: boolean | null;
      static readonly actions: Record<never, never>
  };
}
export class Lap extends _LapAspect(__.Entity) {}
Object.defineProperty(Lap, 'name', { value: 'GT7Service.Laps' })
Object.defineProperty(Lap, 'is_singular', { value: true })
export class Laps extends Array<Lap> {$count?: number}
Object.defineProperty(Laps, 'name', { value: 'GT7Service.Laps' })

export function _SimulatorInterfacePacketAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class SimulatorInterfacePacket extends Base {
        session?: __.Association.to<Session>;
        session_ID?: string;
        packetId?: number;
        car?: __.Association.to<Car> | null;
        car_ID?: number | null;
        position?: _gt7.Vector3 | null;
        velocity?: _gt7.Vector3 | null;
        rotation?: _gt7.Vector3Rotation | null;
        relativeOrientationToNorth?: number | null;
        angularVelocity?: _gt7.Vector3 | null;
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
        roadPlane?: _gt7.Vector3 | null;
        roadPlaneDistance?: number | null;
        tireRadius?: _gt7.Wheel | null;
        tireSuspensionHeight?: _gt7.Wheel | null;
        tireSurfaceTemperature?: _gt7.Wheel | null;
        wheelRevPerSecond?: _gt7.Wheel | null;
        clutchPedal?: number | null;
        clutchEngagement?: number | null;
        rpmFromClutchToGearbox?: number | null;
        transmissionTopSpeed?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class SimulatorInterfacePacket extends _SimulatorInterfacePacketAspect(__.Entity) {}
Object.defineProperty(SimulatorInterfacePacket, 'name', { value: 'GT7Service.SimulatorInterfacePackets' })
Object.defineProperty(SimulatorInterfacePacket, 'is_singular', { value: true })
export class SimulatorInterfacePackets extends Array<SimulatorInterfacePacket> {$count?: number}
Object.defineProperty(SimulatorInterfacePackets, 'name', { value: 'GT7Service.SimulatorInterfacePackets' })

export function _CarAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Car extends Base {
        ID?: number;
        name?: string | null;
        maker?: __.Association.to<Maker> | null;
        maker_ID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Car extends _CarAspect(__.Entity) {}
Object.defineProperty(Car, 'name', { value: 'GT7Service.Cars' })
Object.defineProperty(Car, 'is_singular', { value: true })
export class Cars extends Array<Car> {$count?: number}
Object.defineProperty(Cars, 'name', { value: 'GT7Service.Cars' })

export function _CarGroupAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class CarGroup extends Base {
        ID?: number;
        group?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class CarGroup extends _CarGroupAspect(__.Entity) {}
Object.defineProperty(CarGroup, 'name', { value: 'GT7Service.CarGroups' })
Object.defineProperty(CarGroup, 'is_singular', { value: true })
export class CarGroups extends Array<CarGroup> {$count?: number}
Object.defineProperty(CarGroups, 'name', { value: 'GT7Service.CarGroups' })

export function _CountryAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Country extends Base {
        ID?: number;
        name?: string | null;
        code?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class Country extends _CountryAspect(__.Entity) {}
Object.defineProperty(Country, 'name', { value: 'GT7Service.Countries' })
Object.defineProperty(Country, 'is_singular', { value: true })
export class Countries extends Array<Country> {$count?: number}
Object.defineProperty(Countries, 'name', { value: 'GT7Service.Countries' })

export function _CourseBasAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class CourseBas extends Base {
        ID?: number;
        name?: string | null;
        logoName?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class CourseBas extends _CourseBasAspect(__.Entity) {}
Object.defineProperty(CourseBas, 'name', { value: 'GT7Service.CourseBases' })
Object.defineProperty(CourseBas, 'is_singular', { value: true })
export class CourseBases extends Array<CourseBas> {$count?: number}
Object.defineProperty(CourseBases, 'name', { value: 'GT7Service.CourseBases' })

export function _CoursAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Cours extends Base {
        ID?: number;
        name?: string | null;
        base?: __.Association.to<CourseBas> | null;
        base_ID?: number | null;
        country?: __.Association.to<Country> | null;
        country_ID?: number | null;
        category?: string | null;
        length?: number | null;
        longestStraight?: number | null;
        elevationDiff?: number | null;
        altitude?: number | null;
        minTimeH?: number | null;
        minTimeM?: number | null;
        minTimeS?: number | null;
        maxTimeH?: number | null;
        maxTimeM?: number | null;
        maxTimeS?: number | null;
        layoutNumber?: number | null;
        isReverse?: boolean | null;
        pitLaneDelta?: number | null;
        isOval?: boolean | null;
        numCorners?: number | null;
        noRain?: boolean | null;
      static readonly actions: Record<never, never>
  };
}
export class Cours extends _CoursAspect(__.Entity) {}
Object.defineProperty(Cours, 'name', { value: 'GT7Service.Courses' })
Object.defineProperty(Cours, 'is_singular', { value: true })
export class Courses extends Array<Cours> {$count?: number}
Object.defineProperty(Courses, 'name', { value: 'GT7Service.Courses' })

export function _EngineSwapAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class EngineSwap extends Base {
        newCar?: number | null;
        originalCar?: number | null;
        engineName?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class EngineSwap extends _EngineSwapAspect(__.Entity) {}
Object.defineProperty(EngineSwap, 'name', { value: 'GT7Service.EngineSwaps' })
Object.defineProperty(EngineSwap, 'is_singular', { value: true })
export class EngineSwaps extends Array<EngineSwap> {$count?: number}
Object.defineProperty(EngineSwaps, 'name', { value: 'GT7Service.EngineSwaps' })

export function _LotteryCarAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class LotteryCar extends Base {
        category?: string | null;
        carID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class LotteryCar extends _LotteryCarAspect(__.Entity) {}
Object.defineProperty(LotteryCar, 'name', { value: 'GT7Service.LotteryCars' })
Object.defineProperty(LotteryCar, 'is_singular', { value: true })
export class LotteryCars extends Array<LotteryCar> {$count?: number}
Object.defineProperty(LotteryCars, 'name', { value: 'GT7Service.LotteryCars' })

export function _MakerAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Maker extends Base {
        ID?: number;
        name?: string | null;
        country?: __.Association.to<Country> | null;
        country_ID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Maker extends _MakerAspect(__.Entity) {}
Object.defineProperty(Maker, 'name', { value: 'GT7Service.Makers' })
Object.defineProperty(Maker, 'is_singular', { value: true })
export class Makers extends Array<Maker> {$count?: number}
Object.defineProperty(Makers, 'name', { value: 'GT7Service.Makers' })

export function _StockPerformanceAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class StockPerformance extends Base {
        ID?: number;
        pp?: number;
        tyre?: string;
      static readonly actions: Record<never, never>
  };
}
export class StockPerformance extends _StockPerformanceAspect(__.Entity) {}
Object.defineProperty(StockPerformance, 'name', { value: 'GT7Service.StockPerformances' })
Object.defineProperty(StockPerformance, 'is_singular', { value: true })
export class StockPerformances extends Array<StockPerformance> {$count?: number}
Object.defineProperty(StockPerformances, 'name', { value: 'GT7Service.StockPerformances' })

export function _TrophyAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Trophy extends Base {
        name?: string | null;
        car?: __.Association.to<Car> | null;
        car_ID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Trophy extends _TrophyAspect(__.Entity) {}
Object.defineProperty(Trophy, 'name', { value: 'GT7Service.Trophies' })
Object.defineProperty(Trophy, 'is_singular', { value: true })
export class Trophies extends Array<Trophy> {$count?: number}
Object.defineProperty(Trophies, 'name', { value: 'GT7Service.Trophies' })

export declare const test: { (): void | null, __parameters: Record<never, never>, __returns: void | null, kind: 'action'};