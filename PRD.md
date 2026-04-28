# PRD: eext-schematic-pdf-interaction

## 功能描述

通过打开一个原理图的PDF，在独立弹窗中进行预览，鼠标点击PDF的元件位号时，获取到位号文本，传递给PCB，PCB完成位号查找、选中高亮，并可选平移/缩放画布到元件位置。

## 功能点

1. 扩展名同文件夹：`eext-schematic-pdf-interaction`
2. 一级菜单 "原理图PDF交互"，二级菜单 "打开原理图PDF..."，仅对PCB文档显示
3. 点击菜单，打开IFrame弹窗（支持最小化），等待用户加载PDF
4. 用户选择本地PDF文件后，点预览按钮，打开新的浏览器独立窗口（popup无地址栏）进行PDF预览
5. 弹窗提供三个勾选项：
   - 自动收起弹窗（默认勾选）：点预览后自动最小化IFrame弹窗
   - 自动平移（默认勾选）：点击位号后平移画布到元件中央
   - 自动缩放定位（默认不勾选）：点击位号后缩放并定位到元件
6. 用户点击PDF中元件的位号文本，通过 postMessage → iframe中继 → 直接调用 `eda.pcb_SelectControl.doCrossProbeSelect` 选中高亮元件
7. PDF预览支持缩放、翻页、Ctrl+滚轮缩放、书签/大纲导航，使用 pdf.js（CDN加载）
8. 关闭独立预览窗口时，自动恢复显示IFrame弹窗

## 文件结构

```
extension.json          — 扩展配置，菜单仅注册 pcb 环境
src/index.ts            — 主逻辑：activate 显示加载提示，openPdfDialog 打开IFrame
iframe/index.html       — 文件选择弹窗 + 内嵌PDF viewer HTML生成 + PCB定位逻辑
iframe/lib/pdf.js       — pdf.js v3.11.174（本地备份，实际通过CDN加载）
iframe/lib/pdf.worker.js — pdf.js worker（本地备份）
locales/                — 中英文翻译
```

## 通信流程

```
用户点击PCB菜单
  → openPdfDialog() → eda.sys_IFrame.openIFrame('/iframe/index.html')
  → 用户选择PDF → 点预览
  → window.open('') 打开空白popup → document.write写入viewer HTML
  → popup中动态加载pdf.js CDN → 渲染PDF
  → 用户点击位号文本（正则: /^[A-Z]{1,4}\d+[A-Z]?$/）
  → popup: window.opener.postMessage({ type: 'locate-designator', designator })
  → iframe收到postMessage → 直接调用 eda.pcb_SelectControl.doCrossProbeSelect()
  → 根据勾选项：navigateToCoordinates() 或 zoomToSelectedPrimitives()
  → popup关闭时 → beforeunload → postMessage('popup-closed') → iframe调用showIFrame恢复弹窗
```

## 技术要点

- 扩展代码运行在隔离作用域，无法通过 window/BroadcastChannel/localStorage 与iframe通信
- iframe 可直接访问 `eda` 对象，因此PCB定位逻辑放在iframe中执行
- popup 是 about:blank 源，通过 window.opener.postMessage 与iframe通信
- pdf.js 通过动态 `<script>` 从CDN加载到popup中（popup是真实浏览器窗口，可访问网络）
