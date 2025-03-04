// This is an automatically generated file. Please do not change its contents manually!
import * as __ from './../_';
import * as _ from './..';
// enum
const SessionMetric_measure = {
  metersPerSecond: 1,
  brake: 2,
  throttle: 3,
  gear: 4,
} as const;
type SessionMetric_measure = 1 | 2 | 3 | 4

export function _Vector3Aspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Vector3 extends Base {
        x?: number | null;
        y?: number | null;
        z?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Vector3 extends _Vector3Aspect(__.Entity) {}
Object.defineProperty(Vector3, 'name', { value: 'gt7.Vector3' })
Object.defineProperty(Vector3, 'is_singular', { value: true })

export function _Vector3RotationAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Vector3Rotation extends Base {
        pitch?: number | null;
        yaw?: number | null;
        roll?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Vector3Rotation extends _Vector3RotationAspect(__.Entity) {}
Object.defineProperty(Vector3Rotation, 'name', { value: 'gt7.Vector3Rotation' })
Object.defineProperty(Vector3Rotation, 'is_singular', { value: true })

export function _WheelAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Wheel extends Base {
        fl?: number | null;
        fr?: number | null;
        rl?: number | null;
        rr?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Wheel extends _WheelAspect(__.Entity) {}
Object.defineProperty(Wheel, 'name', { value: 'gt7.Wheel' })
Object.defineProperty(Wheel, 'is_singular', { value: true })

export function _SessionAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Session extends Base {
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
      static readonly actions: Record<never, never>
  };
}
export class Session extends _._cuidAspect(_SessionAspect(__.Entity)) {}
Object.defineProperty(Session, 'name', { value: 'gt7.Sessions' })
Object.defineProperty(Session, 'is_singular', { value: true })
export class Sessions extends Array<Session> {$count?: number}
Object.defineProperty(Sessions, 'name', { value: 'gt7.Sessions' })

export function _LapAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Lap extends Base {
        session_ID?: __.DeepRequired<Session>['ID'];
        lap?: number;
        time?: number | null;
        maxSpeed?: number | null;
        avgSpeed?: number | null;
        best?: boolean | null;
      static readonly actions: Record<never, never>
  };
}
export class Lap extends _LapAspect(__.Entity) {}
Object.defineProperty(Lap, 'name', { value: 'gt7.Laps' })
Object.defineProperty(Lap, 'is_singular', { value: true })
export class Laps extends Array<Lap> {$count?: number}
Object.defineProperty(Laps, 'name', { value: 'gt7.Laps' })

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
Object.defineProperty(SessionMetric, 'name', { value: 'gt7.SessionMetrics' })
Object.defineProperty(SessionMetric, 'is_singular', { value: true })
export class SessionMetrics extends Array<SessionMetric> {$count?: number}
Object.defineProperty(SessionMetrics, 'name', { value: 'gt7.SessionMetrics' })

export function _SimulatorInterfacePacketAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class SimulatorInterfacePacket extends Base {
        session?: __.Association.to<Session>;
        session_ID?: string;
        packetId?: number;
        car?: __.Association.to<Car> | null;
        car_ID?: number | null;
        position?: Vector3 | null;
        velocity?: Vector3 | null;
        rotation?: Vector3Rotation | null;
        relativeOrientationToNorth?: number | null;
        angularVelocity?: Vector3 | null;
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
        roadPlane?: Vector3 | null;
        roadPlaneDistance?: number | null;
        tireRadius?: Wheel | null;
        tireSuspensionHeight?: Wheel | null;
        tireSurfaceTemperature?: Wheel | null;
        wheelRevPerSecond?: Wheel | null;
        clutchPedal?: number | null;
        clutchEngagement?: number | null;
        rpmFromClutchToGearbox?: number | null;
        transmissionTopSpeed?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class SimulatorInterfacePacket extends _SimulatorInterfacePacketAspect(__.Entity) {}
Object.defineProperty(SimulatorInterfacePacket, 'name', { value: 'gt7.SimulatorInterfacePackets' })
Object.defineProperty(SimulatorInterfacePacket, 'is_singular', { value: true })
export class SimulatorInterfacePackets extends Array<SimulatorInterfacePacket> {$count?: number}
Object.defineProperty(SimulatorInterfacePackets, 'name', { value: 'gt7.SimulatorInterfacePackets' })

export function _CarAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Car extends Base {
        ID?: number | null;
        name?: string | null;
        maker?: __.Association.to<Maker> | null;
        maker_ID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Car extends _CarAspect(__.Entity) {}
Object.defineProperty(Car, 'name', { value: 'gt7.Cars' })
Object.defineProperty(Car, 'is_singular', { value: true })
export class Cars extends Array<Car> {$count?: number}
Object.defineProperty(Cars, 'name', { value: 'gt7.Cars' })

export function _CarGroupAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class CarGroup extends Base {
        ID?: number;
        group?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class CarGroup extends _CarGroupAspect(__.Entity) {}
Object.defineProperty(CarGroup, 'name', { value: 'gt7.CarGroups' })
Object.defineProperty(CarGroup, 'is_singular', { value: true })
export class CarGroups extends Array<CarGroup> {$count?: number}
Object.defineProperty(CarGroups, 'name', { value: 'gt7.CarGroups' })

export function _CountryAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Country extends Base {
        ID?: number | null;
        name?: string | null;
        code?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class Country extends _CountryAspect(__.Entity) {}
Object.defineProperty(Country, 'name', { value: 'gt7.Countries' })
Object.defineProperty(Country, 'is_singular', { value: true })
export class Countries extends Array<Country> {$count?: number}
Object.defineProperty(Countries, 'name', { value: 'gt7.Countries' })

export function _CourseBasAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class CourseBas extends Base {
        ID?: number | null;
        name?: string | null;
        logoName?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class CourseBas extends _CourseBasAspect(__.Entity) {}
Object.defineProperty(CourseBas, 'name', { value: 'gt7.CourseBases' })
Object.defineProperty(CourseBas, 'is_singular', { value: true })
export class CourseBases extends Array<CourseBas> {$count?: number}
Object.defineProperty(CourseBases, 'name', { value: 'gt7.CourseBases' })

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
Object.defineProperty(Cours, 'name', { value: 'gt7.Courses' })
Object.defineProperty(Cours, 'is_singular', { value: true })
export class Courses extends Array<Cours> {$count?: number}
Object.defineProperty(Courses, 'name', { value: 'gt7.Courses' })

export function _EngineSwapAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class EngineSwap extends Base {
        newCar?: number | null;
        originalCar?: number | null;
        engineName?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class EngineSwap extends _EngineSwapAspect(__.Entity) {}
Object.defineProperty(EngineSwap, 'name', { value: 'gt7.EngineSwaps' })
Object.defineProperty(EngineSwap, 'is_singular', { value: true })
export class EngineSwaps extends Array<EngineSwap> {$count?: number}
Object.defineProperty(EngineSwaps, 'name', { value: 'gt7.EngineSwaps' })

export function _LotteryCarAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class LotteryCar extends Base {
        category?: string | null;
        carID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class LotteryCar extends _LotteryCarAspect(__.Entity) {}
Object.defineProperty(LotteryCar, 'name', { value: 'gt7.LotteryCars' })
Object.defineProperty(LotteryCar, 'is_singular', { value: true })
export class LotteryCars extends Array<LotteryCar> {$count?: number}
Object.defineProperty(LotteryCars, 'name', { value: 'gt7.LotteryCars' })

export function _MakerAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Maker extends Base {
        ID?: number | null;
        name?: string | null;
        country?: __.Association.to<Country> | null;
        country_ID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Maker extends _MakerAspect(__.Entity) {}
Object.defineProperty(Maker, 'name', { value: 'gt7.Makers' })
Object.defineProperty(Maker, 'is_singular', { value: true })
export class Makers extends Array<Maker> {$count?: number}
Object.defineProperty(Makers, 'name', { value: 'gt7.Makers' })

export function _StockPerformanceAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class StockPerformance extends Base {
        ID?: number;
        pp?: number;
        tyre?: string;
      static readonly actions: Record<never, never>
  };
}
export class StockPerformance extends _StockPerformanceAspect(__.Entity) {}
Object.defineProperty(StockPerformance, 'name', { value: 'gt7.StockPerformances' })
Object.defineProperty(StockPerformance, 'is_singular', { value: true })
export class StockPerformances extends Array<StockPerformance> {$count?: number}
Object.defineProperty(StockPerformances, 'name', { value: 'gt7.StockPerformances' })

export function _TrophyAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Trophy extends Base {
        name?: string | null;
        car?: __.Association.to<Car> | null;
        car_ID?: number | null;
      static readonly actions: Record<never, never>
  };
}
export class Trophy extends _TrophyAspect(__.Entity) {}
Object.defineProperty(Trophy, 'name', { value: 'gt7.Trophies' })
Object.defineProperty(Trophy, 'is_singular', { value: true })
export class Trophies extends Array<Trophy> {$count?: number}
Object.defineProperty(Trophies, 'name', { value: 'gt7.Trophies' })
