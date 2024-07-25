// beforeBuild.js

const { execSync } = require('child_process');
exports.default = async function(configuration) {
    // your custom code
    // console.log('签名',configuration , configuration["path"]);
    // ukey 密码：1234567890
    
    签名(configuration) // 如果不签名，就注释掉这行 再去 package.json 删除签名相关

}

var 指纹 = '6c6411a6e3a576672507850c7d62e7e0398bcdb6'

function 签名(configuration) {
    try {
        // 在这里添加你的自定义指令
        // 例如，在 win-unpacked 目录执行某些操作
        execSync('D:\\极狐加速器\\证书\\命令签名方式\\signtool.exe sign /v /fd sha256 /sha1 '+指纹+' /tr http://timestamp.globalsign.com/tsa/r6advanced1 /td sha256 "' + configuration["path"] + '"');
        console.log('🔰 [手搓签名器] OK !' + configuration["path"]);
    } catch (error) {
        console.error('🔴🔴🔴 [手搓签名器] :', error.message);
        console.log('出错了，歇3秒重新试');
        // 使用 setTimeout 延迟执行
        setTimeout(function() {
            签名(configuration)
        }, 1000 * 3); // 1000 毫秒等于 1 秒

    }
}
