using GT7Service as service from '../../srv/gt7-service';

// UI.Identification (Actions on Object Page) & Semantic Key
annotate service.Sessions with @(
    Common.SemanticKey: [ID], //field in bold, editing status displayed, when possible and it effects navigation
    UI.Identification : [
        {
            //Determining      : true,
            $Type            : 'UI.DataFieldForAction',
            Label            : '{i18n>generateFioriMetrics}',
            Action           : 'GT7Service.generateFioriMetrics',
            //Criticality      : #Positive,
            ![@UI.Importance]: #High
        },
    ],
    UI.SelectionPresentationVariant #table : {
        $Type : 'UI.SelectionPresentationVariantType',
        PresentationVariant : ![@UI.PresentationVariant],
        SelectionVariant : {
            $Type : 'UI.SelectionVariantType',
            SelectOptions : [
            ],
        },
    },
    
);

// UI.PresentationVariant (ListReport DefaultSort)
annotate service.Sessions with @(
    UI.PresentationVariant : {
        SortOrder       : [ //Default sort order
            {
                Property    : createdAt,
                Descending  : true,
            },
            {
                $Type : 'Common.SortOrderType',
                Property : driver,
                Descending : false,
            },
        ],
        Visualizations  : ['@UI.LineItem'],
        GroupBy : [
            driver,
        ],
    },
);

// UI.LineItem (ListReport Columns)
annotate service.Sessions with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Label: 'Track',
        Value: trackUrl,
    },
    {
        $Type: 'UI.DataField',
        Label: 'Session',
        Value: createdAt,
    },
    {
        $Type: 'UI.DataField',
        Label: 'Driver',
        Value: driver,
        ![@UI.Importance]: #High
    },
    {
        $Type: 'UI.DataField',
        Label: 'Car',
        Value: car.name,
    },
    {
        $Type : 'UI.DataField',
        Value : raceTime,
        Label : 'Time',
    },
    {
        $Type: 'UI.DataField',
        Label: 'Best Lap Time',
        Value: bestLapTime,
    },
    {
        $Type: 'UI.DataField',
        Label: 'Laps',
        Value: lapsInRace,
    },
    {
        $Type : 'UI.DataFieldForAction',
        Action : 'GT7Service.deleteSession',
        Label : 'Delete',
        Determining : false,
    },
    {
        $Type : 'UI.DataFieldForAction',
        Action : 'GT7Service.changeDriver',
        Label : 'Change Driver',
    },
]);

// UI.HeaderInfo (ObjectPage header info)
annotate service.Sessions with @(UI.HeaderInfo: {
    TypeName      : '{i18n>Session}',
    TypeNamePlural: '{i18n>Sessions}',
    Title         : {
        $Type: 'UI.DataField',
        Value: createdAt,
    },
    Description   : {
        $Type: 'UI.DataField',
        Value: car.name,
    },
    ImageUrl : trackUrl
    //TypeImageUrl  : 'sap-icon://performance',
});

// UI.HeaderFacets
annotate service.Sessions with @(UI.HeaderFacets: [{
    $Type : 'UI.CollectionFacet',
    ID    : 'CollectionFacet',
    Facets: [
        {
            //Search-Term: #HeaderFieldGroup
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.FieldGroup#LapData',
        /*Label : '{i18n>LapData}',*/
        },
        {
            $Type : 'UI.ReferenceFacet',
            Target: '@UI.FieldGroup#RaceData',
        /*Label : '{i18n>RaceData}',*/
        }
    ],
}]);

// UI.FieldGroup
annotate service.Sessions with @(
    UI.FieldGroup #LapData : {Data: [
        {
            Label: '{i18n>lapsInRace}',
            Value: lapsInRace
        },
        {
            Label: '{i18n>bestLap}',
            Value: bestLap
        },
        {
            Label: '{i18n>bestLapTime}',
            Value: bestLapTime
        },
    ]},
    UI.FieldGroup #RaceData: {Data: [{
        Label: '{i18n>finished}',
        Value: finished
    }, ]}
);

/**
    Common.ValueList (ValueHelps)
 */
annotate service.Sessions with {
    car @Common.ValueList: {
        $Type         : 'Common.ValueListType',
        CollectionPath: 'Cars',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: car_ID,
                ValueListProperty: 'ID',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name',
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'maker_ID',
            },
        ],
    }
};

annotate service.Laps with @(UI.LineItem #LapTimes: [
    {
        $Type: 'UI.DataField',
        Value: lap,
        Label: 'Lap',
        ![@HTML5.CssDefaults]: {
            width: '4rem',
        },
    },
    {
        $Type: 'UI.DataField',
        Value: time,
        Label: 'Time (s)',
        ![@HTML5.CssDefaults]: {
            width: '19.4rem',
        },
    },
]);

annotate service.Laps with @(UI.LineItem #LapSpeeds: [
    {
        $Type                : 'UI.DataField',
        Value                : lap,
        Label                : 'Lap',
        ![@HTML5.CssDefaults]: {width: '4rem', },
    },
    {
        $Type                : 'UI.DataField',
        Value                : avgSpeed,
        Label                : 'Average Speed (km/h)',
        ![@HTML5.CssDefaults]: {width: '10.7rem', },
    },
    {
        $Type                : 'UI.DataField',
        Value                : maxSpeed,
        Label                : 'Max Speed (km/h)',
        ![@HTML5.CssDefaults]: {width: '8.7rem', },
    },
]);

annotate service.Sessions with {
    raceTime @Measures.Unit : 's'
};

annotate service.Sessions with {
    bestLapTime @Measures.Unit : 's'
};

annotate service.Sessions with {
    calculatedMaxSpeed @Measures.Unit : 'km/h'
};
annotate service.Sessions with {
    driver @Common.Label : 'Driver'
};



annotate service.SimulatorInterfacePackets with @(
    Analytics.AggregatedProperty #metersPerSecond_average : {
        $Type : 'Analytics.AggregatedPropertyType',
        Name : 'metersPerSecond_average',
        AggregatableProperty : metersPerSecond,
        AggregationMethod : 'average',
        ![@Common.Label] : 'Speed (km/h)',
    },
    Analytics.AggregatedProperty #throttle_average : {
        $Type : 'Analytics.AggregatedPropertyType',
        Name : 'throttle_average',
        AggregatableProperty : throttle,
        AggregationMethod : 'average',
        ![@Common.Label] : 'Throttle (%)',
    },
    Analytics.AggregatedProperty #brake_average : {
        $Type : 'Analytics.AggregatedPropertyType',
        Name : 'brake_average',
        AggregatableProperty : brake,
        AggregationMethod : 'average',
        ![@Common.Label] : 'Brake (%)',
    },
    Analytics.AggregatedProperty #engineRPM_average : {
        $Type : 'Analytics.AggregatedPropertyType',
        Name : 'engineRPM_average',
        AggregatableProperty : engineRPM,
        AggregationMethod : 'average',
        ![@Common.Label] : 'Engine (rpm)'
    },
    UI.Chart #chartSection : {
        $Type : 'UI.ChartDefinitionType',
        ChartType : #Line,
        Dimensions : [
            currentLapTime,
        ],
        DynamicMeasures : [
            '@Analytics.AggregatedProperty#metersPerSecond_average',
        ],
        
    },
);

annotate service.SimulatorInterfacePackets with {
    lapCount @Common.Label : 'Lap'
};

annotate service.SimulatorInterfacePackets with {
    currentLapTime @Common.Label : 'Time (ms)'
};