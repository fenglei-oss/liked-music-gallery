# OpenClaw Desktop Console

一个最小的 Electron 桌面控制台，直接读取本机 OpenClaw 的配置、日志和 session 数据。

## 已实现功能

- 查看当前安装版本号
- 查看网关在线/离线状态
- 查看主 agent 状态和最近活跃时间
- 查看当前默认模型
- 切换已经配置好的模型
- 一键重启网关
- 汇总本地 session / cron 的 token 消耗统计
- 可自定义 OpenClaw 配置路径、根目录和 CLI 路径

## 启动方式

1. 安装依赖

```bash
npm install
```

2. 启动桌面应用

```bash
npm start
```

## 默认读取位置

桌面应用默认读取这些本机路径：

```txt
~/.openclaw/openclaw.json
~/.openclaw/
~/.npm-global/bin/openclaw
~/.npm-global/lib/node_modules/openclaw/package.json
```

如果你的 OpenClaw 安装位置不同，可以在左侧配置面板里改。

## 数据来源

- 版本号：OpenClaw 安装目录的 `package.json`
- 网关状态：本地 TCP 端口探测 + `~/.openclaw/logs/gateway.log`
- Agent 状态：`~/.openclaw/agents/main/sessions/sessions.json`
- 模型列表：`~/.openclaw/openclaw.json`
- Token 统计：`~/.openclaw/agents/*/sessions/*.jsonl` 和 `~/.openclaw/cron/runs/*.jsonl`

## 模型切换

切换模型时会直接更新 `~/.openclaw/openclaw.json` 里的：

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "provider/model"
      }
    }
  }
}
```

然后自动触发一次网关重启。

## 重启网关

应用会依次尝试：

- `openclaw gateway restart`
- `openclaw gateway start`
- `launchctl kickstart -k gui/$UID/ai.openclaw.gateway`

## 说明

这一版是按你当前机器上的 OpenClaw 实际安装形态接的，不再依赖我之前假设的 REST API。
