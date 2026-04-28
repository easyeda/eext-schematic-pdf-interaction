# PRD: eext-schematic-pdf-interaction

## 功能描述

通过打开一个原理图的PDF，在弹窗中进行预览，鼠标点击PDF的元件位号时，获取到位号文本，传递给PCB，PCB完成位号查找，定位到元件，并居中平移画布。

## 功能点

1. 扩展名同文件夹：`eext-schematic-pdf-interaction`
2. 一级菜单 "原理图PDF交互"，二级菜单 "打开原理图PDF..."，仅对PCB文档显示
3. 点击菜单，打开IFrame弹窗，等待用户加载PDF
4. 用户选择本地PDF文件后，点预览按钮，打开新的浏览器独立窗口（popup无地址栏）进行PDF预览
5. 用户点击PDF中元件的位号文本，通过 BroadcastChannel 传递给PCB，PCB调用 `doCrossProbeSelect` 定位到同位号封装，调用 `zoomToSelectedPrimitives` 居中画布
6. PDF预览支持缩放、翻页、Ctrl+滚轮缩放、书签/大纲导航，使用 pdf.js CDN

## 文件结构

```
extension.json          — 扩展配置，菜单仅注册 pcb 环境
src/index.ts            — 主逻辑：activate 注册 BroadcastChannel 监听，openPdfDialog 打开IFrame，locateDesignator 定位元件
iframe/index.html       — 文件选择弹窗（拖拽/点击选PDF + 预览按钮）
iframe/pdf-viewer.html  — PDF预览页（pdf.js渲染 + 位号点击检测 + BroadcastChannel发送）
locales/                — 中英文翻译
```

## 通信流程

```
用户点击PCB菜单
  → openPdfDialog() → eda.sys_IFrame.openIFrame('/iframe/index.html')
  → 用户选择PDF → 点预览 → window.open('pdf-viewer.html?file=blobUrl')
  → pdf.js渲染PDF，textLayer检测位号点击（正则: /^[A-Z]{1,4}\d+[A-Z]?$/）
  → BroadcastChannel('eext-pdf-pcb').postMessage({ type: 'locate-designator', designator })
  → src/index.ts 收到消息 → doCrossProbeSelect([designator]) → zoomToSelectedPrimitives()
```
