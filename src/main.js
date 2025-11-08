const { app, Menu, BrowserWindow, ipcMain, Tray } = require('electron');
const path = require('path');
const { createSuspensionWindow, createWebsiteWindow } = require("./window.js")


// 悬浮球的一些设置
const suspensionConfig = {
  width: 85,
  height: 50,
}


// 定义所有可能用到的页面
const pages = {
  suspensionWin: undefined,
  websiteWin: undefined
}

let tray;
let suspensionVisible = true;
let rotateFlag = true;
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  pages.suspensionWin = createSuspensionWindow(suspensionConfig)
  // 创建托盘图标及其菜单
  tray = new Tray(path.join(__dirname, './assets/chat.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示应用',
      click: () => {
        pages.websiteWin.show();
      }
    },
    {
      label: '隐藏/显示悬浮球',
      click: () => {
        if (suspensionVisible) {
          pages.suspensionWin.hide();
        } else {
          pages.suspensionWin.show();
        }
        suspensionVisible = !suspensionVisible;
      }
    },
    {
      label: '退出',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('我的应用');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (pages.websiteWin) {
      if (pages.websiteWin.isDestroyed()) {
        pages.websiteWin = null
      }
    }
    if (pages.websiteWin) {
      pages.websiteWin.isVisible() ? pages.websiteWin.hide() : pages.websiteWin.show();
    } else {
      pages.websiteWin = createWebsiteWindow();
      pages.websiteWin.show();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    pages.suspensionWin = createSuspensionWindow(suspensionConfig)
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// 主进程监听事件相关





ipcMain.on('showWebsite', (e, data) => {
  if (pages.websiteWin) {
    if (pages.websiteWin.isDestroyed()) {
      pages.websiteWin = null
    }
  }
  if (pages.websiteWin) {
    if (pages.websiteWin.isVisible()) {
      pages.websiteWin.hide()
    } else {
      pages.websiteWin.show()
    }
  } else {
    pages.websiteWin = createWebsiteWindow()
    // pages.websiteWin.on('close', (e, data) => {
    //   pages.websiteWin = null
    // })
    pages.websiteWin.show()
  }
  // pages.websiteWin = createWebsiteWindow()
  // pages.websiteWin.on('close', (e, data) => {
  //   pages.websiteWin = null
  // })
})

ipcMain.on('ballWindowMove', (e, data) => {
  pages.suspensionWin.setBounds({ x: data.x, y: data.y, width: suspensionConfig.width, height: suspensionConfig.height })
  // pages.floatWin.setPosition(data.x, data.y)
})

// 处理窗口控制按钮的事件
ipcMain.on('window-control', (event, action) => {
  switch (action) {
    case 'minimize':
      pages.websiteWin.minimize();
      break;
    case 'maximize':
      pages.websiteWin.isMaximized() ? pages.websiteWin.unmaximize() : pages.websiteWin.maximize();
      break;
    case 'close':
      pages.websiteWin.close();
      pages.websiteWin = null;
      break;
  }
});

// 处理窗口尺寸调整
ipcMain.on('resize-window', (event, size) => {
  if (size === 'wide') {
    pages.websiteWin.setSize(640, 480);
  } else if (size === 'tall') {
    pages.websiteWin.setSize(400, 730);
    //左上角
    pages.websiteWin.setPosition(0, 0);
  }
});

let suspensionMenu
let topFlag = true
ipcMain.on('openMenu', (e) => {
  if (!suspensionMenu) {
    suspensionMenu = Menu.buildFromTemplate([
      {
        label: '置顶/取消',
        click: () => {
          topFlag = !topFlag
          pages.suspensionWin.setAlwaysOnTop(topFlag)
        }
      },
      {
        label: '旋转/暂停',
        click: () => {
          rotateFlag = !rotateFlag;
          pages.suspensionWin.webContents.send('toggle-rotate', rotateFlag);
        },
      },
      {
        label: '重启',
        click: () => {
          app.quit()
          app.relaunch()
        }
      },
      {
        label: '退出',
        click: () => {
          app.quit();
        }
      },
    ]);
  }
  suspensionMenu.popup({});
});

ipcMain.on('setFloatIgnoreMouse', (e, data) => {
  pages.suspensionWin.setIgnoreMouseEvents(data, { forward: true })
})