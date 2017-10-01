const assert = require('assert');
const { Protocol } = require('../protocol');

let protocol = new Protocol();

let text = 'test string'
describe('protocol', ()=>{
  it('pack-unpack',()=>{
    assert.deepEqual(protocol.unpack(protocol.pack(Buffer.from(text))).toString(),text);
  });
});