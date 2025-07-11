using gt7 as db from '../db/schema';

service ExpositionService{
    entity TLT_PS5GT7_RawData as projection on db.TLT_PS5GT7_RawData;
    action test();
}