localesPath = process.cwd()

silent = false; // 静默启动

console.log("启动参数(ALL)" , process.argv)
process.argv.forEach(function (item, index, array) {
	console.log("启动参数" , item)
  // 检测是否有工作目录，有就听程序给的  workingdirectory="C:\Path\To\Your\Folder"
  if(item.includes("-workingdirectory")){
    argv = item.split("=");
    console.log("workingdirectory" , argv[1])
    localesPath = argv[1]
  }
  // 检测是否有静默启动，如果有就悄悄启动
  if(item.includes("-silent")){
    silent = true;
  }

})



const { app, BrowserWindow, Tray, Menu , ipcMain ,dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const app_config = require(path.join(localesPath, "resources\\config.json"));
const net = require('net');
const { spawn,exec } = require('child_process');
const request = require('request');
const os = require('os');
const { autoUpdater } = require('electron-updater');
const { log } = require('console');


const appVersion = app.getVersion();

// 请勿随意更新版基座本号，否则渲染层网页无法自动识别基座本号，导致新功能无法使用
const Framework = {
  version : appVersion, // 基座版本号
}


//将utf-8编码的字符转换为gbk编码的字符
function utf8toGbk(word) {
  var encoder = new TextEncoder('gbk');
  var decoder = new TextDecoder('utf-8');
  var data = encoder.encode(word);
  var result = decoder.decode(data);
  return result;
}

//将gbk编码的字符转换为utf-8编码的字符
function gbktoUtf8(word) {
  var encoder = new TextEncoder('utf-8');
  var decoder = new TextDecoder('gbk');
  var data = encoder.encode(word);
  var result = decoder.decode(data);
  return result;
}



// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // 可以在这里记录日志或进行其他处理
});

// console.log(app_config);
// 创建文件夹





// 保存原始的 console.log 函数
const originalConsoleLog = console.log;
// 重写 console.log 函数
console.log = function(...args) {
    // 获取当前本地时间的字符串
    const timestamp = new Date().toLocaleString('zh-CN', { hour12: false });
    // 创建一个新的 Error 对象，获取当前堆栈信息
    const stack = (new Error()).stack.split('\n');
    
    // 提取第二行的堆栈信息（第一行是错误信息，第二行是调用点）
    const stackInfo = stack[2].trim();
    
    // 正则匹配文件名和行号
    const matchResult = stackInfo.match(/\((.*):(\d+):\d+\)$/);
    let location = 'unknown location';
    if (matchResult) {
        location = `${matchResult[1]}:${matchResult[2]}`;
    }
    // 在所有日志前加上时间戳和行号
    // originalConsoleLog.apply(console, [`[${timestamp}] [${location}]`, ...args]);
    originalConsoleLog.apply(console, [`[${timestamp}] `, ...args]);
};


// 写入文件
function Fox_writeFile(filePath,textToWrite) {
  fs.writeFile(filePath, textToWrite, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return;
    }
    // console.log('Text has been written to', filePath);
  });
}


// 开启 开机自启动
ipcMain.on('openAutoStart',()=>{
  app.setLoginItemSettings({
    openAtLogin: true, // 如果用户选择在启动时打开应用，则设置为 true
    openAtLoginOptions: {
      // 写开机启动
      path: '"'+app.getPath('exe')+'" -workingdirectory="' + localesPath + '" -silent',
    }
  })
});


// 关闭 开机自启动
ipcMain.on('closeAutoStart',()=>{
  app.setLoginItemSettings({
    openAtLogin: false
  })
})



 // 测试延迟
const sockets = {};
function testLatency(host, port, timeout, callback) {
  const startTime = Date.now();
  const socket = net.createConnection({ host, port });
  sockets[host] = socket; // 使用编号作为键，存储连接对象

  sockets[host].on('connect', () => {
      const latency = Date.now() - startTime;
      socket.destroy(); // 关闭连接
      callback(null, latency ,  host, port,);
  });

  sockets[host].on('error', (err) => {
      callback(err, "unknown" , host, port);
  });
}


