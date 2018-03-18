const electron = require('electron')
const ipc = electron.ipcMain
const app = electron.app
const BrowserWindow = electron.BrowserWindow
let win;
app.on('ready', function() {
  win = new BrowserWindow();
  win.loadURL(`file://${__dirname}/homewindow.html`);
  win.maximize();
})
