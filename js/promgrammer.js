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

/**
 * @function
 * Scrolls the editor if the cursor leaves the visible screen.
 * @param {Object} selectedByte - The currently selected byte.
 * @param {number} selectedByte.b - The byte number.
 * @param {boolean} selectedByte.hex - Wether the the selected byte is on the hex editor (true) or the character map (false).
 * @param {number} selectedByte.charsEntered - The number of chars entered to the byte.
 * */
PROMGRAMMER.scrollEditor = function(selection) {
    if(Math.floor(($('#editor').height() + $('#editor').scrollTop()) / 19) < Math.floor(selection.b / 16) + 1) {
        $('#editor').scrollTop(Math.ceil(19*(selection.b / 16 + 1) - $('#editor').height() + 1));
    } else if(Math.floor($('#editor').scrollTop() / 19 + 1) > selection.b / 16) {
        $('#editor').scrollTop((19*Math.floor(selection.b / 16) - 1));
    }
};

/**
 * @function
 * Edits the selected byte.
 * @param {number[]} bytes - The byte array.
 * @param {Object} selectedByte - The currently selected byte.
 * @param {number} selectedByte.b - The byte number.
 * @param {boolean} selectedByte.hex - Wether the the selected byte is on the hex editor (true) or the character map (false).
 * @param {number} selectedByte.charsEntered - The number of chars entered to the byte.
 * @param {number} charCode - The entered character code.
 */
PROMGRAMMER.editByte = function(bytes, selectedByte, charCode) {
    if(selectedByte.hex) {
        if((event.which >= 48 && event.which <= 57) || (event.which >= 97 && event.which <= 102) || (event.which >= 65 && event.which <= 70)) {
            bytes[selectedByte.b] = parseInt(PROMGRAMMER.decToHex(bytes[selectedByte.b], 2, false).charAt(1) + String.fromCharCode(charCode), 16);
            selectedByte.charsEntered++;
        }
    } else {
        bytes[selectedByte.b] = charCode;
        selectedByte.charsEntered = 2;
    }
    $('span.byte[data-byte="' + selectedByte.b + '"]').html(PROMGRAMMER.decToHex(bytes[selectedByte.b], 2, false));
    $('span.charByte[data-byte="' + selectedByte.b + '"]').html(PROMGRAMMER.byteToChar(bytes[selectedByte.b]));

    if(selectedByte.charsEntered === 2) {
        if(selectedByte.b < bytes.length - 1) {
            PROMGRAMMER.selectByte(selectedByte.b + 1, selectedByte.hex, selectedByte);
        } else {
            selectedByte.charsEntered = 0;
        }
    }
};

/**
 * @funciton
 * Loads an array of bytes to the editor, waiting first for the array to be completely filled.
 * @param {number[]} bytes - The array of bytes to load.
 * @param {Object} selectedByte - The currently selected byte.
 * @param {number} selectedByte.b - The byte number.
 * @param {boolean} selectedByte.hex - Wether the the selected byte is on the hex editor (true) or the character map (false).
 * @param {number} selectedByte.charsEntered - The number of chars entered to the byte.
 * @param {number} addresses - The length the array should have.
 */
