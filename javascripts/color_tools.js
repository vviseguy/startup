export const myColors = [
    "#918F8F", // black
    "#c4c4c4", // grey
    "#e6e6e6", // white
    // "#5432a8", // purple
    "#a38484" // red
    // "#37b8af", // teal
  
  ];
export function fuzzColor(color, range = 40) {
    var fuzz = Math.random() * range;
  
    var r = fuzzHex(color.substring(1, 3), fuzz);
    var g = fuzzHex(color.substring(3, 5), fuzz);
    var b = fuzzHex(color.substring(5, 7), fuzz);
  
    return '#' + r + g + b;
  
    /* takes a two byte string with a hexadecimal value and 
      returns a two byte string that is a random amount off (up to the range)
    */
    function fuzzHex(hex, skew = Math.random() * range) {
      var hexAsInt = toInt(hex);
      hexAsInt += skew;
      return toHex(Math.round(createBound(hexAsInt)));
    }
    function createBound(num) {
      return (num < 0) ? 0 : (num > 255) ? 255 : num;
    }
}


//** END EXPORT STATEMENTS **//




/**
 * returns the hexadecimal value of a positive int > 0 and < 256
 */
function toHex(num) {
  var hexValues = '0123456789ABCDEF';
  return hexValues[Math.floor(num / 16)] + hexValues[Math.floor(num % 16)];
}
  
/**
 * 
 */
function toInt(string) {
  string = string.toUpperCase();
  var hexValues = '0123456789ABCDEF';
  var value = 0;
  for (var i = 0; i < string.length; i++) {
    value *= 16;
    value += hexValues.indexOf(string[i]);
  }
  return value;
}