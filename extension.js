/*
 * @Author: “wuziyang” “764401855@qq.com”
 * @Date: 2023-03-31 11:32:54
 * @LastEditors: “wuziyang” “764401855@qq.com”
 * @LastEditTime: 2023-04-19 09:27:47
 * @FilePath: \pitsftp\extension.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const navigation = require("./navigation.js");
const pitInputPassword = require("./commands/pitInputPassword.js");
// const fs = require("fs");
const fse = require('fs-extra')
const { CONFIG_PATH } = require("./constants");
const path = require("path");
const basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
const rootPath = path.join(basePath, CONFIG_PATH);
const sftpMain = require('./sftp.js')
const { v4 } = require('uuid')
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
console.log(vscode, "vscode");
console.log(__filename, "__filename");
// console.log(vscode.workspace.rootPath)
function getFileUri(fileName) {
  return path.join(fileName, rootPath);
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log(pitInputPassword)
  context.subscriptions.push(navigation);
  context.subscriptions.push(pitInputPassword);
  let disposable = vscode.commands.registerCommand(
    "pitsftp.upload",
    function (explorer) {
      console.log(explorer, 'explorer')

      fse.pathExists(rootPath).then(exist => {
        if (exist) { // 如果存在
          return fse.readJson(rootPath, (err, data) => {
            if (err) throw err
            sftpMain(data, explorer)
          });
        } else {
          vscode.window.showErrorMessage("未找到pitSftp.json文件，自动创建");
          fse.outputJson(rootPath, {	
            "name": "My Server",
            "host": "localhost",
            "protocol": "sftp",
            "port": 22,
            "username": "username",
            "remotePath": "/",
            "key": v4()
          }, { spaces: 4 }).then((err) => {
            if (err) throw err
            vscode.window.showTextDocument(vscode.Uri.file(rootPath))
          })

        }
      })

//       fse.pathExists(rootPath, "utf8", function (err, dataStr) {
//         console.log(err, "err111");
//         if (err) {
//           vscode.window.showErrorMessage("未找到pitSftp.json文件，自动创建");
//           fs.writeFile(
//             rootPath,
//             `{	
// 	"name": "My Server",
// 	"host": "localhost",
// 	"protocol": "sftp",
// 	"port": 22,
// 	"username": "username",
// 	"remotePath": "/",
// 	"uploadOnSave": false,
// 	"useTempFile": false,
// 	"openSsh": false
// }
// 					`,
//             (error) => {
//               if (!error) vscode.window.showTextDocument(vscode.Uri.file(rootPath));
// 							console.log('error', error)
//             }
//           );
//         } else {
//           sftpMain(JSON.parse(dataStr), explorer)
//           console.log(JSON.parse(dataStr), "dataStr");
//         }
//       });
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
