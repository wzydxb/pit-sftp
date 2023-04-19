/*
 * @Author: “wuziyang” “764401855@qq.com”
 * @Date: 2023-04-12 14:32:15
 * @LastEditors: “wuziyang” “764401855@qq.com”
 * @LastEditTime: 2023-04-18 18:52:51
 * @FilePath: \pitsftp\commands\pitInputPassword.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const vscode = require('vscode');
const path = require('path');
// const fs = require('fs');
const fs = require('fs-extra')
const NodeRSA = require('node-rsa');
const { CONFIG_PATH } = require("../constants");
const basePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
const rootPath = path.join(basePath, CONFIG_PATH);
const { v4 } = require('uuid')
module.exports = vscode.commands.registerCommand('pitsftp.inputPassWord', function () {
  vscode.window.showInputBox(
    { // 这个对象中所有参数都是可选参数
        password:true, // 输入内容是否是密码
        ignoreFocusOut:true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
        placeHolder:'输入密码进行加密', // 在输入框内的提示信息
        prompt:'服务器密码进行非对称加密', // 在输入框下方的提示信息
        // validateInput:function(text){return text;} // 对输入内容进行验证并返回
    }).then(function(secret){
      if (!secret) return;
      const key = new NodeRSA({b: 512});
      fs.mkdir(path.join(__dirname, '../pem'),err => {
        let option = {}
        fs.pathExists(rootPath).then((exist) => {
          if (exist) {
            fs.readJSON(rootPath, (err1, obj) => {
              if (err1) {
                throw err1
              }
              option = obj
            encryKey(option, key, secret)
          })
          } else {
            vscode.window.showErrorMessage("未找到pitSftp.json文件，自动创建2");
            option = {
              "name": "My Server",
              "host": "localhost",
              "protocol": "sftp",
              "port": 22,
              "username": "username",
              "remotePath": "/",
              "key": v4()
            }
            fs.outputJson(rootPath, option, { spaces: 4 }).then((err) => {
              if (err) throw err
              vscode.window.showTextDocument(vscode.Uri.file(rootPath))
              encryKey(option, key, secret)
            })
          }
        })
      })
  });
});

function encryKey(option, key, secret) {
  const pemMk = path.join(__dirname, `../pem/${option.key}`)
  const publicKeyMkUrl = path.join(pemMk, `./publicKey.pem`)
  const privateKeyMkUrl = path.join(pemMk, `./privateKey.pem`)
  fs.mkdir(pemMk, err => {
    if (err) throw err
    fs.writeFileSync(publicKeyMkUrl, key.exportKey('pkcs8-public')) // 公密
    fs.writeFileSync(privateKeyMkUrl, key.exportKey('pkcs8-private')) // 私密
  })
  const pubKey = new NodeRSA(key.exportKey('pkcs8-public'),'pkcs8-public');
  var encrypt = pubKey.encrypt(Buffer.from(secret), 'base64');
  // const encrypt = privateEncrypt(PRIVKEY, Buffer.from(secret)); // 加密
  // const decrypt = crypto.publicDecrypt(publicKey, encrypt); // 解密
  setPassword(encrypt)
  let options = {
    content: encrypt,
    language:"js"
  };
  
  vscode.workspace.openTextDocument(options).then(doc => {
    vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
  }, err => {
    vscode.window.showErrorMessage(err);
  });
}

function setPassword(passWord) {
  const rootUrl = vscode.workspace.workspaceFolders.length === 1 ? vscode.workspace.workspaceFolders[0].uri.path : null
  if (!rootUrl) return;
  // const localPath = rootUrl[0] == '/' ? rootUrl.slice(1) : rootUrl

  fs.pathExists(rootPath).then(exist => {
    console.log(exist, 'exist')
    if (exist) { // 如果存在
      return fs.readJson(rootPath, (err, data) => {
        if (err) throw err
        data.password = passWord
        setFileText(rootPath, data)
      });
    } else {
      vscode.window.showErrorMessage("未找到pitSftp.json文件，自动创建1");
      setFileText(rootPath, {
        "name": "My Server",
        "host": "localhost",
        "protocol": "sftp",
        "port": 22,
        "username": "username",
        "remotePath": "/",
        "password": passWord,
        "key": v4()
      })
    }
  })

  // rootUrl && fs.readFile(path.join(localPath, CONFIG_PATH), "utf8", function (err, dataStr) {
  //   if (err) {
  //     vscode.window.showErrorMessage("未找到pitSftp.json文件，自动创建");
  //     setFileText(path.join(localPath, CONFIG_PATH), {	
  //       "name": "My Server",
  //       "host": "localhost",
  //       "protocol": "sftp",
  //       "port": 22,
  //       "username": "username",
  //       "password": passWord,
  //       "remotePath": "/",
  //       "key": v4()
  //       }
  //     )
  //   } else {
  //     const option = JSON.parse(dataStr)
  //     option.password = passWord
  //     setFileText(path.join(localPath, CONFIG_PATH), JSON.stringify(option))
  //   }
  // });
}
function setFileText(path, text) {
  fs.outputJson(path, text, { spaces: 4 }).then((err) => {
    if (err) throw err
    vscode.window.showTextDocument(vscode.Uri.file(path))
  })
}