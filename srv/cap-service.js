const cds = require('@sap/cds');

//This whole service is for testing purpose, to try to connect to datasphere

module.exports = cds.service.impl(async function () {
    this.on('test', test);
});


var hana = require('@sap/hana-client');

var conn = hana.createConnection();

var conn_params = {
  serverNode  : '8cf6e46c-2deb-4ded-8a35-dfe14b654268.hana.prod-eu10.hanacloud.ondemand.com:443',
  uid: "C_M_PS5GT7#TECH_USER",
  password: "", //put the password here
  type: "procedure",
  procedure_schema: "C_M_PS5GT7$TEC",
  procedure: "HDI_GRANTOR_FOR_CUPS"
};


async function test() { 
    conn.connect(conn_params, function(err) {
        if (err) throw err;

        conn.exec('SELECT SCHEMA_NAME, TABLE_NAME FROM SYS.M_TABLES',
            async function (err, result) {
                if (err) throw err;

                console.log(result);

                const insertQuery = `
                    INSERT INTO TLT_PS5GT7_RAWDATA (
                        SOURCE, SESSION_ID, PACKETID, DRIVER,
                        CARID, ENGINERPM, METERSPERSECOND, LAPCOUNT, LAPSINRACE,
                        CURRENTLAPTIME2, LASTLAPTIME
                    ) VALUES (
                        'TestingSource', 
                        '123e4567-e89b-12d3-a456-426614174000', 
                        101, 
                        'Test Driver', 
                        7, 
                        8500, 
                        72.5, 
                        3, 
                        5, 
                        95000, 
                        94000
                    )
                `;

                conn.exec(insertQuery, function (err, result) {
                    if (err) throw err;
                    console.log('Insert successful:', result);
                });

                conn.exec('SELECT * FROM TLT_PS5GT7_RAWDATA',
                    function (err, result) {
                        if (err) throw err;
                        console.log(result);
                        conn.disconnect();
                    });
        });
    });
}