// 路由测试
function traceRoute(host) {
    const cmd = `tracert -d -w 100 -h 20 ${host}`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {

      } else {
        console.log(`${stdout} --`);

        const input = stdout.trim().split('\n');
        
        // Function to check if a line contains traceroute data
        function isTracerouteLine(line) {
          return /^\s*\d+\s/.test(line);
        }

        const tracerouteResults = input.filter(isTracerouteLine);

        const tracerouteJson = tracerouteResults.map(line => {
          const parts = line.trim().replace(/ms/g, '').split(/\s+/);
          return {
            hop: parseInt(parts[0]),
            time1: parts[1].trim(),
            time2: parts[2].trim(),
            time3: parts[3].trim(),
            ip: parts[4]
          };
        });

        console.log(JSON.stringify(tracerouteJson, null, 2));
        
        

      }
    });
}




// 单例模式（只启动一个程序）
const gotTheLock = app.requestSingleInstanceLock()

// 丝滑结束进程小连招
taskkillall()
function taskkillall() {
  taskkill("SpeedNet.exe")
  taskkill("SpeedNet_V2.exe")
  taskkill("SpeedProxy.exe")
  taskkill("SpeedMains.exe")
  taskkill("SpeedFox.tun2socks.exe")
  taskkill("sniproxy.exe")
  taskkill("SpeedNet_brook.exe")
}

// 监听控制台日志消息并写入文件
// Fox_mkdir('log')


const myAppDataPath = app.getPath('userData');
const logFilePath = path.join(localesPath, 'log/app.log');
const archiveFolderPath = path.join(localesPath, 'log/archives');
const archiveFolderPath_ = path.join(localesPath, 'log');
// 创建归档文件夹（如果不存在）
if (!fs.existsSync(archiveFolderPath_)) {
  fs.mkdirSync(archiveFolderPath_);
}
// 创建归档文件夹（如果不存在）
if (!fs.existsSync(archiveFolderPath)) {
    fs.mkdirSync(archiveFolderPath);
}

// 检测日志文件是否存在
if (fs.existsSync(logFilePath)) {
    // 获取当前时间并格式化为 YYYYMMDD_HHmmss
    const now = new Date();
    const formattedDate = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

    // 构建归档文件名和路径
    const archiveFileName = `log_${formattedDate}.log`;
    const archiveFilePath = path.join(archiveFolderPath, archiveFileName);

    // 拷贝日志文件到归档文件
    fs.copyFileSync(logFilePath, archiveFilePath);
    console.log(`Archived ${logFilePath} to ${archiveFilePath}`);

    // 可选择：删除原始日志文件
    fs.unlinkSync(logFilePath);
} else {
    console.log(`${logFilePath} does not exist.`);
}


const MAX_FOLDER_SIZE = 32 * 1024 * 1024; // 64MB in bytes

// 获取文件夹大小的递归函数
function getFolderSize(folderPath) {
    let totalSize = 0;

    // 同步读取文件夹中的所有文件和子文件夹
    const files = fs.readdirSync(folderPath);

    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            totalSize += stats.size; // 添加文件大小
        } else if (stats.isDirectory()) {
            totalSize += getFolderSize(filePath); // 递归添加子文件夹大小
        }
    });

    return totalSize;
}

// 检查归档文件夹大小
const folderSize = getFolderSize(archiveFolderPath);

console.log(`Size of ${archiveFolderPath}: ${folderSize} bytes`);

// 如果文件夹大小超过限制，则删除整个文件夹
if (folderSize > MAX_FOLDER_SIZE) {
    console.log(`Deleting ${archiveFolderPath} as it exceeds ${MAX_FOLDER_SIZE} bytes.`);

    // 递归删除文件夹及其内容
    fs.rmdirSync(archiveFolderPath, { recursive: true });
} else {
    console.log(`${archiveFolderPath} is within the size limit.`);
}


// 写日志
const logStream = fs.createWriteStream(path.join(localesPath, 'log/app.log'), { flags: 'a' });
process.stdout.write = process.stderr.write = logStream.write.bind(logStream);

let mainWindow;
let loadWindow;
let tipsWindow;
let tray = null;


