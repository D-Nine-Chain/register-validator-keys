首先运行此 shell 脚本来安装 Node 版本管理器。

`curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`

然后执行以下命令：

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

然后安装这个版本的 Node.js【18.18.2】。

```bash
nvm install 18.18.2
```

现在准备节点公钥:

`npm install `

然后：

`npm run check`

如果没有问题，执行：

`npm run prod`
