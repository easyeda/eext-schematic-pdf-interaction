# 原理图PDF交互 — 功能与实现文档

- **扩展名**: eext-schematic-pdf-interaction
- **版本**: 1.0.0
- **平台**: 嘉立创EDA专业版 (engines.eda ^3.0.0)
- **分类**: PCB

## 这个扩展是做什么的

在 PCB 编辑器中打开原理图的 PDF 文件进行预览，用户点击 PDF 中的元件位号文本（如 R1、C2、U3），PCB 画布自动选中高亮对应封装并可选平移/缩放到元件位置。解决了 PCB 布局时频繁切换原理图查看位号的痛点，实现了"看图找元件"的交互式工作流。

## 菜单总览

| # | 编辑器 | 一级菜单 | 二级菜单 | 注册函数 |
|---|--------|----------|----------|----------|
| 1 | PCB | Schematic PDF Interaction | Open Schematic PDF... | `openPdfDialog` |

---

## 1. 打开原理图PDF (Open Schematic PDF...)

**做什么：** 打开一个弹窗让用户选择本地 PDF 文件，在独立浏览器窗口中预览 PDF，点击 PDF 中的元件位号文本即可在 PCB 中选中并定位对应元件。

**用户操作：**

1. 在 PCB 编辑器中，点击顶部菜单 "Schematic PDF Interaction" → "Open Schematic PDF..."
2. 弹出文件选择弹窗（支持最小化），可点击选择或拖拽 PDF 文件
3. 选择 PDF 后点击"预览 PDF"按钮，打开独立浏览器窗口渲染 PDF
4. 弹窗提供三个选项：
   - ☑ 自动收起弹窗（默认开启）：点预览后自动最小化 IFrame 弹窗
   - ☑ 自动平移（默认开启）：点击位号后平移画布到元件中央
   - ☐ 自动缩放定位（默认关闭）：点击位号后缩放并定位到元件
5. 在 PDF 预览窗口中，位号文本（匹配 `/^[A-Z]{1,4}\d+[A-Z]?$/`）会高亮显示，点击即触发 PCB 定位
6. PDF 预览支持：翻页、缩放（按钮/Ctrl+滚轮）、适合宽度、书签/大纲导航
7. 关闭预览窗口后，IFrame 弹窗自动恢复显示

<details>
<summary>通信流程</summary>

```
用户点击菜单
  → openPdfDialog() → eda.sys_IFrame.openIFrame('/iframe/index.html')
  → 用户选择 PDF → 点预览
  → window.open('') 打开空白 popup → document.write 写入 viewer HTML
  → popup 中使用 iframe 传递的 pdfjsLib 渲染 PDF
  → 用户点击位号文本
  → popup: window.opener.postMessage({ type: 'locate-designator', designator })
  → iframe 收到 postMessage → 调用 eda.pcb_SelectControl.doCrossProbeSelect()
  → 根据选项：navigateToCoordinates() 或 zoomToSelectedPrimitives()
  → popup 关闭 → beforeunload → postMessage('popup-closed')
  → iframe 调用 showIFrame('pdf-picker') 恢复弹窗
```

</details>

**实现要点：**

- 注册函数：`openPdfDialog`（`src/index.ts`）
- IFrame ID：`pdf-picker`
- IFrame 尺寸：460 × 300，支持最小化（collapsed 模式）
- 核心调用链：`openPdfDialog()` → `eda.sys_IFrame.openIFrame()` → iframe 内 `postMessage` 中继 → `doCrossProbeSelect()` → `navigateToCoordinates()` / `zoomToSelectedPrimitives()`
- PDF 渲染：pdf.js v3.11.174，内嵌在 `iframe/index.html` 的 `<script>` 标签中（压缩版），通过 `window.__pdfjsLib` 传递给 popup
- popup 使用 `document.write()` 动态生成完整 HTML（含 viewer UI + pdf.js 调用逻辑）
- 位号正则：`/^[A-Z]{1,4}\d+[A-Z]?$/`
- 定位逻辑在 iframe 中执行（iframe 可直接访问 `eda` 对象，popup 不能）
- 自动平移：先获取选中元件 BBox，计算中心坐标，调用 `navigateToCoordinates(cx, cy)`
- 自动缩放：直接调用 `zoomToSelectedPrimitives()`

