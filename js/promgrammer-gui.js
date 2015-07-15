var PROMGRAMMER = PROMGRAMMER || {};

/*
 * To do when the window is resized.
 */
$(window).resize(function(){
    $('#editor').css('height', $(window).height() - 82);
    $('#toolbar').css('height', $(window).height() - 82);
});

/**
 * @funciton
 * Loads an array of bytes to the editor.
 * @param {number[]} bytes - The array of bytes to load.
 * @todo Remove all children from the editor first.
 */
PROMGRAMMER.displayBytes = function(bytes) {
    var offset = 0;
    for(i = 0; i < bytes.length; i++) {
        if( i > 0) {
            $('<span class="byte" data-byte="' + i + '" onclick="PROMGRAMMER.editing = PROMGRAMMER.selectByte(' + i + ', true, PROMGRAMMER.editing)">' + PROMGRAMMER.decToHex(bytes[i], 2) + '</span>').appendTo('#hex');
            $('<span class="charByte" data-byte="' + i + '" onclick="PROMGRAMMER.editing = PROMGRAMMER.selectByte(' + i + ', false, PROMGRAMMER.editing)">' + PROMGRAMMER.byteToChar(bytes[i]) + '</span>').appendTo('#map');
        } else {
            $('<span class="byte selected cursor" data-byte="' + i + '" onclick="PROMGRAMMER.editing = PROMGRAMMER.selectByte(' + i + ', true, PROMGRAMMER.editing)">' + PROMGRAMMER.decToHex(bytes[i], 2) + '</span>').appendTo('#hex');
            $('<span class="charByte selected" data-byte="' + i + '" onclick="PROMGRAMMER.editing = PROMGRAMMER.selectByte(' + i + ', false, PROMGRAMMER.editing)">' + PROMGRAMMER.byteToChar(bytes[i]) + '</span>').appendTo('#map');
            this.editing = {b: 0, hex: true};
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
 * @returns {Object} newSelection - The new selected byte.
 * @returns {number} newSelection.b - The new selected byte number.
 * @returns {boolean} newSelection.hex - Wether the new selection is on the hex editor (true) or the character map (false).
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

    return {b: b, hex: hex};
};
