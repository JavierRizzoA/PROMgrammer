var PROMGRAMMER = PROMGRAMMER || {};

$(window).resize(function(){
    $('#editor').css('height', $(window).height() - 87);
    $('#toolbar').css('height', $(window).height() - 87);
});

PROMGRAMMER.displayBytes = function(bytes) {
    var offset = 0;
    for(i = 0; i < bytes.length; i++) {
        $('<span class="byte">' + PROMGRAMMER.decToHex(bytes[i], 2) + '</span>').appendTo('#hex');
        $('<span class="charByte">' + PROMGRAMMER.charCode(bytes[i]) + '</span>').appendTo('#map');
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
