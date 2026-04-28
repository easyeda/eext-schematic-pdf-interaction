# Changelog

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
