const assert  = require('assert');
const { Link } = require('../link');
const { Switchboard } = require('../switchboard');

let buffer_send     = Buffer.from('test string');
let buffer_response = Buffer.from('response test string');
let bus = new Switchboard();
let jet = null;

describe('jet-bus',function(){
  
    jet = new Link();

    it('jet.send()',function( done ) {

      jet.send(buffer_send);

      bus.on('data',(buffer)=>{ 
        if(buffer.toString()===buffer_send.toString()){
          done();
        }
        else{
          done( new Error(buffer.toString()+'!=='+ buffer_send.toString() ) );
        }
      });
      
    });

    it('bus.<event>data',function( done ) {

      jet.send(buffer_send);

      bus.on('data',( buffer, res )=>{ 
        res.send(buffer_response);
      });
      
      jet.on('data',( buffer )=>{ 
        if(buffer.toString()===buffer_response.toString()){
          done();
        }
        else{
          done( new Error(buffer.toString()+'!=='+ buffer_response.toString() ) );
        }
      });

    });

});