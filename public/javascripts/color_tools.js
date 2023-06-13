export const myColors = [
    "#e0e0e0", // white
    "#615F5F", // black
    "#817F7F", // dark-grey
    "#c4c4c4", // grey
    // "#5432a8", // purple
    "#a38484" // red
    // "#37b8af", // teal
  
  ];
export function fuzzColor(color, range = 50) {
    let fuzz = getRandom(range);
  
    let r = fuzzHex(color.substring(1, 3), fuzz);
    let g = fuzzHex(color.substring(3, 5), fuzz);
    let b = fuzzHex(color.substring(5, 7), fuzz);
  
    return '#' + r + g + b;
  
    /* takes a two byte string with a hexadecimal value and 
      returns a two byte string that is a random amount off (up to the range)
    */
    function fuzzHex(hex, skew = getRandom(range)) {
      let hexAsInt = toInt(hex);
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
  let hexValues = '0123456789ABCDEF';
  return hexValues[Math.floor(num / 16)] + hexValues[Math.floor(num % 16)];
}
  
/**
 * 
 */
function toInt(string) {
  string = string.toUpperCase();
  let hexValues = '0123456789ABCDEF';
  let value = 0;
  for (let i = 0; i < string.length; i++) {
    value *= 16;
    value += hexValues.indexOf(string[i]);
  }
  return value;
}
function getRandom(range, center = 0){
  const seed = Math.pow(Math.random(), 2.4) / 2;
  return (Math.random() > 0.5? 1 : -1) * seed * range + center;
}