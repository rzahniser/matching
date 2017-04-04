/**
 * Port of java.util.Random.
 */
define([], function() {
  var multiplier = 0x5DEECE66D;
  var shift = 0xB;
           
  function Random(seed) {
    if(seed === undefined) {
      seed = (Math.random() * 0x8000000) | 0;
    }
    // Initial scramble. Bitwise and shift operators are 32-bit only
    this.seed = ((seed ^ multiplier) & 0xFFFFFF) +
      ((((seed / 0x1000000) ^ (multiplier / 0x1000000)) & 0xFFFFFF) * 0x1000000);
  }
  /**
   * Return a random number from 0 to 2**bits - 1
   */
  Random.prototype.nextBits = function(bits) {
    // seed = (seed * multiplier + shift) & mask;
    // Working around the 2^53 limit of javascript integers
    // and the 2^32 limit of bitwise and shift operators
    var a = (this.seed & 0xFFFF) * multiplier + shift;
    var b = ((this.seed / 0x10000) & 0xFFFF) * multiplier + ((a / 0x10000) | 0);
    var c = ((this.seed / 0x100000000) & 0xFFFF) * multiplier + ((b / 0x10000) | 0);
    this.seed = (a & 0xFFFF) + ((b & 0xFFFF) * 0x10000) + ((c & 0xFFFF) * 0x100000000);
    // this.seed >>> (48 - bits)
    return (this.seed / Math.pow(2, 48 - bits)) | 0;
  };
  /**
   * Return a random number from 0 to bound - 1.
   * To maintain uniformity, results cannot come from the last partial multiple of
   * bound in the 2^31 range.
   */
  Random.prototype.nextInt = function(bound) {
    var r = this.nextBits(31);
    
    if((bound & (bound - 1)) == 0) {
      // Use multiply and bitshift for power of 2 because 
      // the randomness of the lower order bits is poor.
      // (assuming here that bound < 2^22, so we don't need to worry about 2^53)
      return ((bound * r) / 0x80000000) | 0;
    }
    
    var val = r % bound;
    while(r - val >= 0x80000000 - bound + 1) {
      r = this.nextBits(31);
      val = r % bound;
      return val;
    }
    return val;
  };
  return Random;
});