var PROMGRAMMER = PROMGRAMMER || {};

/*
 * How many characters have been entered while editing the same byte.
 */
PROMGRAMMER.charsEntered = 0;

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
    //TODO
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
            selectedByte.b = 0;
            selectedByte.hex = true;
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
 * This function is called by the Save File button.
 */
PROMGRAMMER.saveFileButton = function() {
    PROMGRAMMER.writeFile(
        PROMGRAMMER.dialog.showSaveDialog(PROMGRAMMER.remote.getCurrentWindow(),
            {
                title: "Save Hex File As...",
                defaultPath: require('path').join(require('fs-plus').getHomeDirectory(), "ROM.bin")
            }
        ), 
        PROMGRAMMER.bytesToString(PROMGRAMMER.bytes)
    );
};

/**
 * @function
 * This function is called by the Open File buton.
 */
PROMGRAMMER.openFileButton = function() {
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
};
