/*
 * @Author: “wuziyang” “764401855@qq.com”
 * @Date: 2023-04-10 16:38:54
 * @LastEditors: “wuziyang” “764401855@qq.com”
 * @LastEditTime: 2023-04-13 17:39:25
 * @FilePath: \pitsftp\sftp.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
let Client = require('ssh2-sftp-client');
const vscode = require("vscode");
const NodeRSA = require('node-rsa');
const fs = require("fs")
let path = require('path');
// const basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
// const rootPath = path.join(basePath, CONFIG_PATH);
// const shell = require("shelljs");
// const cmdShell = require('node-cmd')

// const localPath = path.resolve(__dirname, 'C://Users//hyh//Desktop//company-project//pit-jxh-web//dist')
// const remotePath = '/data/docker/nginx/html/web'
let client = new Client();

module.exports = async (option, explorer) => {
  const privateKey = fs.readFileSync(path.join(__dirname, './pem/privateKey.pem'), "utf8")
  console.log(privateKey, 'privateKey')
  const priKey = new NodeRSA(privateKey,'pkcs8-private');
  var decrypted = priKey.decrypt(option.password, 'utf8');
  console.log(decrypted, 'decrypted')
  try {
    await client.connect({
        host: option.host,
        port: option.port,
        username: option.username,
        password: decrypted
    })
    if (await client.exists(option.remotePath)) {
      await client.rmdir(option.remotePath, true)
      console.log('删除成功')
    }
    const localPath = explorer.path[0] == '/' ? explorer.path.slice(1) : explorer.path
    console.log(localPath, 'localPath')
    let rslt = await client.uploadDir(localPath, option.remotePath);
    vscode.window.showInformationMessage('上传成功');
    console.log('上传成功')
    return rslt;
  }
  catch (err) {
    console.log(err, 'client')
    vscode.window.showInformationMessage("连接服务器失败");
  }
  finally {
    client.end();
  }  
}