PROMGRAMMER.displayBytes = function(bytes, selectedByte, addresses) {
    var timeout = setInterval(function() {if(bytes.length === addresses) {clearInterval(timeout); isFinished = true;}}, 100);
    $('#map').empty();
    $('#hex').empty();
    $('#offset').empty();
    var offset = 0;
    for(i = 0; i < bytes.length; i++) {
        if( i > 0) {
            $('<span class="byte" data-byte="' + i + '" onclick="PROMGRAMMER.selectByte(' + i + ', true, PROMGRAMMER.selection)">' + PROMGRAMMER.decToHex(bytes[i], 2) + '</span>').appendTo('#hex');
            $('<span class="charByte" data-byte="' + i + '" onclick="PROMGRAMMER.selectByte(' + i + ', false, PROMGRAMMER.selection)">' + PROMGRAMMER.byteToChar(bytes[i]) + '</span>').appendTo('#map');
        } else {
            $('<span class="byte selected cursor" data-byte="' + i + '" onclick="PROMGRAMMER.selectByte(' + i + ', true, PROMGRAMMER.selection)">' + PROMGRAMMER.decToHex(bytes[i], 2) + '</span>').appendTo('#hex');
            $('<span class="charByte selected" data-byte="' + i + '" onclick="PROMGRAMMER.selectByte(' + i + ', false, PROMGRAMMER.selection)">' + PROMGRAMMER.byteToChar(bytes[i]) + '</span>').appendTo('#map');
            PROMGRAMMER.selectByte(0, true, selectedByte);
        }
        if((i + 1) % 16 == 1) {
            $('<div>' + PROMGRAMMER.decToHex(offset, 4, true) + '</div>').appendTo('#offset');
        } else if((i + 1) % 16 == 0) {
            $('<br />').appendTo('#hex');
            $('<br />').appendTo('#map');
        } else if((i + 1) % 8 == 0) {
            $('<span class="separation">&nbsp;</span>').appendTo('#hex');
        }
        offset++;
    }
};

/**
 * @function
 * Selects the byte that was clicked and unselects the previously selected one.
 * @param {number} b - The selected byte number.
 * @param {boolean} hex - Wether the selection is on the hex editor (true) or the character map (false).
 * @param {Object} previouSelection - The previously selected byte.
 * @param {number} previousSelection.b - The byte number.
 * @param {boolean} previousSelection.hex - Wether the the selection was on the hex editor (true) or the character map (false).
 * @param {number} previousSelection.charsEntered - The number of chars entered to the byte.
 * @TODO Scroll if the byte is out of view.
 */
PROMGRAMMER.selectByte = function(b, hex, previousSelection) {
    /*
     * Deselect the previous selection.
     */
    if(previousSelection.hex) {
        $('span.byte[data-byte="' + previousSelection.b + '"]').toggleClass("selected cursor");
        $('span.charByte[data-byte="' + previousSelection.b + '"]').toggleClass("selected");
    } else {
        $('span.byte[data-byte="' + previousSelection.b + '"]').toggleClass("selected");
        $('span.charByte[data-byte="' + previousSelection.b + '"]').toggleClass("selected cursor");
    }

    /*
     * Select the clicked byte.
     */
    if(hex) {
        $('span.byte[data-byte="' + b + '"]').toggleClass("selected cursor");
        $('span.charByte[data-byte="' + b + '"]').toggleClass("selected");
    } else {
        $('span.byte[data-byte="' + b + '"]').toggleClass("selected");
        $('span.charByte[data-byte="' + b + '"]').toggleClass("selected cursor");
    }

    /*
     * Update the selection.
     */
    previousSelection.b = b;
    previousSelection.hex = hex;
    previousSelection.charsEntered = 0;
    PROMGRAMMER.scrollEditor(previousSelection);
    PROMGRAMMER.updateStatusSelection(previousSelection);
};

/**
 * Callback for the PROMGRAMMER.serialPort.list function.
 */
PROMGRAMMER.listPorts = function(err, ports) {
    PROMGRAMMER.ports = [];
    $('#portList').empty();
    if(typeof ports !== 'undefined') {
        ports.forEach(function(port) {
            PROMGRAMMER.ports.push(port.comName);
            $('<option>' + port.comName + '</option>').appendTo('#portList');
        });
    } else {
        PROMGRAMMER.ports.push("No serial ports available");
        $('<option>' + "No serial ports available" + '</option>').appendTo('#portList');
    }
};

/**
 * @function
 * This function is called by the New File button.
 */
PROMGRAMMER.newFileButton = function() {
    PROMGRAMMER.setStatusMessage('Creating new file...');
    PROMGRAMMER.bytes = PROMGRAMMER.newFile(PROMGRAMMER.addresses);
    PROMGRAMMER.displayBytes(PROMGRAMMER.bytes, PROMGRAMMER.selection, PROMGRAMMER.addresses);
    PROMGRAMMER.setStatusMessage('New file created.');
};

/**
 * @function
 * This function is called by the Save File button.
 */
