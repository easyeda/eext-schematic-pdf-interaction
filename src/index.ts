const IFRAME_ID = 'pdf-picker';
const STORAGE_KEY = '__eext_pdf_cmd';
let pollTimer: any = null;

export function activate(): void {
	console.log('[eext-pdf] activate start');
	// Poll localStorage for commands from popup
	pollTimer = setInterval(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			localStorage.removeItem(STORAGE_KEY);
			console.log('[eext-pdf] polled command:', raw);
			const data = JSON.parse(raw);
			if (data.type === 'locate-designator' && data.designator) {
				locateDesignator(data.designator);
			}
			if (data.type === 'hide-iframe') {
				eda.sys_IFrame.hideIFrame(IFRAME_ID);
			}
		}
		catch (e) {}
	}, 200);
	console.log('[eext-pdf] activate done, polling started');
}

export async function openPdfDialog(): Promise<void> {
	await eda.sys_IFrame.openIFrame('/iframe/index.html', 460, 240, IFRAME_ID, {
		title: eda.sys_I18n.text('Open Schematic PDF'),
		minimizeButton: true,
		minimizeStyle: 'collapsed',
	});
}

async function locateDesignator(designator: string): Promise<void> {
	console.log('[eext-pdf] locateDesignator:', designator);
	try {
		const result = await eda.pcb_SelectControl.doCrossProbeSelect(
			[designator], undefined, undefined, true, true,
		);
		console.log('[eext-pdf] doCrossProbeSelect result:', result);
		if (result) {
			await eda.dmt_EditorControl.zoomToSelectedPrimitives();
			eda.sys_Message.showToastMessage(
				eda.sys_I18n.text('Designator located', undefined, undefined, designator),
			);
		}
		else {
			eda.sys_Message.showToastMessage(
				eda.sys_I18n.text('Designator not found', undefined, undefined, designator),
			);
		}
	}
	catch (e: any) {
		console.log('[eext-pdf] locateDesignator error:', e);
		eda.sys_Message.showToastMessage('Error: ' + e.message);
	}
}
