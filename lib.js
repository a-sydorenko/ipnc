function cutOffTail( buffer, size ) {
  let tail = Buffer.alloc( buffer.length - size );
  buffer.copy( tail, 0, size );
  return tail;
}

function copyLevel(obj, souce){
  Object.keys(source).forEach((property)=>{
    if(!obj[property]){
      obj[property] = souce[property];
    }
  });
  return obj;
}

module.exports = {
  cutOffTail,
  copyLevel
};
