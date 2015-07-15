var PROMGRAMMER = PROMGRAMMER || {};

PROMGRAMMER.addresses = 8192;
PROMGRAMMER.bytes = [];

PROMGRAMMER.newFile = function() {
    this.bytes = [];
    for(i = 0; i < this.addresses; i++) {
        this.bytes.push(00);
    }
};

PROMGRAMMER.charCode = function(b) {
    if(b >= 33) {
        return String.fromCharCode(b);
    } else {
        return ".";
    }
};

PROMGRAMMER.decToHex = function(dec, digits, prefix) {
    digits = typeof digits !== 'undefined' ? digits : 0;
    prefix = typeof prefix !== 'undefined' ? prefix : false;
    var hex = dec.toString(16);
    while(hex.length < digits) {
        hex = "0" + hex;
    }
    if(prefix) return "0x" + hex; else return hex;
};


$(window).load(function() {
    PROMGRAMMER.newFile();
    PROMGRAMMER.displayBytes(PROMGRAMMER.bytes);
});
