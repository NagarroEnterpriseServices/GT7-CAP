const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    this.on('test', test);
});

async function test() { 
    const db = await cds.connect.to('db'); // 'db' = service de type "hana-cloud"

    const randUUID = cds.utils.uuid();

    const result = await db.run(
        INSERT.into('TLT_PS5GT7_RawData').entries({
            session_ID: randUUID,
            packetId: 1234,
            Source: 'Hey Sylvain'
        })
    );

    console.log(result);

    // Retourner un petit objet au client
    return { success: true, insertedId: randUUID };
}
