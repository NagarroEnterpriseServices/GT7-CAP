// This is an automatically generated file. Please do not change its contents manually!
import * as __ from './../_';
export default { name: 'btp_service' }
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
Object.defineProperty(SAP__Message, 'name', { value: 'btp_service.SAP__Message' })
Object.defineProperty(SAP__Message, 'is_singular', { value: true })

export function _ZC_SESSIONS2Aspect<TBase extends new (...args: any[]) => object>(Base: TBase) {
  return class ZC_SESSIONS2 extends Base {
        Sessionid?: string;
        Racesecond?: number;
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
        Racetimeinms?: number;
        SAP__Messages?: Array<SAP__Message>;
      static readonly actions: Record<never, never>
  };
}
export class ZC_SESSIONS2 extends _ZC_SESSIONS2Aspect(__.Entity) {}
Object.defineProperty(ZC_SESSIONS2, 'name', { value: 'btp_service.ZC_SESSIONS2' })
Object.defineProperty(ZC_SESSIONS2, 'is_singular', { value: true })
export class ZC_SESSIONS2_ extends Array<ZC_SESSIONS2> {$count?: number}
Object.defineProperty(ZC_SESSIONS2_, 'name', { value: 'btp_service.ZC_SESSIONS2' })