PROMGRAMMER.saveFileButton = function() {
    PROMGRAMMER.setStatusMessage('Saving file...');
    PROMGRAMMER.writeFile(
        PROMGRAMMER.dialog.showSaveDialog(PROMGRAMMER.remote.getCurrentWindow(),
            {
                title: "Save Hex File As...",
                defaultPath: require('path').join(require('fs-plus').getHomeDirectory(), "ROM.bin")
            }
        ), 
        PROMGRAMMER.bytesToString(PROMGRAMMER.bytes)
    );
    PROMGRAMMER.setStatusMessage('File saved.');
};

/**
 * @function
 * This function is called by the Open File buton.
 */
PROMGRAMMER.openFileButton = function() {
    PROMGRAMMER.setStatusMessage('Reading file...');
    PROMGRAMMER.dialog.showOpenDialog(
        PROMGRAMMER.remote.getCurrentWindow(),
        {
            title: "Open Hex File...",
            defaultPath: require('path').join(require('fs-plus').getHomeDirectory()),
            properties: ['openFile']
        },
        function(filenames) {
            var fs = require('fs');
            fs.readFile(
                filenames[0],
                {},
                function(err, data) {
                    PROMGRAMMER.bytes = PROMGRAMMER.stringToBytes(data.toString(), PROMGRAMMER.addresses, 0);
                    PROMGRAMMER.displayBytes(PROMGRAMMER.bytes, PROMGRAMMER.selection, PROMGRAMMER.addresses);
                }
            );
        }
    );
    PROMGRAMMER.setStatusMessage('File read.');
};

/**
 * @function
 * Updates the selected byte on the statusbar.
 * @param {Object} selection - The currently selected byte.
 * @param {number} selection.b - The byte number.
 * @param {boolean} selection.hex - Wether the the selected byte is on the hex editor (true) or the character map (false).
 */
PROMGRAMMER.updateStatusSelection = function(selection) {
    $('#statusSelection').html('Byte: ' + PROMGRAMMER.decToHex(selection.b, 4, true) + ' (' + (selection.hex ? 'H' : 'C') + ')');
};

/**
 * @function
 * Sets the message on the statusbar.
 * @param {string} message - The message to display.
 */
PROMGRAMMER.setStatusMessage = function(message) {
    $('#statusMessage').html(message);
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

/*
 * Window resize event handler.
 */
$(window).resize(function(){
    $('#editor').css('height', $(window).height() - 82);
    $('#toolbar').css('height', $(window).height() - 82);
});

/*
 * Keypress (a character was entered) event handler.
 */
$(document).keypress(function(event) {
    PROMGRAMMER.editByte(PROMGRAMMER.bytes, PROMGRAMMER.selection, event.which);
});

/*
 * Keydown (a key was pressed, character or not) event handler.
 */
$(document).keydown(function(event) {
    if(event.which === 32) {
        event.preventDefault();
        PROMGRAMMER.editByte(PROMGRAMMER.bytes, PROMGRAMMER.selection, 32);
    } else if(event.which === 38) {
        if(PROMGRAMMER.selection.b - 16 >= 0) PROMGRAMMER.selectByte(PROMGRAMMER.selection.b - 16, PROMGRAMMER.selection.hex, PROMGRAMMER.selection);
        event.preventDefault();
    } else if(event.which === 40) {
        if(PROMGRAMMER.selection.b + 16 < PROMGRAMMER.bytes.length) PROMGRAMMER.selectByte(PROMGRAMMER.selection.b + 16, PROMGRAMMER.selection.hex, PROMGRAMMER.selection);
        event.preventDefault();
    } else if(event.which === 37) {
        if(PROMGRAMMER.selection.b - 1 >= 0) PROMGRAMMER.selectByte(PROMGRAMMER.selection.b - 1, PROMGRAMMER.selection.hex, PROMGRAMMER.selection);
        event.preventDefault();
    } else if(event.which === 39) {
        if(PROMGRAMMER.selection.b + 1 < PROMGRAMMER.bytes.length) PROMGRAMMER.selectByte(PROMGRAMMER.selection.b + 1, PROMGRAMMER.selection.hex, PROMGRAMMER.selection);
        event.preventDefault();
    }
});

