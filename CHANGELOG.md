# Changelog

## [1.0.1]

### 修复
- 修复 PDF 预览窗口无法渲染 PDF 的问题（worker 加载失败，改为主线程 fake worker 模式）
- 修复 `doCrossProbeSelect` 返回空结果时仍显示"已定位"的错误提示
- 修复重复点击预览按钮打开多个 popup 导致通信混乱的问题
- 修复 `postMessage` 无来源校验的安全隐患
- 修复 PDF 加载失败时无任何错误提示的问题
- 修复拖拽非 PDF 文件时无反馈且边框颜色不恢复的问题
- 修复 PDF 文本层定位计算不准确导致点击偏移的问题
- 修复 PDF 未加载完成时点击缩放按钮导致报错的问题
- 修复 `extension.json` 中 `displayName` 的错别字

### 变更
- `extension.json` 中菜单 id 加上插件名前缀（`schpdf-pcb-*`），避免全局冲突
- `extension.json` 补充 keywords（Schematic、CrossProbe、Designator）
- `extension.json` 完善 description 描述
- 版本号升至 1.0.1

## [1.0.0] - 2025

### 新增
- PCB 编辑器菜单入口："Schematic PDF Interaction" → "Open Schematic PDF..."
- IFrame 弹窗文件选择器，支持点击选择和拖拽 PDF 文件
- 独立浏览器窗口 PDF 预览，支持缩放、翻页、Ctrl+滚轮缩放、书签/大纲导航
- 点击 PDF 中的元件位号文本，PCB 自动交叉探测选中高亮对应封装
- 三个用户选项：自动收起弹窗（默认开）、自动平移（默认开）、自动缩放定位（默认关）
- 关闭预览窗口后自动恢复 IFrame 弹窗
- 中英文多语言支持
- pdf.js v3.11.174 本地内嵌，离线可用

### 使用的 EDA API
- `sys_IFrame.openIFrame()` / `hideIFrame()` / `showIFrame()` — IFrame 弹窗管理
- `sys_Message.showToastMessage()` — Toast 提示
- `pcb_SelectControl.doCrossProbeSelect()` — 按位号交叉探测选中
- `pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId()` — 获取选中元件 ID
- `pcb_Primitive.getPrimitivesBBox()` — 获取元件包围盒
- `pcb_Document.navigateToCoordinates()` — 平移画布
- `dmt_EditorControl.zoomToSelectedPrimitives()` — 缩放定位到选中元件
- `sys_I18n.text()` — 多语言文本
