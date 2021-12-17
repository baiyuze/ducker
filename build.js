const shell = require('shelljs');
const fs = require('fs');

process.on('SIGINT', function() {
  console.log('中断打包服务,正在恢复...')
  if(shell.exec('mv ../web ./app').code !== 0) {
    console.log('迁移文件夹失败');
  }
  // 判断某文件夹下面是否有web文件夹
  process.exit(0);
});

if(shell.exec('mv ./app/web ../').code !== 0) {
  console.log('当前没有文件夹');
}

if(shell.exec('npm run build:all').code !== 0) {
  console.log('编译失败,请重试...');
}

if(shell.exec('mv ../web ./app').code !== 0) {
  console.log('迁移文件夹失败');
}

