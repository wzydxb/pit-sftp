/*
 * @Author: “wuziyang” “764401855@qq.com”
 * @Date: 2023-04-19 10:44:46
 * @LastEditors: “wuziyang” “764401855@qq.com”
 * @LastEditTime: 2023-04-19 20:31:13
 * @FilePath: \pitsftp\utils\Progress.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { resolve } = require('path');
const vscode = require('vscode');

/**
 * 进度条工具类
 */

module.exports = class Progress {
  static name = '';
  progress = '';
  constructor(name, location) {
    this.name = name
    this.create(location)
  }
  create(location) {
    vscode.window.withProgress({
      location: location || vscode.ProgressLocation.Notification,
      title: this.name || '正在加载',
      cancellable: true
    }, (progress) => {
      return new Promise(resolve => {
        progress.resolve = resolve
        this.progress = progress
      })
      // 初始化进度
      // progress.report({ increment: 0 });

      // setTimeout(() => {
      //   progress.report({ increment: 10, message: "在努力。。。." });
      // }, 1000);
    })
  }
}