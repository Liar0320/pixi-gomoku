# PIXIGOMOKU - 五子棋游戏

一个使用 Vite + Pixi.js + TypeScript 开发的现代五子棋游戏。支持人机对战，具有美观的图形界面和智能的 AI 对手。

## 功能特性

- 🎮 人机对战模式
- 🤖 智能 AI 对手
- 🎨 美观的图形界面
- ✨ 流畅的游戏体验
- 🎯 实时胜负判定
- 🔄 一键重新开始

## 技术栈

- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Pixi.js](https://pixijs.com/) - 快速的 2D 渲染引擎
- [TypeScript](https://www.typescriptlang.org/) - 带类型的 JavaScript

## 安装与运行

1. 克隆项目：
```bash
git clone https://github.com/your-username/pixigomoku.git
cd pixigomoku
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 构建项目：
```bash
npm run build
```

## 项目结构

```
src/
├── types/          # 类型定义
├── game/           # 游戏核心逻辑
│   ├── Board.ts    # 棋盘组件
│   ├── AI.ts       # AI 实现
│   └── Game.ts     # 游戏主类
├── main.ts         # 入口文件
└── assets/         # 静态资源
```

## AI 实现

AI 采用评估函数策略，具有以下特点：

1. **智能决策**：
   - 优先寻找获胜机会
   - 主动阻止玩家获胜
   - 评估每个可能的落子位置

2. **评估策略**：
   - 计算连子数量
   - 分析棋型威胁
   - 权衡进攻与防守

## 开发计划

- [ ] 增强 AI 算法（使用 Minimax 算法）
- [ ] 添加音效和动画效果
- [ ] 实现棋局保存和回放
- [ ] 添加难度级别选择
- [ ] 支持自定义棋盘大小
- [ ] 添加在线对战功能

## 参与贡献

欢迎提交 Pull Request 或创建 Issue！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交改动：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 提交信息格式：`type(scope): message`

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

- [Vite](https://vitejs.dev/) - 优秀的构建工具
- [Pixi.js](https://pixijs.com/) - 强大的渲染引擎
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的编程语言

## 联系方式

作者：[Your Name]
- Email: your.email@example.com
- GitHub: [@your-username](https://github.com/your-username)

## 支持项目

如果这个项目对您有帮助，欢迎：

- ⭐ 给项目点个星
- 🐛 提交 Bug 报告
- 💡 提供新功能建议
- 🤝 参与项目开发
