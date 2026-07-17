

# Quantum Grid

> 高性能浏览器端二维码生成器 — 终端美学 × 实时渲染

[![Version](https://img.shields.io/badge/version-1.0.0-00e5ff?style=flat-square)](.)
[![License](https://img.shields.io/badge/license-MIT-7c4dff?style=flat-square)](LICENSE)
[![Pure Frontend](https://img.shields.io/badge/pure-frontend-ff4081?style=flat-square)](.)

---

## 功能特性

| 特性 | 说明 |
|---|---|
| 实时生成 | 输入即渲染，零延迟 Canvas 绘制 |
| 四级纠错 | L / M / Q / H，最高 30% 容损 |
| PNG 下载 | 240×240 高清导出 |
| 剪贴板复制 | Clipboard API 一键复制图片 |
| 粒子背景 | 80 粒子实时物理模拟 + 鼠标交互 |
| 响应式 | 桌面双栏 / 移动端堆叠自适应 |

---

## 快速开始

```bash
https://github.com/Fairyxxx/Quantum-Grid-.git
cd quantum-grid
open index.html
```

无需 `npm install`，无需构建工具。浏览器直接打开 `index.html` 即可使用。

---

## 技术栈

- **[qrcode](https://github.com/soldair/node-qrcode)** — 轻量 QR 生成库（CDN 引入）
- **Canvas API** — 高速位图渲染与导出
- **Clipboard API** — 图片写入剪贴板
- **纯 CSS 动画** — 粒子系统、扫描线、发光效果

---

## 使用说明

1. 在输入框中键入文本、URL 或任意内容
2. 二维码实时生成，显示在中央面板
3. 点击纠错级别按钮调整容损率（默认 H）
4. 点击「下载 PNG」保存到本地
5. 点击「复制图片」写入剪贴板，可直接粘贴到聊天/文档

### 纠错级别参考

| 级别 | 容损率 | 适用场景 |
|---|---|---|
| L | ~7% | 简单文本，低密度 |
| M | ~15% | 一般 URL |
| Q | ~25% | 重要信息 |
| H | ~30% | 需叠加 Logo 或打印使用 |

---

## 项目结构

```
quantum-grid/
├── index.html    # 主页面（结构与布局）
├── style.css     # 样式（暗色终端美学）
├── script.js     # 逻辑（QR 生成 + 粒子背景）
└── README.md     # 项目文档
```

---

## License

MIT © 2026

