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
 * charsEntered = the number of chars entered to the byte.
 */
PROMGRAMMER.selection = {b: 0, hex: true, charsEntered: 0};

PROMGRAMMER.serialPort = require('serialport');

PROMGRAMMER.communicationPort = null;

PROMGRAMMER.ports = [];

PROMGRAMMER.remote = require('remote');

PROMGRAMMER.dialog = PROMGRAMMER.remote.require('dialog');

PROMGRAMMER.romTypes = ['28C64'];

PROMGRAMMER.baudRates = [300, 600, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];

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
 * @param {number} digits - The minimum number of digits for the result; it adds 0s to the left if the number is smaller (0 by default, no preceding 0s).
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

/**
 * @function
 * Converts the array of bytes to a string.
 * @param {number[]} bytes - The array of bytes.
 * @returns {string} The string of bytes.
 */
PROMGRAMMER.bytesToString = function(bytes) {
    var str = "";
    for(c in bytes) {
        str += String.fromCharCode(bytes[c]);
    }
    return str;
};

/**
 * @function
 * Converts the string to an array of bytes.
 * @param {string} str - The string to convert.
 * @param {number} addresses - The number of addresses of the EEPROM (and thus, the length of the array of bytes).
 * @param {number} defaultValue - The default value to add to the array if str is smaller. 0 by default.
 * @returns {number[]} The array of bytes.
 */
PROMGRAMMER.stringToBytes = function(str, addresses, defaultValue) {
    defaultValue = typeof defaultValue !== 'undefined' ? defaultValue : 0;
    var bytes = [];
    if(str.length < addresses) {
        for(i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i));
        }
        for(i = 0; i < addresses - str.length; i++) {
            bytes.push(defaultValue);
        }
    } else {
        for(i = 0; i < addresses; i++) {
            bytes.push(str.charCodeAt(i));
        }
    }
    return bytes;
};

/**
 * @function
 * Writes the data to a file 'filename'.
 * @param {string} filename - The file to write.
 * @param {string} data - The data to write.
 * @TODO Handle exceptions.
 */
PROMGRAMMER.writeFile = function(filename, data) {
    fs = require('fs');
    fs.writeFile(filename, data);
};

/**
 * @function
 * Reads a file.
 * @param {string} filename - The file to read.
 * @returns {string} The contents of the file.
 * @TODO Handle exceptions.
 */
PROMGRAMMER.readFile = function(filename) {
    fs = require('fs');
    return fs.readFileSync(filename);
};

/*
 * To do when the window finishes loading.
 */
$(window).load(function() {
    PROMGRAMMER.setStatusMessage('Welcome to PROMgrammer.');
    PROMGRAMMER.bytes = PROMGRAMMER.newFile(PROMGRAMMER.addresses);
    PROMGRAMMER.displayBytes(PROMGRAMMER.bytes, PROMGRAMMER.selection, PROMGRAMMER.addresses);
    PROMGRAMMER.romTypes.forEach(function(rom) {$('<option>' + rom + '</option>').appendTo('#romTypeList');});
    PROMGRAMMER.baudRates.forEach(function(baudRate) {$('<option>' + baudRate + '</option>').appendTo('#baudRateList');});
    $('#baudRateList').val(9600);
    PROMGRAMMER.serialPort.list(PROMGRAMMER.listPorts);
});
