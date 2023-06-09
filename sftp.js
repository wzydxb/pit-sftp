/*
 * @Author: “wuziyang” “764401855@qq.com”
 * @Date: 2023-04-10 16:38:54
 * @LastEditors: “wuziyang” “764401855@qq.com”
 * @LastEditTime: 2023-04-19 20:52:52
 * @FilePath: \pitsftp\sftp.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
let Client = require('ssh2-sftp-client');
const vscode = require("vscode");
const NodeRSA = require('node-rsa');
const fs = require("fs")
let path = require('path');
const Progress = require('./utils/Progress')
// const basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
// const rootPath = path.join(basePath, CONFIG_PATH);
// const shell = require("shelljs");
// const cmdShell = require('node-cmd')

// const localPath = path.resolve(__dirname, 'C://Users//hyh//Desktop//company-project//pit-jxh-web//dist')
// const remotePath = '/data/docker/nginx/html/web'
let client = new Client();
module.exports = async (option, explorer) => {
  const localPath = explorer.path[0] == '/' ? explorer.path.slice(1) : explorer.path
  console.log(localPath, 'localPath')
  const stat = fs.statSync(localPath)
  if (!stat.isDirectory()) {
    return vscode.window.showWarningMessage('目前仅支持上传文件夹')
  }
  const privateKey = fs.readFileSync(path.join(__dirname, `./pem/${option.key}/privateKey.pem`), "utf8")
  const priKey = new NodeRSA(privateKey,'pkcs8-private');
  var decrypted = priKey.decrypt(option.password, 'utf8');
  const { progress } = new Progress('PITSFTP文件传输', vscode.ProgressLocation.Notification)
  let i = 0
  let num = 0
  let files = getAllFileList(localPath)
  function upload(info) {
    i++
    progress.report({ increment: num === parseInt((i / files.length) * 100) ? 0 : 1, message: "正在上传：\r\n" +  info.source});
    num = parseInt((i / files.length) * 100)
  }
  try {
    progress.report({ increment: 0, message: "正在努力链接服务器。。。。" });
    await client.connect({
        host: option.host,
        port: option.port,
        username: option.username,
        password: decrypted
    })
    // if (await client.exists(option.remotePath)) {
    //   await client.rmdir(option.remotePath, true)
    //   console.log('删除成功')
    // }
    client.on('upload', upload);
    let rslt = await client.uploadDir(localPath, option.remotePath);
    // let rslt = await client.fastPut(localPath, option.remotePath, { step: (total_transferred, chunk, total) => {
    // progress.report({ increment: 0, message: "正在上传：" + });
    // } });
    progress.resolve()
    vscode.window.showInformationMessage('上传成功');
    console.log('上传成功')
    client.removeListener('upload', upload)
    client.end()
    return rslt;
  }
  catch (err) {
    console.log(err, 'client')
    vscode.window.showInformationMessage("连接服务器失败:"+err);
  }
  finally {
    client.end();
  }  
}

function getAllFileList(MyUrl) {
  let fileUrlList = []
  const getFileList = (url) => {
    const fileList = fs.readdirSync(url)
    fileList.forEach(file => {
      let fPath = path.join(url, file);
      const stat = fs.statSync(fPath)
      if (stat.isDirectory()) {
        getFileList(fPath)
          //stat 状态中有两个函数一个是stat中有isFile ,isisDirectory等函数进行判断是文件还是文件夹
      }
      else {
        fileUrlList.push(fPath)
      }
    })
  }
  getFileList(MyUrl)
  return fileUrlList
}