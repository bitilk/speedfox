const { spawn,exec } = require('child_process');

function KillTask(processName) {
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

function KillAllProcess() {
  KillTask("SpeedNet.exe");
  KillTask("SpeedNet_V2.exe");
  KillTask("SpeedProxy.exe");
  KillTask("SpeedMains.exe");
  KillTask("SpeedFox.tun2socks.exe");
  KillTask("sniproxy.exe");
  KillTask("SpeedNet_brook.exe");
}

module.exports = {KillAllProcess};