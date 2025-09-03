using gt7 as db from '../db/schema';

//This whole service is for testing purpose, to try to connect to datasphere

service ExpositionService{
    entity TLT_PS5GT7_RawDataEntity as projection on db.TLT_PS5GT7_RawDataLocal;
    action test();
}