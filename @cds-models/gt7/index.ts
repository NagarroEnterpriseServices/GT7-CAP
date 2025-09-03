// This is an automatically generated file. Please do not change its contents manually!
import * as __ from './../_';
import * as _ from './..';

export function _Vector3Aspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Vector3 extends Base {
    x?: number | null
    y?: number | null
    z?: number | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'type';
    declare static readonly keys: __.KeysOf<Vector3>;
    declare static readonly elements: __.ElementsOf<Vector3>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Vector3 extends _Vector3Aspect(__.Entity) {}
Object.defineProperty(Vector3, 'name', { value: 'gt7.Vector3' })
Object.defineProperty(Vector3, 'is_singular', { value: true })

export function _Vector3RotationAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Vector3Rotation extends Base {
    pitch?: number | null
    yaw?: number | null
    roll?: number | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'type';
    declare static readonly keys: __.KeysOf<Vector3Rotation>;
    declare static readonly elements: __.ElementsOf<Vector3Rotation>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Vector3Rotation extends _Vector3RotationAspect(__.Entity) {}
Object.defineProperty(Vector3Rotation, 'name', { value: 'gt7.Vector3Rotation' })
Object.defineProperty(Vector3Rotation, 'is_singular', { value: true })

export function _WheelAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Wheel extends Base {
    fl?: number | null
    fr?: number | null
    rl?: number | null
    rr?: number | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'type';
    declare static readonly keys: __.KeysOf<Wheel>;
    declare static readonly elements: __.ElementsOf<Wheel>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Wheel extends _WheelAspect(__.Entity) {}
Object.defineProperty(Wheel, 'name', { value: 'gt7.Wheel' })
Object.defineProperty(Wheel, 'is_singular', { value: true })

export function _SessionAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Session extends _._cuidAspect(Base) {
    declare createdAt?: __.CdsTimestamp | null
    declare driver?: string | null
    declare car?: __.Association.to<Car> | null
    declare car_ID?: number | null
    declare lapsInRace?: number | null
    declare raceTime?: number | null
    declare bestLap?: number | null
    declare bestLapTime?: number | null
    declare finished?: boolean | null
    declare timeOfDay?: number | null
    declare calculatedMaxSpeed?: number | null
    declare bodyHeight?: number | null
    declare trackUrl?: string | null
    declare Laps?: __.Association.to.many<Laps>
    declare Packets?: __.Composition.of.many<SimulatorInterfacePackets>
    static override readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<Session> & typeof _.cuid.keys;
    declare static readonly elements: __.ElementsOf<Session>;
    declare static readonly actions: typeof _.cuid.actions & globalThis.Record<never, never>;
  };
}
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class Session extends _SessionAspect(__.Entity) {}
Object.defineProperty(Session, 'name', { value: 'gt7.Sessions' })
Object.defineProperty(Session, 'is_singular', { value: true })
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class Sessions extends Array<Session> {$count?: number}
Object.defineProperty(Sessions, 'name', { value: 'gt7.Sessions' })

export function _LapAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Lap extends Base {
    declare session_ID?: __.Key<__.DeepRequired<Session>['ID']>
    declare lap?: __.Key<number>
    declare time?: number | null
    declare maxSpeed?: number | null
    declare avgSpeed?: number | null
    declare best?: boolean | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<Lap>;
    declare static readonly elements: __.ElementsOf<Lap>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Lap extends _LapAspect(__.Entity) {}
Object.defineProperty(Lap, 'name', { value: 'gt7.Laps' })
Object.defineProperty(Lap, 'is_singular', { value: true })
export class Laps extends Array<Lap> {$count?: number}
Object.defineProperty(Laps, 'name', { value: 'gt7.Laps' })

export function _SimulatorInterfacePacketAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class SimulatorInterfacePacket extends Base {
    declare session?: __.Key<__.Association.to<Session>>
    declare session_ID?: __.Key<string>
    declare packetId?: __.Key<number>
    declare car?: __.Association.to<Car> | null
    declare car_ID?: number | null
    declare position_x?: number | null
    declare position_y?: number | null
    declare position_z?: number | null
    declare velocity_x?: number | null
    declare velocity_y?: number | null
    declare velocity_z?: number | null
    declare rotation_pitch?: number | null
    declare rotation_yaw?: number | null
    declare rotation_roll?: number | null
    declare relativeOrientationToNorth?: number | null
    declare angularVelocity_x?: number | null
    declare angularVelocity_y?: number | null
    declare angularVelocity_z?: number | null
    declare bodyHeight?: number | null
    declare engineRPM?: number | null
    declare gasLevel?: number | null
    declare gasCapacity?: number | null
    declare metersPerSecond?: number | null
    declare distance?: number | null
    declare turboBoost?: number | null
    declare oilPressure?: number | null
    declare waterTemperature?: number | null
    declare oilTemperature?: number | null
    declare lapCount?: number | null
    declare lapsInRace?: number | null
    declare currentLapTime?: number | null
    declare currentLapTime2?: number | null
    declare bestLapTime?: number | null
    declare lastLapTime?: number | null
    declare timeOfDayProgression?: number | null
    declare preRaceStartPositionOrQualiPos?: number | null
    declare numCarsAtPreRace?: number | null
    declare minAlertRPM?: number | null
    declare maxAlertRPM?: number | null
    declare calculatedMaxSpeed?: number | null
    declare flags?: number | null
    declare currentGear?: number | null
    declare suggestedGear?: number | null
    declare throttle?: number | null
    declare brake?: number | null
    declare roadPlane_x?: number | null
    declare roadPlane_y?: number | null
    declare roadPlane_z?: number | null
    declare roadPlaneDistance?: number | null
    declare tireRadius_fl?: number | null
    declare tireRadius_fr?: number | null
    declare tireRadius_rl?: number | null
    declare tireRadius_rr?: number | null
    declare tireSuspensionHeight_fl?: number | null
    declare tireSuspensionHeight_fr?: number | null
    declare tireSuspensionHeight_rl?: number | null
    declare tireSuspensionHeight_rr?: number | null
    declare tireSurfaceTemperature_fl?: number | null
    declare tireSurfaceTemperature_fr?: number | null
    declare tireSurfaceTemperature_rl?: number | null
    declare tireSurfaceTemperature_rr?: number | null
    declare wheelRevPerSecond_fl?: number | null
    declare wheelRevPerSecond_fr?: number | null
    declare wheelRevPerSecond_rl?: number | null
    declare wheelRevPerSecond_rr?: number | null
    declare clutchPedal?: number | null
    declare clutchEngagement?: number | null
    declare rpmFromClutchToGearbox?: number | null
    declare transmissionTopSpeed?: number | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<SimulatorInterfacePacket>;
    declare static readonly elements: __.ElementsOf<SimulatorInterfacePacket>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class SimulatorInterfacePacket extends _SimulatorInterfacePacketAspect(__.Entity) {}
Object.defineProperty(SimulatorInterfacePacket, 'name', { value: 'gt7.SimulatorInterfacePackets' })
Object.defineProperty(SimulatorInterfacePacket, 'is_singular', { value: true })
export class SimulatorInterfacePackets extends Array<SimulatorInterfacePacket> {$count?: number}
Object.defineProperty(SimulatorInterfacePackets, 'name', { value: 'gt7.SimulatorInterfacePackets' })

export function _CarAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Car extends Base {
    declare ID?: __.Key<number>
    declare name?: string | null
    declare maker?: __.Association.to<Maker> | null
    declare maker_ID?: number | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<Car>;
    declare static readonly elements: __.ElementsOf<Car>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Car extends _CarAspect(__.Entity) {}
Object.defineProperty(Car, 'name', { value: 'gt7.Cars' })
Object.defineProperty(Car, 'is_singular', { value: true })
export class Cars extends Array<Car> {$count?: number}
Object.defineProperty(Cars, 'name', { value: 'gt7.Cars' })

export function _CarGroupAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class CarGroup extends Base {
    declare ID?: __.Key<number>
    declare group?: string | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<CarGroup>;
    declare static readonly elements: __.ElementsOf<CarGroup>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class CarGroup extends _CarGroupAspect(__.Entity) {}
Object.defineProperty(CarGroup, 'name', { value: 'gt7.CarGroups' })
Object.defineProperty(CarGroup, 'is_singular', { value: true })
export class CarGroups extends Array<CarGroup> {$count?: number}
Object.defineProperty(CarGroups, 'name', { value: 'gt7.CarGroups' })

export function _CountryAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Country extends Base {
    declare ID?: __.Key<number>
    declare name?: string | null
    declare code?: string | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<Country>;
    declare static readonly elements: __.ElementsOf<Country>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Country extends _CountryAspect(__.Entity) {}
Object.defineProperty(Country, 'name', { value: 'gt7.Countries' })
Object.defineProperty(Country, 'is_singular', { value: true })
export class Countries extends Array<Country> {$count?: number}
Object.defineProperty(Countries, 'name', { value: 'gt7.Countries' })

export function _CourseBasAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class CourseBas extends Base {
    declare ID?: __.Key<number>
    declare name?: string | null
    declare logoName?: string | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<CourseBas>;
    declare static readonly elements: __.ElementsOf<CourseBas>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class CourseBas extends _CourseBasAspect(__.Entity) {}
Object.defineProperty(CourseBas, 'name', { value: 'gt7.CourseBases' })
Object.defineProperty(CourseBas, 'is_singular', { value: true })
export class CourseBases extends Array<CourseBas> {$count?: number}
Object.defineProperty(CourseBases, 'name', { value: 'gt7.CourseBases' })

export function _CoursAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Cours extends Base {
    declare ID?: __.Key<number>
    declare name?: string | null
    declare base?: __.Association.to<CourseBas> | null
    declare base_ID?: number | null
    declare country?: __.Association.to<Country> | null
    declare country_ID?: number | null
    declare category?: string | null
    declare length?: number | null
    declare longestStraight?: number | null
    declare elevationDiff?: number | null
    declare altitude?: number | null
    declare minTimeH?: number | null
    declare minTimeM?: number | null
    declare minTimeS?: number | null
    declare maxTimeH?: number | null
    declare maxTimeM?: number | null
    declare maxTimeS?: number | null
    declare layoutNumber?: number | null
    declare isReverse?: boolean | null
    declare pitLaneDelta?: number | null
    declare isOval?: boolean | null
    declare numCorners?: number | null
    declare noRain?: boolean | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<Cours>;
    declare static readonly elements: __.ElementsOf<Cours>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Cours extends _CoursAspect(__.Entity) {}
Object.defineProperty(Cours, 'name', { value: 'gt7.Courses' })
Object.defineProperty(Cours, 'is_singular', { value: true })
export class Courses extends Array<Cours> {$count?: number}
Object.defineProperty(Courses, 'name', { value: 'gt7.Courses' })

export function _EngineSwapAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class EngineSwap extends _._cuidAspect(Base) {
    declare newCar?: number | null
    declare originalCar?: number | null
    declare engineName?: string | null
    static override readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<EngineSwap> & typeof _.cuid.keys;
    declare static readonly elements: __.ElementsOf<EngineSwap>;
    declare static readonly actions: typeof _.cuid.actions & globalThis.Record<never, never>;
  };
}
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class EngineSwap extends _EngineSwapAspect(__.Entity) {}
Object.defineProperty(EngineSwap, 'name', { value: 'gt7.EngineSwaps' })
Object.defineProperty(EngineSwap, 'is_singular', { value: true })
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class EngineSwaps extends Array<EngineSwap> {$count?: number}
Object.defineProperty(EngineSwaps, 'name', { value: 'gt7.EngineSwaps' })

export function _LotteryCarAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class LotteryCar extends _._cuidAspect(Base) {
    declare category?: string | null
    declare carID?: number | null
    static override readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<LotteryCar> & typeof _.cuid.keys;
    declare static readonly elements: __.ElementsOf<LotteryCar>;
    declare static readonly actions: typeof _.cuid.actions & globalThis.Record<never, never>;
  };
}
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class LotteryCar extends _LotteryCarAspect(__.Entity) {}
Object.defineProperty(LotteryCar, 'name', { value: 'gt7.LotteryCars' })
Object.defineProperty(LotteryCar, 'is_singular', { value: true })
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class LotteryCars extends Array<LotteryCar> {$count?: number}
Object.defineProperty(LotteryCars, 'name', { value: 'gt7.LotteryCars' })

export function _MakerAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Maker extends Base {
    declare ID?: __.Key<number>
    declare name?: string | null
    declare country?: __.Association.to<Country> | null
    declare country_ID?: number | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<Maker>;
    declare static readonly elements: __.ElementsOf<Maker>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class Maker extends _MakerAspect(__.Entity) {}
Object.defineProperty(Maker, 'name', { value: 'gt7.Makers' })
Object.defineProperty(Maker, 'is_singular', { value: true })
export class Makers extends Array<Maker> {$count?: number}
Object.defineProperty(Makers, 'name', { value: 'gt7.Makers' })

export function _StockPerformanceAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class StockPerformance extends Base {
    declare ID?: __.Key<number>
    declare pp?: __.Key<number>
    declare tyre?: __.Key<string>
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<StockPerformance>;
    declare static readonly elements: __.ElementsOf<StockPerformance>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class StockPerformance extends _StockPerformanceAspect(__.Entity) {}
Object.defineProperty(StockPerformance, 'name', { value: 'gt7.StockPerformances' })
Object.defineProperty(StockPerformance, 'is_singular', { value: true })
export class StockPerformances extends Array<StockPerformance> {$count?: number}
Object.defineProperty(StockPerformances, 'name', { value: 'gt7.StockPerformances' })

export function _TrophyAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class Trophy extends _._cuidAspect(Base) {
    declare name?: string | null
    declare car?: __.Association.to<Car> | null
    declare car_ID?: number | null
    static override readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<Trophy> & typeof _.cuid.keys;
    declare static readonly elements: __.ElementsOf<Trophy>;
    declare static readonly actions: typeof _.cuid.actions & globalThis.Record<never, never>;
  };
}
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class Trophy extends _TrophyAspect(__.Entity) {}
Object.defineProperty(Trophy, 'name', { value: 'gt7.Trophies' })
Object.defineProperty(Trophy, 'is_singular', { value: true })
/**
* Aspect for entities with canonical universal IDs
* 
* See https://cap.cloud.sap/docs/cds/common#aspect-cuid
*/
export class Trophies extends Array<Trophy> {$count?: number}
Object.defineProperty(Trophies, 'name', { value: 'gt7.Trophies' })

export function _TLT_PS5GT7_RawDataLocalAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class TLT_PS5GT7_RawDataLocal extends Base {
    declare session_ID?: __.Key<string>
    declare packetId?: __.Key<number>
    declare Source?: string | null
    declare sessionDateTime?: __.CdsDateTime | null
    declare Driver?: string | null
    declare carID?: number | null
    declare engineRPM?: number | null
    declare metersPerSecond?: number | null
    declare lapCount?: number | null
    declare lapsInRace?: number | null
    declare currentLapTime2?: number | null
    declare lastLapTime?: number | null
    declare timeOfDayProgression?: number | null
    declare throttle?: number | null
    declare brake?: number | null
    declare clutchPedal?: number | null
    declare currentGear?: number | null
    declare flags?: number | null
    declare preRaceStartPositionOrQualiPos?: number | null
    declare rowDate?: __.CdsDateTime | null
    static readonly kind: 'entity' | 'type' | 'aspect' = 'entity';
    declare static readonly keys: __.KeysOf<TLT_PS5GT7_RawDataLocal>;
    declare static readonly elements: __.ElementsOf<TLT_PS5GT7_RawDataLocal>;
    declare static readonly actions: globalThis.Record<never, never>;
  };
}
export class TLT_PS5GT7_RawDataLocal extends _TLT_PS5GT7_RawDataLocalAspect(__.Entity) {}
Object.defineProperty(TLT_PS5GT7_RawDataLocal, 'name', { value: 'gt7.TLT_PS5GT7_RawDataLocal' })
Object.defineProperty(TLT_PS5GT7_RawDataLocal, 'is_singular', { value: true })
export class TLT_PS5GT7_RawDataLocal_ extends Array<TLT_PS5GT7_RawDataLocal> {$count?: number}
Object.defineProperty(TLT_PS5GT7_RawDataLocal_, 'name', { value: 'gt7.TLT_PS5GT7_RawDataLocal' })
