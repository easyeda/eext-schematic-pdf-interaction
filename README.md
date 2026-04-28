# eext-schematic-pdf-interaction

原理图PDF交互扩展 — 在PCB编辑器中预览原理图PDF，点击位号文本自动定位PCB元件。

## 功能

- 仅在 PCB 文档中显示菜单入口
- 点击菜单打开弹窗，选择本地 PDF 文件
- 点击预览按钮，在独立窗口中打开 PDF（支持缩放、翻页、书签导航）
- 点击 PDF 中的元件位号文本（如 R1、C2、U3），PCB 自动选中并定位到对应封装

## 技术实现

- PDF 渲染：pdf.js (CDN)
- 窗口通信：BroadcastChannel API
- PCB 定位：`doCrossProbeSelect` + `zoomToSelectedPrimitives`

## 使用

```shell
npm install
npm run build
```

将 `./build/dist/` 下生成的 `.eext` 文件导入嘉立创EDA专业版即可使用。

## 许可

Apache-2.0
