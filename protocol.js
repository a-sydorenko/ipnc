const HFL = 4; // head frame length

class Protocol {

  pack( buffer ) {
    let head = Buffer.alloc( HFL );
    head.writeUInt32BE( buffer.length );
    return Buffer.concat( [ head, buffer ] );
  }

  unpack( frame ) {
    let length = frame.readUInt32BE();
    let buffer = Buffer.alloc(length);
    frame.copy( buffer, 0, HFL );
    return buffer;
  }

}

module.exports = { Protocol, HFL };