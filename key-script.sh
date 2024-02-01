#!/bin/bash

# 安装 Node 版本管理器
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 使 NVM 可用
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 安装 Node.js 版本 18.18.2
nvm install 18.18.2

# 准备节点公钥
npm install

# 检查节点
npm run check

# 如果没有问题，注册节点
if [ "$?" -eq 0 ]; then
   npm run prod
fi
