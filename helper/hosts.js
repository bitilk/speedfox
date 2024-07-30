const fs = require('fs');
const path = require('path');
const os = require('os');
const hostsFilePath = path.resolve('C:\\Windows\\System32\\drivers\\etc\\hosts');

const {logger} = require('../helper/logger');

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
    logger.info('[host] Batch added');
}

// 批量删除带有特定标签的记录
function batchRemoveHostRecords(tag) {
    const content = readHostsFile();
    const lines = content.split(os.EOL);
    
    const filteredLines = lines.filter(line => !line.includes(tag));
    
    if (lines.length === filteredLines.length) {
      logger.info(`[host] Record not found with tag: ${tag}`);
      return;
    }
    
    const updatedContent = filteredLines.join(os.EOL);
    writeHostsFile(updatedContent);
    logger.info(`[host] 批量记录已删除 tag: ${tag} updatedContent: ${updatedContent}`);
}


module.exports = {batchAddHostRecords, batchRemoveHostRecords}
