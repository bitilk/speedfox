const fs = require('fs');

function Fox_writeFile(filePath, textToWrite) {
  fs.writeFile(filePath, textToWrite, (err) => {
    if (err) {
      logger.error(`[Fox_writeFile] Failed writing file to ${filePath}`);
      return;
    }
  });
}

module.exports = {Fox_writeFile}