function createWindow() {
    mainWindow = new BrowserWindow({
      width: app_config.window_config.ui.width,
      height: app_config.window_config.ui.height,
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
    });
  
    mainWindow.loadURL(app_config.app.ui_url + "&product=" + app_config.app.product + "&silent="+silent);
    mainWindow.on('closed', function () {
      logStream.end();
      mainWindow = null;
    });

    loadWindow.on('ready-to-show',()=>{
      loadWindow.webContents.send('Framework', Framework);// 发送基座信息给渲染层
      // mainWindow.show()
    });

    mainWindow.on('close', (event) => {
      if (!app.isQuiting) {
          // event.preventDefault();
          app_exit();
          // mainWindow.hide();
      }
      // return false;
  });

}

// 窗口隐藏显示通信
ipcMain.on('window', (event, arg) => {
  // console.log(arg); // 打印来自渲染进程的消息
  if(arg[0] == "ui"){
    if(arg[1] == "show"){
      mainWindow.show()
      mainWindow.webContents.send('Framework', Framework);// 发送基座信息给渲染层
    }
    if(arg[1] == "hide"){
      mainWindow.hide()
    }
    if(arg[1] == "minimize"){
      mainWindow.minimize()
    }
    if(arg[1] == "openDevTools"){
      mainWindow.webContents.openDevTools()
    }


  }
  if(arg[0] == "load"){
    if(arg[1] == "show"){
      loadWindow.show()
    }else{
      loadWindow.hide()
      loadWindow.close()

    }
  }


  if(arg[0] == "tips"){
    if(arg[1] == "show"){
      tipsWindow.show()
    }else{
      tipsWindow.hide()
    }
  }
  event.reply('reply-window', 'ok');
});



var Tray_is_ok = false
ipcMain.on('Tray', (event, arg) => {
  if(Tray_is_ok){
    return;
  }
  // 创建托盘图标
  Tray_is_ok = true
  tray = new Tray(path.join(localesPath, 'resources/static/logo/'+app_config.app.product+'.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => { mainWindow.show(); } },
    { label: '退出', click: () => { 
      // app.quit(); 
      app_exit()
    } }
  ]);
  // tray.setToolTip(app_config.app.ToolTip);
  tray.setContextMenu(contextMenu);
  
  // 单击托盘图标显示窗口
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
});
function load_Window() {
  loadWindow = new BrowserWindow({
    width: app_config.window_config.load.width,
    height: app_config.window_config.load.height,
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

    autoHideMenuBar: true, // 自动隐藏菜单栏
    webPreferences: {
      nodeIntegration: true, // 允许在渲染进程中使用 Node.js
      contextIsolation: false, // 取消上下文隔离
      enableRemoteModule: true, // 允许使用 remote 模块（如果需要）
      webSecurity:false
    }
  });

  loadWindow.loadFile(path.join(localesPath, app_config.app.load_File));
  loadWindow.on('closed', function () {
    loadWindow = null;
  });
  loadWindow.on('ready-to-show',()=>{
    loadWindow.setSkipTaskbar(true)
    loadWindow.show()
    // loadWindow.setIgnoreMouseEvents(true)
   });
}


function tips_Window(data) {
  tipsWindow = new BrowserWindow({
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
  });

  tipsWindow.loadURL(data.url + "&product=" + app_config.app.product )
  // tipsWindow.loadURL('https://api.jihujiasuqi.com/app_ui/pc/page/tips/tips.php');
  tipsWindow.on('closed', function () {
    tipsWindow = null;
  });
  tipsWindow.on('ready-to-show',()=>{
    tipsWindow.setSkipTaskbar(true)
    tipsWindow.show()
    tipsWindow.setIgnoreMouseEvents(true)
   });


   setTimeout(() => {
    tipsWindow.close();
   }, 1000 * 8);

}



if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// 性能优化
app.commandLine.appendSwitch('disable-gpu-vsync'); // 禁用垂直同步
app.commandLine.appendSwitch('max-gum-fps', '1'); // 设置最大帧率为30
// 合并渲染进程
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('process-per-site');




app.commandLine.appendSwitch('lang', 'en-US');
app.on('ready', () => {
  console.log('路径1',  app.getPath('exe'));
  // console.log('路径2',  path.join(localesPath, '极狐游戏加速器.exe'));
  
  if(!silent){
    load_Window();
  }
  createWindow();
  // tips_Window()// 测试弹窗




  
});


