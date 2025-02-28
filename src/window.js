const { BrowserWindow, screen } = require('electron');
const path = require('path');

// 悬浮球
const createSuspensionWindow = (suspensionConfig) => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: suspensionConfig.width,
    height: suspensionConfig.height,
    type: 'toolbar',
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'views/FloatBall/index.html'));
  const { left, top } = { left: screen.getPrimaryDisplay().workAreaSize.width - 150, top: screen.getPrimaryDisplay().workAreaSize.height - 100 }
  // mainWindow.setBounds({ x: left, y: top, width: suspensionConfig.width, height: suspensionConfig.height })
  win.setPosition(left, top)
  // mainWindow.setIgnoreMouseEvents(true, { forward: true })
  // win.webContents.openDevTools({mode:'detach'})

  return win
};
const createWebsiteWindow = () => {
  win = new BrowserWindow({
    width: 640,
    height: 480,
    minWidth: 325,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      frame: false,
      transparent: true,
      zoomFactor: 0.75,

    },
    alwaysOnTop: true,
    frame: false,
  });

  win.loadFile(path.join(__dirname, 'views/Website/index.html')); // 加载本地HTML文件

  win.on('maximize', () => {
    win.webContents.send('window-state', 'maximized');
  });

  win.on('unmaximize', () => {
    win.webContents.send('window-state', 'normal');
  });

  // 最小化到托盘
  win.on('minimize', (event) => {
    event.preventDefault();
    win.hide();
  });

  // 关闭窗口时隐藏到托盘
  win.on('close', (event) => {
    // if (!app.isQuiting) {
    //   event.preventDefault();
    //   win.hide();
    // }
    win.close();
    win = null;
  });

  win.setAlwaysOnTop(true);
  return win
}

module.exports = {
  createSuspensionWindow,
  createWebsiteWindow,
}