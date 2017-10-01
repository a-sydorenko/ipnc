const EventEmiter = require( 'events' );

class Queue extends EventEmiter {

  constructor ( event = 'data' ) {
    
    super();
    this.frames     = [];
    this.loop       = loop.bind( this );
    this.inProcess  = false;
    this.event      = event;

  }

  execute() {

    if( !this.inProcess && this.frames.length>0 ){
      setImmediate(this.loop);
      this.inProcess = true;
      return true;
    }

    return false;

  }

}

function loop() {

  if( this.frames.length ) {
    this.emit( this.event , ...(this.frames.shift()) );
  }

  if( this.frames.length ) {
    setImmediate( this.loop );
    this.inProcess = true;
  }
  else {
    this.inProcess = false;
  }

}

module.exports = { Queue };