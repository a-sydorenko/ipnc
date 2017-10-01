const { Socket } = require('net');
const { Queue } = require('./queue');
const { cutOffTail } = require('./lib');
const { Protocol, HFL } = require('./protocol');

function getDefaultOptions(){
  const deafaultOptions = {
    net:{
      path:'/tmp/test-dep.socket',
      timeout:100
    },
    event:'data',
    protocol: new Protocol()
  } 
  return deafaultOptions;
}

class Link extends Queue {

  constructor ( options ) {

    options = Object.assign( getDefaultOptions(), options );

    super( options.event || 'data' );
    this.options  = options;
    this.socket   = null;
    this.protocol = this.options.protocol || new Protocol();    
    this.connect  = connectFactory.bind(this);

    this.connect();

  }

  send( ...args ) {
    if( this.connected ) {
      this.socket.write( this.protocol.pack( ...args ) );
    }
    else {
      this.emit( 'send-error', ...args );
    }
  }

}

function connectFactory(){
  
  let storage;
  let frameLength;

  this.connected = false;
  this.socket    = new Socket();
  
  this.socket.connect( this.options.net, ()=>{ this.connected = true; });
  
  this.socket.on( 'data',  ( chunk )=> {

    let buffer;

    if( storage ) {
      buffer = Buffer.concat( [ storage, chunk ] );
    }
    else {
      buffer = chunk;
    }

    if( !frameLength ) {
      if( buffer.length >= HFL ) {
        frameLength = buffer.readUInt32BE() + HFL;
      }
    }

    while( frameLength <= buffer.length ) {

      this.frames.push( [ this.protocol.unpack( buffer ) ] );

      buffer = cutOffTail( buffer, frameLength );

      if( buffer.length >= HFL ) {
        frameLength = buffer.readUInt32BE() + HFL;
      }
      else {
        frameLength = undefined;
        break;
      }
    }

    storage = buffer.length ? buffer : undefined;

    this.execute();

  });

  let closeHandler = ( ...args )=> {
    this.connected = false;
    // this.socket.removeAllListeners('end');
    // this.socket.removeAllListeners('timeout');      
    this.socket.destroy( new Error('Link Error 001') );
  }

  let errorHandler = ( err )=>{
    this.connected = false;
    this.emit( 'error', err );
  }

  this.socket.once( 'end', closeHandler );
  this.socket.once( 'error', errorHandler );
  this.socket.once( 'timeout', closeHandler );
  
};

module.exports = { Link };