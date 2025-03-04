// This is an automatically generated file. Please do not change its contents manually!
import * as __ from './../_';
export default { name: 'sac_service' }
export function _SAP__MessageAspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class SAP__Message extends Base {
        code?: string;
        message?: string;
        target?: string | null;
        additionalTargets?: Array<string>;
        transition?: boolean;
        numericSeverity?: number;
        longtextUrl?: string | null;
      static readonly actions: Record<never, never>
  };
}
export class SAP__Message extends _SAP__MessageAspect(__.Entity) {}
Object.defineProperty(SAP__Message, 'name', { value: 'sac_service.SAP__Message' })
Object.defineProperty(SAP__Message, 'is_singular', { value: true })

export function _ZC_SESSIONSV3Aspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class ZC_SESSIONSV3 extends Base {
        Internalid?: string;
        Sessionid?: string;
        Racesecond?: number;
        Sessiontimestamp?: string;
        Sessiondate?: __.CdsDate | null;
        Sessiontime?: __.CdsTime;
        Drivername?: string;
        Car?: number;
        Lapcount?: number;
        Racetimeinms?: number;
        Speedinkmh?: number;
        Gear?: number;
        Distanceinkmh?: number;
        Laptimeinms?: number;
        Raceposition?: number;
        Throttlepressureinpercent?: number;
        Breakpressureinpercent?: number;
        Clutchdisengageinpercent?: number;
        Offtrackinpercent?: number;
        Handbreakinpercent?: number;
        Asminpercent?: number;
        Tcsinpercent?: number;
        SAP__Messages?: Array<SAP__Message>;
      static readonly actions: Record<never, never>
  };
}
export class ZC_SESSIONSV3 extends _ZC_SESSIONSV3Aspect(__.Entity) {}
Object.defineProperty(ZC_SESSIONSV3, 'name', { value: 'sac_service.ZC_SESSIONSV3' })
Object.defineProperty(ZC_SESSIONSV3, 'is_singular', { value: true })
export class ZC_SESSIONSV3_ extends Array<ZC_SESSIONSV3> {$count?: number}
Object.defineProperty(ZC_SESSIONSV3_, 'name', { value: 'sac_service.ZC_SESSIONSV3' })
