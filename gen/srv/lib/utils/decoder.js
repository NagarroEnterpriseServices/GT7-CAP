"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = void 0;
const util_1 = require("util");
const salsa20_1 = require("./salsa20");
const decrypt = (data) => {
    const encoder = new util_1.TextEncoder();
    const key = encoder.encode(process.env.GT_VERSION == 'GT7' ?
        "Simulator Interface Packet GT7 ver 0.0" :
        "Simulator Interface Packet ver 0.0"); // 32 bytes key
    const nonce1 = data.readInt32LE(64);
    const nonce2 = nonce1 ^ 0xdeadbeaf;
    const nonce = Buffer.alloc(8);
    nonce.writeInt32LE(nonce2);
    nonce.writeInt32LE(nonce1, 4);
    const message = new salsa20_1.Salsa20(key.slice(0, 32), nonce).decrypt(data);
    const newBuffer = Buffer.alloc(message.byteLength);
    for (var i = 0; i < message.length; i++)
        newBuffer[i] = message[i];
    return newBuffer;
};
exports.decrypt = decrypt;
//# sourceMappingURL=decoder.js.map