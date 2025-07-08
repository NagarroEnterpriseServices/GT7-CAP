using {gt7 as my} from '../db/schema';

@protocol: 'odata'
service GT7Service {
    @readonly
    entity Sessions                  as select from my.Sessions
        actions {
            action assignDriver(sessionID : UUID, driver : String) returns Boolean;
            action deleteSession() returns Boolean;
            action changeDriver(NewDriver: String) returns Boolean;

            
            function generateFioriMetrics() returns Boolean;
            function getLapSVG()      returns String;
        };

    @readonly
    entity Laps                      as select from my.Laps;

    @readonly
    @Capabilities.SearchRestrictions.Searchable: false
    entity SimulatorInterfacePackets as select from my.SimulatorInterfacePackets;

    @readonly
    entity Cars                      as select from my.Cars;

    @readonly
    entity CarGroups                 as select from my.CarGroups;

    @readonly
    entity Countries                 as select from my.Countries;

    @readonly
    entity CourseBases               as select from my.CourseBases;

    @readonly
    entity Courses                   as select from my.Courses;

    @readonly
    entity EngineSwaps               as select from my.EngineSwaps;

    @readonly
    entity LotteryCars               as select from my.LotteryCars;

    @readonly
    entity Makers                    as select from my.Makers;

    @readonly
    entity StockPerformances         as select from my.StockPerformances;

    @readonly
    entity Trophies                  as select from my.Trophies;


    action test();
}


annotate GT7Service.SimulatorInterfacePackets with @Aggregation.ApplySupported: {
    Transformations       : [
        'aggregate',
        'topcount',
        'bottomcount',
        'identity',
        'concat',
        'groupby',
        'filter',
        'search'
    ],
    Rollup : #None,
    PropertyRestrictions  : true,
    GroupableProperties : [
        currentLapTime,  // time is our dimension
        lapCount,
    ],
    AggregatableProperties : [
        {
            Property : velocity,
        },
        {
            Property : engineRPM
        },
        {
            Property : throttle
        },
        {
            Property : brake
        },
        {
            Property : currentGear
        },
        {
            Property : gasLevel
        },
        {
            Property : gasCapacity
        },
        {
            Property : metersPerSecond
        },
        {
            Property : distance
        },
        {
            Property : oilPressure
        },
        {
            Property : waterTemperature
        },
        {
            Property : oilTemperature
        },
        {
            Property : turboBoost
        },
        {
            Property : tireSurfaceTemperature
        },
    ]
};