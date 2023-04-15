/*
 * @Author: “wuziyang” “764401855@qq.com”
 * @Date: 2023-03-31 11:32:54
 * @LastEditors: “wuziyang” “764401855@qq.com”
 * @LastEditTime: 2023-04-13 16:00:30
 * @FilePath: \pitsftp\extension.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const navigation = require("./navigation.js");
const pitInputPassword = require("./commands/pitInputPassword.js");
const fs = require("fs");
const { CONFIG_PATH } = require("./constants");
const path = require("path");
const basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
const rootPath = path.join(basePath, CONFIG_PATH);
const sftpMain = require('./sftp.js')
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
  context.subscriptions.push(navigation);
  context.subscriptions.push(pitInputPassword);
  let disposable = vscode.commands.registerCommand(
    "pitsftp.upload",
    function (explorer) {
      console.log(explorer, 'explorer')
      fs.readFile(rootPath, "utf8", function (err, dataStr) {
        console.log(err, "err111");
        if (err) {
          vscode.window.showErrorMessage("未找到pitSftp.json文件，自动创建");
          fs.writeFile(
            rootPath,
            `{	
	"name": "My Server",
	"host": "localhost",
	"protocol": "sftp",
	"port": 22,
	"username": "username",
	"remotePath": "/",
	"uploadOnSave": false,
	"useTempFile": false,
	"openSsh": false
}
					`,
            (error) => {
              if (!error) vscode.window.showTextDocument(vscode.Uri.file(rootPath));
							console.log('error', error)
            }
          );
        } else {
          sftpMain(JSON.parse(dataStr), explorer)
          console.log(JSON.parse(dataStr), "dataStr");
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