---

## 附录 A：EDA API 清单

<details>
<summary>展开 API 列表</summary>

| 模块 | 方法 | 用途 | 被功能使用 |
|------|------|------|-----------|
| `eda.sys_IFrame` | `openIFrame(url, width, height, id, options)` | 打开 IFrame 弹窗 | #1 |
| `eda.sys_IFrame` | `hideIFrame(id)` | 隐藏（最小化）IFrame 弹窗 | #1 |
| `eda.sys_IFrame` | `showIFrame(id)` | 恢复显示 IFrame 弹窗 | #1 |
| `eda.sys_Message` | `showToastMessage(msg)` | 显示 Toast 提示 | #1 |
| `eda.pcb_SelectControl` | `doCrossProbeSelect(designators, ?, ?, highlight, ?)` | 按位号交叉探测选中 PCB 元件 | #1 |
| `eda.pcb_SelectControl` | `getAllSelectedPrimitives_PrimitiveId()` | 获取当前选中元件的 ID 列表 | #1 |
| `eda.pcb_Primitive` | `getPrimitivesBBox(ids)` | 获取元件包围盒（minX/minY/maxX/maxY） | #1 |
| `eda.pcb_Document` | `navigateToCoordinates(x, y)` | 平移画布到指定坐标 | #1 |
| `eda.dmt_EditorControl` | `zoomToSelectedPrimitives()` | 缩放并定位到选中元件 | #1 |
| `eda.sys_I18n` | `text(key)` | 获取多语言文本 | #1 |

</details>

## 附录 B：技术架构

### 文件结构

```
src/index.ts            — 入口：activate + openPdfDialog
iframe/index.html       — 文件选择弹窗 + 内嵌 pdf.js + viewer HTML 生成 + PCB 定位逻辑
iframe/pdf-viewer.html  — 独立 PDF 查看器（BroadcastChannel 方案，当前未使用）
iframe/lib/pdf.js       — pdf.js v3.11.174 本地备份
iframe/lib/pdf.worker.js — pdf.js worker 本地备份
locales/                — 中英文翻译（en.json, zh-Hans.json）
extension.json          — 扩展配置，菜单仅注册 pcb 环境
```

### 关键设计决策

1. **pdf.js 内嵌而非 CDN**：pdf.js 压缩代码直接内嵌在 `iframe/index.html` 的 `<script>` 标签中，避免 CDN 网络依赖，确保离线可用
2. **popup + postMessage 通信**：popup 是 `about:blank` 源，通过 `window.opener.postMessage` 与 iframe 通信；iframe 可直接访问 `eda` 对象执行 PCB 操作
3. **viewer HTML 动态生成**：popup 的完整 HTML（含 UI + 逻辑）通过 `getViewerHtml()` 函数拼接字符串生成，用 `document.write()` 写入
4. **workerSrc 设为空**：`pdfjsLib.GlobalWorkerOptions.workerSrc = "data:,"` 禁用 Web Worker，在主线程解析 PDF（简化部署）

### 已知限制

- 位号正则 `/^[A-Z]{1,4}\d+[A-Z]?$/` 不覆盖所有位号格式（如含下划线、小写字母的非标位号）
- popup 窗口可能被浏览器弹窗拦截器阻止
- pdf.js 在主线程运行，大型 PDF 可能导致 UI 卡顿
- `iframe/pdf-viewer.html` 是 BroadcastChannel 方案的遗留文件，当前未被使用
- `extension.json` 中 `displayName` 字段有错别字（"原理图PDF交互还是"）
