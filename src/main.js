//Loads and initiates required modules
const { app, BrowserWindow, powerSaveBlocker } = require('electron'),
	path = require('path'),
	url = require('url');

let win;

const createWindow = () => {
	win = new BrowserWindow({
		width: 1000, height: 700, 'minWidth': 700, 'minHeight': 500, name: 'Music Player', webPreferences: {
			contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            enableRemoteModule: true,
            devTools: true
		}
	});

	win.setMenuBarVisibility(false);

	win.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

	//win.setMenu(null);

	const id = powerSaveBlocker.start('prevent-app-suspension');

	win.once('ready-to-show', () => {
		win.show()
	});

	win.on('closed', () => {
		powerSaveBlocker.stop(id)
		win = null
	});
}

app.on('ready', createWindow);