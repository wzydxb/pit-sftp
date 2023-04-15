const vscode = require('vscode');

module.exports = vscode.commands.registerCommand('lulu.nav', function () {
  let day = new Date();
  day.setTime(day.getTime() + 24 * 60 * 60 * 1000);
  let date = day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate();
  vscode.window.showInformationMessage(`明天是: ${date}`);
});