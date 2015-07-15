var PROMGRAMMER = PROMGRAMMER || {};

/*
 * How many addresses (bytes) has the EEPROM.
 * 8192 as the default, for the 28C64.
 */
PROMGRAMMER.addresses = 8192;

/*
 * An array representation of all the bytes of the EEPROM.
 */
PROMGRAMMER.bytes = [];

/*
 * Which byte is being edited.
 * b = the number of the byte being edited (-1 being none).
 * hex = wether it is being edited in hex mode (true) or map mode (false).
 */
PROMGRAMMER.editing = {b: -1, hex: true};

/**
 * @function
 * Creates a new array of bytes.
 * @param {number} addresses - The length of the array (8192 by default).
 * @param {number} defaultValue - The value to initialize each item (0 by default).
 * @returns {nuber[]} the byte array of length 'addresses' and values 'defaultValue'.
 */
PROMGRAMMER.newFile = function(addresses, defaultValue) {
    addresses = typeof addresses !== 'undefined' ? addresses : 8192;
    defaultValue = typeof defaultValue !== 'undefined' ? defaultValue : 0;
    var bytes = [];
    for(i = 0; i < addresses; i++) {
        bytes.push(defaultValue);
    }
    return bytes;
};

/**
 * @function
 * Converts a number to its ASCII char, or to '.' if the char is not printable.
 * @param {number} b - The byte to convert.
 * @returns {string} The ASCII representation of b, or '.' if b is not a printable character.
 */
PROMGRAMMER.byteToChar = function(b) {
    if(b >= 33) {
        return String.fromCharCode(b);
    } else {
        return '.';
    }
};

/**
 * @function
 * Convers a decimal number to hexadecimal.
 * @param {number} dec - The number to convert.
 * @param {number} digits - The minimum number of digits for the result; it adds 0s to the left if the number is smaller (0 by default).
 * @param {boolean} prefix - Wether or not to add '0x' at the left (false by default).
 * @returns {string} The hexadecimal representation of the decimal number.
 */
PROMGRAMMER.decToHex = function(dec, digits, prefix) {
    digits = typeof digits !== 'undefined' ? digits : 0;
    prefix = typeof prefix !== 'undefined' ? prefix : false;
    var hex = dec.toString(16);
    while(hex.length < digits) {
        hex = "0" + hex;
    }
    hex = hex.toUpperCase();
    if(prefix) return "0x" + hex; else return hex;
};

/*
 * To do when the window finishes loading.
 */
$(window).load(function() {
    PROMGRAMMER.bytes = PROMGRAMMER.newFile(PROMGRAMMER.addresses);
    PROMGRAMMER.displayBytes(PROMGRAMMER.bytes);
});
