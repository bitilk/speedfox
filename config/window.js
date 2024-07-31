const MAIN_WINDOW_CONFIG = {
  width: 1000,
  height: 700,
  frame: false, // 隐藏窗口的标题栏
  transparent: true,// 透明窗口
  show:false, // 隐藏窗口
  // 窗口可调整大小
  resizable: false,
  autoHideMenuBar: true, // 自动隐藏菜单栏
  fullscreenable: false, // 禁止f11全屏
  webPreferences: {
    nodeIntegration: true, // 允许在渲染进程中使用 Node.js
    contextIsolation: false, // 取消上下文隔离
    enableRemoteModule: true, // 允许使用 remote 模块（如果需要）
    allowRunningInsecureContent: true, // 允许不安全的内容运行
    webSecurity:false
  }
};
const LOAD_WINDOW_CONFIG = {
  width: 600,
  height: 600,
  transparent: true,// 透明窗口
  frame: false, // 隐藏窗口的标题栏
  show: false, // 隐藏窗口
  // 窗口可移动
  movable: true,
  // 窗口可调整大小
  resizable: false,
  // 窗口不能最小化
  minimizable: false,
  // 窗口不能最大化
  maximizable: false,
  // 窗口不能进入全屏状态
  fullscreenable: false,
  // 窗口不能?关闭
  closable: true,

  autoHideMenuBar: true, // 自动隐藏菜单栏
  webPreferences: {
    nodeIntegration: true, // 允许在渲染进程中使用 Node.js
    contextIsolation: false, // 取消上下文隔离
    enableRemoteModule: true, // 允许使用 remote 模块（如果需要）
    webSecurity: false
  }
};

const TIPS_WINDOW_CONFIG = {
  width: 340,
  height: 95,
  x: 0,
  y: 150,
  transparent: true,// 透明窗口
  frame: false, // 隐藏窗口的标题栏
  show:false, // 隐藏窗口
  // 窗口可移动
  movable: true,
  // 窗口可调整大小
  resizable: false,
  // 窗口不能最小化
  minimizable: false,
  // 窗口不能最大化
  maximizable: false,
  // 窗口不能进入全屏状态
  fullscreenable: false,
  // 窗口不能关闭
  closable: true,

  alwaysOnTop: true,// 最顶层

  autoHideMenuBar: true, // 自动隐藏菜单栏
  webPreferences: {
    nodeIntegration: true, // 允许在渲染进程中使用 Node.js
    contextIsolation: false, // 取消上下文隔离
    enableRemoteModule: true, // 允许使用 remote 模块（如果需要）
    webSecurity:false
  }
};

module.exports = {MAIN_WINDOW_CONFIG, LOAD_WINDOW_CONFIG, TIPS_WINDOW_CONFIG};