ipcMain.on('speed_tips_Window', (event, arg) => {
  tips_Window(arg)
})


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    // app.quit();
    app_exit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});


function Ping(host , timeout , C ,pingid){

  port = host.split(":")[1];
  host = host.split(":")[0];


  // console.log(`TEST${host}:${port}`);

  testLatency(host, port, timeout , (err, latency) => {
    if (err) {
        console.error('Error:', err);
    } else {
        // console.log(`350  Latency to ${host}:${port} is ${latency}ms`);
        const ping_replydata = {
          ms:latency,
          pingid:pingid,
          res:{
            time:latency,
            host:host
          }
        }
        mainWindow.webContents.send('ping-reply', ping_replydata);
    }
});

  // ping.promise.probe(host, options)
  //     .then(function (res) {
  //         // console.log(`Ping ${host}:`);
  //         // console.log(`  host: ${res.host}`);
  //         // console.log(`  alive: ${res.alive}`);
  //         // console.log(`  time: ${res.time} ms`);
  //         // console.log(`  output: ${res.output}`);
          
  //         const ping_replydata = {
  //           ms:res.time,
  //           pingid:pingid,
  //           res:res
  //         }

  //         // 回复消息
  //         mainWindow.webContents.send('ping-reply', ping_replydata);
  //     })
  //     .catch(function (error) {
  //         console.error('Error:', error);
  //     });


}



