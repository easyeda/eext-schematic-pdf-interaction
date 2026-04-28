const IFRAME_ID = 'pdf-picker';

export function activate(): void {
	eda.sys_Message.showToastMessage('[eext-pdf] extension loaded');
}

export async function openPdfDialog(): Promise<void> {
	await eda.sys_IFrame.openIFrame('/iframe/index.html', 460, 300, IFRAME_ID, {
		title: eda.sys_I18n.text('Open Schematic PDF'),
		minimizeButton: true,
		minimizeStyle: 'collapsed',
	});
}
