const fs = require('fs');
const net = require('net');
const { Queue } = require('./queue');
const { cutOffTail } = require('./lib');
const { Protocol, HFL } = require('./protocol');

class Response {
  
  constructor( parent, socket, buffer ) {
    this.parent   = parent;
    this.socket   = socket;
  }
  
  send(...args) {
    if(this.parent.clients.has(this.socket)){
      this.socket.write( this.parent.protocol.pack( ...args ) );
    }
  }

}

function getDeafaultOptions() {
  const deafaultOptions = {
    net:{
      path:'/tmp/test-dep.socket',
      timeout:100
    },
    event:'data',
    protocol: new Protocol(),
    response: Response
  };
  return deafaultOptions;
}

class Switchboard extends Queue {

  constructor ( options ){

    options = Object.assign( getDeafaultOptions(), options );
    
    super( options.event || 'data' );

    this.options = options;
    
    if(process.env.DEBUG){
      console.log(this.options);
    }
    if( this.options.net.path ){
      let status = deleteSocketFile( this.options.net.path );

      if(status !== null){
        throw status;
      }      
    }

    this.server   = net.createServer();
    this.clients  = new Set();
    this.protocol = this.options.protocol || new Protocol();;
    this.response = this.options.response || Response;

    this.server.on( 'connection', ( socket )=> {
      
      this.clients.add(socket);

      let storage;
      let frameLength;

      socket.on( 'data', ( chunk )=> {
        let buffer;

        if(storage){
          buffer = Buffer.concat([storage, chunk]);
        }
        else {
          buffer = chunk;
        }

        if(!frameLength){
          if(buffer.length > HFL){
            frameLength = buffer.readUInt32BE() + HFL;
          }
        }

        while(frameLength<=buffer.length) {
          
          let data  = this.protocol.unpack( buffer );
          this.frames.push( [ data, new (this.response)(this, socket, data) ] );

          buffer = cutOffTail( buffer, frameLength );
          
          if(buffer.length > HFL){
            frameLength = buffer.readUInt32BE() + HFL;
          }
          else{
            frameLength = undefined;
            break;
          }

        }

        storage = buffer.length ? buffer : undefined;

        this.execute();

      });


      let closeHandler = (...args)=> {
        this.clients.delete( socket );
        socket.removeAllListeners('data');
        socket.destroy( new Error('Switchboard Error 001') );
      }

      let errorHandler = ( err )=> {
        this.clients.delete( socket );
        this.emit('soket-destroed', socket);
      }

      socket.once( 'end', closeHandler );
      socket.once( 'error', errorHandler );
      socket.once( 'timeout', closeHandler );

    });

    this.server.on( 'error',( err )=> {
      this.emit( 'error', err );
    });

    this.server.listen( this.options.net );
  }

  broadcast( ...args ){
    let buffer = this.protocol.pack( ...args );

    for(let socket of this.clients){
      socket.write(buffer);
    }
  }
  
}

function deleteSocketFile( path ) {
  let result = null;
  if ( fs.accessSync( '/tmp', fs.constants.R_OK | fs.constants.W_OK ) === undefined ) {
    if( fs.existsSync( path ) ){
      fs.unlinkSync( path );
    }
  }
  else{
    result = new Error( 'not access' );
  }
  return result
}

module.exports = { Switchboard, Response };