function openExternalProgram(program) {
  let command;

  switch (os.platform()) {
    case 'darwin': // macOS
      command = `open -a "${program}"`;
      break;
    case 'win32': // Windows
      command = `start "" "${program}"`;
      break;
    case 'linux': // Linux
      command = `xdg-open "${program}"`;
      break;
    default:
      console.error('Unsupported platform:', os.platform());
      return;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行错误: ${error}`);
      return;
    }
    console.log(`标准输出: ${stdout}`);
    if (stderr) {
      console.error(`标准错误: ${stderr}`);
    }
  });
}

function app_exit() {
  console.log('客户端触发请求关闭！');
  mainWindow.show()
  mainWindow.focus()

  // 直接退出了
  app.isQuiting = true
  app.quit();

  mainWindow.webContents.send('app_', 'exit');
  
  

}

function taskkill(processName) {
  // const processName = 'notepad.exe';

  // 使用 taskkill 命令终止进程
  exec(`taskkill /f /im ${processName}`, (error, stdout, stderr) => {
    if (error) {
      // console.error(`Error executing taskkill: ${error.message}`);
      return;
    }
    if (stderr) {
      // console.error(`taskkill stderr: ${stderr}`);
      return;
    }
    // console.log(`Successfully terminated ${processName}`);
  });
}



function socks_test(tag,test_socks) {
  const socks_test = exec('"' + path.join(localesPath, 'resources\\bin\\curl.exe') + '"' +" --socks5-hostname "+test_socks+" http://www.baidu.com/ -v");
  
  console.log(`[socks_test] TAG: ${tag} - test_socks: ${test_socks}`);

  // 监听子进程的标准错误数据
  socks_test.stderr.on('data', (data) => {
    console.log(`[socks_test] : ${data}`);


    if(data.includes('HTTP/1.1 200 OK')){
      console.log("[socks_test] SOCKS 可用");
      mainWindow.webContents.send('speed_code', {"start":"SOCKS OK","tag":tag});// 发送基座信息给渲染层
    }

    // 链接失败
    if(data.includes("Can't complete")){
      console.log("[socks_test] SOCKS 不可用 socks检测出错,连接失败");
      mainWindow.webContents.send('speed_code', {"start":"SOCKS ERR","msg":"socks检测出错,连接失败","tag":tag});// 发送基座信息给渲染层
    }
    // 链接失败
    if(data.includes("Empty reply from server")){
      console.log("[socks_test] SOCKS 不可用 socks检测出错,主机空回复");
      mainWindow.webContents.send('speed_code', {"start":"SOCKS ERR","msg":"socks检测出错,主机空回复","tag":tag});// 发送基座信息给渲染层
    }
    

  });

}

// 测试ping值
// 监听来自渲染进程的消息
ipcMain.on('ping', (event, arg) => {
  // console.log(arg); // 打印消息

  host = arg.host
  timeout = arg.timeout
  C = arg.C
  pingid = arg.pingid
  Ping(host , timeout , C ,pingid)
});



// 本地服务器速度
ipcMain.on('NET_speed', (event, arg) => {
  request('http://127.114.233.8:16088/metrics', (err, res, body) => {
    if (err) { 
        return console.log(err); 
    }

    // console.log(body);
     mainWindow.webContents.send('NET_speed-reply', body);// 发送基座信息给渲染层
  });
})


// 远程服务器速度
ipcMain.on('NET_speed_server', (event, arg) => {
  request('http://' + arg.ip + '/metrics', (err, res, body) => {
    if (err) { 
        return console.log(err); 
    }

    // console.log(body);
     mainWindow.webContents.send('NET_speed_server-reply', body);// 发送基座信息给渲染层
  });
})



// 写入配置文件
ipcMain.on('speed_code_config', (event, arg) => {
  // console.log(arg); // 打印来自渲染进程的消息

  if(arg.mode == "taskkill"){
    taskkillall()
    return;
  }

  if(arg.mode == "socks_test"){
    socks_test("speed_code_test","127.0.0.1:16780")
    return;
  }

  if(arg.mode == "log"){
    let log = fs.readFileSync(logFilePath,'utf8')
    mainWindow.webContents.send('speed_code', {"start":"log","log":log});// 发送基座信息给渲染层
    return;
  }

  // 平台加速host服务
  if(arg.mode == "sniproxy"){
    const sniproxy_exe = exec('"' + path.join(localesPath, 'resources\\bin\\sniproxy.exe') + '"' + " -d -c " + '"' + path.join(localesPath, 'resources\\bin\\sniproxy-config.yaml')+ '"');
  
    // 监听子进程的标准输出数据
    sniproxy_exe.stdout.on('data', (data) => {
      console.log(`[sniproxy] ${gbktoUtf8(data)}`);
    });
  
    return;
  }

  console.log(`新启动===================================================================================`);
  // 处理nf2配置
  nf2_config = Buffer.from(arg.Game_config.nf2_config, 'base64').toString('utf-8')
  const dataArray = nf2_config.split("\n");
  var datagameconfig = ""
  for (let i=0; i<dataArray.length; i++){
    datagameconfig = datagameconfig + dataArray[i].replaceAll('\r\n','').replaceAll('\r','') + ","  // windows 是\r\n linux是 \r
  }
  
  Fox_writeFile(path.join(localesPath, 'resources\\bin\\config\\game_config_nf2'),datagameconfig) // 写入nf2配置
  


  net_config = Buffer.from(arg.Game_config.net_config, 'base64').toString('utf-8');
  const dataArray2 = net_config.split("\n");
  var datagameconfig = ""
  for (let i=0; i<dataArray2.length; i++){
    datagameconfig = datagameconfig + dataArray2[i].replaceAll('\r\n','').replaceAll('\r','') + ","  // windows 是\r\n linux是 \r
  }


  datagameconfig = datagameconfig + "@" + arg.Server_config.ip

  Fox_writeFile(path.join(localesPath, 'resources\\bin\\config\\game_config_wintun'),datagameconfig) // 写入WINTUN配置

  mainWindow.webContents.send('speed_code_config-reply', 'OK'); // 发送ok

  if(arg.code_mod == "gost"){
    ///////////////////////////////////////////////////////////////////////
    // 启动gost网络连接服务
    // -api :18080 -metrics=:16088 -L socks5://:16780?udp=true^&limiter.conn.in=256KB^&limiter.conn.out=256KB -F socks5+ws://speedfox:00RY2n01XwMvbmZS@8.217.131.132:56786
    const gost_exe = exec('"' + path.join(localesPath, 'resources\\bin\\SpeedNet.exe') + '"' + " -api 127.114.233.8:17080 -metrics=127.114.233.8:15088 -L socks5://:16780?udp=true -F "+arg.Server_config.connect_mode+"://"+arg.Server_config.method+":"+arg.Server_config.token+"@"+arg.Server_config.ip+":" + arg.Server_config.port );
    
    // 监听子进程的标准输出数据
    gost_exe.stdout.on('data', (data) => {
      console.log(`[SpeedNet] ${gbktoUtf8(data)}`);
    });

    // 监听子进程的标准错误数据
    gost_exe.stderr.on('data', (data) => {
      console.log(`[SpeedNet] ${gbktoUtf8(data)}`);
    });

    // 监听子进程的关闭事件
    gost_exe.on('close', (code) => {
      console.log(`[SpeedNet] SpeedNet exit code ${code}`);

      console.log(`[SpeedNet] 意外终止！`);
      mainWindow.webContents.send('speed_code', {"start":"close","Module":"gost_exe"});// 发送基座信息给渲染层
    });
  }


  if(arg.code_mod == "v2ray"){
    
    Fox_writeFile(path.join(localesPath, 'resources\\bin\\SpeedNet_V2.json'),arg.v2config) // 写入v2ray配置
    const v2ray_exe = exec('"' + path.join(localesPath, 'resources\\bin\\SpeedNet_V2.exe') + '"' +" run -c " + '"' + path.join(localesPath, 'resources\\bin\\SpeedNet_V2.json' + '"'));


    // 监听子进程的标准输出数据
    v2ray_exe.stdout.on('data', (data) => {
      console.log(`[SpeedNet_V2] ${gbktoUtf8(data)}`);
    });
  
    // 监听子进程的标准错误数据
    v2ray_exe.stderr.on('data', (data) => {
      console.log(`[SpeedNet_V2] ${gbktoUtf8(data)}`);
    });
  
    // 监听子进程的关闭事件
    v2ray_exe.on('close', (code) => {
      console.log(`[SpeedNet_V2] SpeedNet exit code ${code}`);
  
      console.log(`[SpeedNet_V2] 意外终止！`);
      mainWindow.webContents.send('speed_code', {"start":"close","Module":"v2ray_exe"});// 发送基座信息给渲染层
    });

  }


  //////////////////////////////////////////////////////////////////////
  // 启动加速模块
  // setTimeout(function(){
    const SpeedProxy = exec('"' + path.join(localesPath, 'resources\\bin\\SpeedProxy.exe') + '"' +" " + arg.mode);
    
    // 监听子进程的标准输出数据
    SpeedProxy.stdout.on('data', (data) => {
      if(data.includes('"Bandwidth":{') ){
        // console.log("有流量变化",data);
        mainWindow.webContents.send('NET_speed-reply', data);// 发送基座信息给渲染层
        return
      }
    
      if(data.includes('"code":{') ){
        // console.log("有流量变化",data);
        mainWindow.webContents.send('speed_code', data);// 发送基座信息给渲染层
        return
      }
    
      console.log(`[SpeedProxy] ${data}`);
    
      if(data.includes('NF2<====>OK') || data.includes('Route<====>OK') ){
        console.log("[SpeedProxy] 核心模块启动成功");
        mainWindow.webContents.send('speed_code', {"start":"OK"});// 发送基座信息给渲染层
        // socks_test() // SOCKS测试
      }
      if(data.includes('NF2<====>Exit') ){
        console.log("[SpeedProxy] 核心模块故障");
        mainWindow.webContents.send('speed_code', {"start":"close","Module":"SpeedProxy ERROR"});// 发送基座信息给渲染层
      }
    
    
    
    });
  
    // 监听子进程的标准错误数据
    SpeedProxy.stderr.on('data', (data) => {
      console.log(`[SpeedProxy]: ${gbktoUtf8(data)}`);
    });
  
    // 监听子进程的关闭事件
    SpeedProxy.on('close', (code) => {
      console.log(`[SpeedProxy] exit code ${code}`);
    
      console.log(`[SpeedProxy] 意外终止！`);
      mainWindow.webContents.send('speed_code', {"start":"close","Module":"SpeedProxy"});// 发送基座信息给渲染层
    });
  // }, 100); //单位是毫秒

});

// 测试启动模块
ipcMain.on('speed_code_test', (event, arg) => {
  const SpeedProxy_test = exec('"' + path.join(localesPath, 'resources\\bin\\SpeedProxy.exe') + '"' +" test_run");
  
  // 监听子进程的标准输出数据
  SpeedProxy_test.stdout.on('data', (data) => {
    console.log(`[SpeedProxy_test] : ${data}`);
    mainWindow.webContents.send('speed_code_test', data);// 发送基座信息给渲染层
  });

  SpeedProxy_test.stderr.on('data', (data) => {
    console.log(`[SpeedProxy_test] ${data}`);
    mainWindow.webContents.send('speed_code_test', data);// 发送基座信息给渲染层
  });

});


////////////////////////////  HOST 修改模块  /////////////////////////////////
// 定义 hosts 文件路径
const hostsFilePath = path.resolve('C:\\Windows\\System32\\drivers\\etc\\hosts')

// 读取 hosts 文件内容
function readHostsFile() {
    return fs.readFileSync(hostsFilePath, 'utf8');
}

// 写入 hosts 文件内容
function writeHostsFile(content) {
    fs.writeFileSync(hostsFilePath, content, 'utf8');
}

// 批量添加记录
function batchAddHostRecords(records, tag) {
    let content = readHostsFile();

    records.forEach(record => {
        const newRecord = `${record.ip} ${record.hostname} ${tag}`;
        
        if (!content.includes(newRecord)) {
            content += os.EOL + newRecord;
        }
    });

    writeHostsFile(content);
    console.log('[host] 批量记录已添加');
}

// 批量删除带有特定标签的记录
function batchRemoveHostRecords(tag) {
    const content = readHostsFile();
    const lines = content.split(os.EOL);
    
    const filteredLines = lines.filter(line => !line.includes(tag));
    
    if (lines.length === filteredLines.length) {
        console.log('[host] 未找到带有该标签的记录');
        return;
    }
    
    const updatedContent = filteredLines.join(os.EOL);
    writeHostsFile(updatedContent);
    console.log('[host] 批量记录已删除');
}

ipcMain.on('batchAddHostRecords', (event, arg) => {
  batchAddHostRecords(arg, '# Speed Fox');
})

ipcMain.on('batchRemoveHostRecords', (event, arg) => {
  batchRemoveHostRecords('# Speed Fox');
})


// 平台加速
ipcMain.on('host_speed_start', (event, arg) => {
  console.log(`[host] 平台加速:服务已启动`);
  const host_speed_gost_exe = exec('"' + path.join(localesPath, 'resources\\bin\\SpeedNet.exe') + '"' + " -api 127.114.233.8:18080 -metrics=127.114.233.8:16088 -L socks5://127.114.233.8:16789?udp=true -F "+arg.f);
  
  // 监听子进程的标准输出数据
  host_speed_gost_exe.stdout.on('data', (data) => {
    console.log(`[host] host speed SpeedNet: ${gbktoUtf8(data)}`);
  });
  
})

ipcMain.on('socks_test', (event, arg) => {
  socks_test(arg.tag,arg.server)
})


// 设置优先级
ipcMain.on('high_priority', (event, arg) => { 

  // 要提高优先级的进程名
  const PROCESS_NAME = arg;
  console.log('[high_priority] 提升优先级:', PROCESS_NAME);


  // 获取指定进程的 PID
  exec(`tasklist /fi "imagename eq ${PROCESS_NAME}" /fo csv /nh`, (err, stdout, stderr) => {
    if (err) {
      console.error('执行命令时出错:', err);
      return;
    }

    // 解析输出，获取 PID
    const lines = stdout.trim().split('\r\n');
    if (lines.length === 0) {
      console.log('[high_priority] 找不到指定进程:', PROCESS_NAME);
      return;
    }

    console.log('提升优先级 - lines ',lines);

    if(!lines.toString().includes('.exe')){
      console.error('可能没找到进程:', lines);
      return;
    }

    const pid = lines[0].split(',')[1].replace(/"/g, '');
    console.log('提升优先级 - pid',pid);

    // 提高进程优先级为高
    exec(`wmic process where ProcessId=${pid} call setpriority "high priority"`, (err, stdout, stderr) => {
      if (err) {
        console.error('设置进程优先级时出错:', err);
        return;
      }

      console.log('优先级已设置为最高。');
    });
  });

});


// traceRoute('jihujiasuqi.com')


ipcMain.on('ipc_Update', (event, arg) => { 
  checkUpdate()
})

function checkUpdate() {
  var app_update_url = 'http://api.jihujiasuqi.com/update/' + app_config.app.product

}




// 更新的blob
ipcMain.on('update_blob', (event, arg) => {
  const dataBuffer = Buffer.from(arg, 'base64');

  fs.writeFile(path.join(myAppDataPath, 'update_.exe'), dataBuffer, (err) => {
    if (err) {
      // 失败
      console.log('更新的blob数据失败');
    } else {
      // 成功
      console.log('更新的blob数据成功');
      exec('"' + path.join(myAppDataPath, 'update_.exe') + '"' +" --updated --force-run");
      // mainWindow.webContents.send('writeFileResult', { success: true, message: 'File written successfully!' });
    }
  });

})

// NET的blob
ipcMain.on('NET_blob', (event, arg) => {
  const dataBuffer = Buffer.from(arg, 'base64');

  fs.writeFile(path.join(myAppDataPath, 'NET_INSTALL_.exe'), dataBuffer, (err) => {
    if (err) {
      // 失败
      console.log('net的blob数据失败');
    } else {
      // 成功
      console.log('net的blob数据成功');
      exec('"' + path.join(myAppDataPath, 'NET_INSTALL_.exe') + '"' +" /q /norestart");
      // mainWindow.webContents.send('writeFileResult', { success: true, message: 'File written successfully!' });
    }
  });

})


// 获取网页上的log
ipcMain.on('web_log', (event, arg) => {
  console.log('[UI] ' + arg);
});


ipcMain.on('user_get_exe', (event, arg) => {
  console.log('选择游戏 ');
  dialog.showOpenDialog( {
    properties: ['openFile'],
    title:'请选择游戏路径',
    filters:[    //过滤文件类型
              { name: '游戏主程序', extensions: ['exe','url'] },
            ]
  }).then(result => {
    console.log(result.canceled)
    console.log(result.filePaths)

    mainWindow.webContents.send('selected-file', result.filePaths);// 发送基座信息给渲染层

  }).catch(err => {
    console.log(err)
  })
});

ipcMain.on('user_start_exe', (event, arg) => {
  console.log('启动游戏 ' + arg);
  // 启动一个独立的子进程来运行快捷方式
  const child = spawn('cmd.exe', ['/c', 'start', '', arg], {
    detached: true,
    stdio: 'ignore'
  });

  // 让父进程不再等待子进程的退出
  child.unref();
});


ipcMain.on('test_baidu', (event, arg) => {
  console.log('测试网络 ' );
  // 启动一个独立的子进程来运行快捷方式
  const child = spawn('cmd.exe', ['/c', "ping www.baidu.com -t"], {
    detached: true,
    stdio: 'ignore'
  });

  // 让父进程不再等待子进程的退出
  child.unref();
});


ipcMain.on('speed_code_config_exe', (event, arg) => {

  const speed_code_config_exe = exec('"' + path.join(localesPath, 'resources\\bin\\SpeedProxy.exe') + '"' +" " + arg);
  
  // 监听子进程的标准输出数据
  speed_code_config_exe.stdout.on('data', (data) => {
    console.log('[speed_code_config_exe] ' +  data);
  })
});





ipcMain.on('socks_connect_test', (event, arg) => {
  const brook = exec('"' + path.join(localesPath, 'resources\\bin\\SpeedNet_brook.exe') + '"' +" testsocks5 -s 127.0.0.1:16780");

 // 监听子进程的标准输出数据
  brook.stdout.on('data', (data) => {
    console.log(`[socks_connect_test] : ${data}`);
    mainWindow.webContents.send('socks_connect_test', data);// 发送基座信息给渲染层
  });

  brook.stderr.on('data', (data) => {
    console.log(`[socks_connect_test] ${data}`);
    mainWindow.webContents.send('socks_connect_test', data);// 发送基座信息给渲染层
  });
});

