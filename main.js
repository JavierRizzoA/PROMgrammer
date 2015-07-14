var app = require('app');
var BrowserWindow = require('browser-window');

require('crash-reporter')

var mainWindow = null;

app.on('window-all-closed', function() {
    if(process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    mainWindow = new BrowserWindow({width: 800, height: 600, "web-preferences": {"overlay-scrollbars": true}});
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
