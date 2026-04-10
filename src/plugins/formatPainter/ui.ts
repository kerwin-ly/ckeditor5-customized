import { Editor, Plugin } from "ckeditor5/src/core";
import { ButtonView } from "ckeditor5/src/ui";
import BrushIcon from "../../icons/brush.svg";
import { FORMAT_PAINTER } from "./config";
import type { FormatPainterCommand } from "./command";

export default class FormatPainterUI extends Plugin {
	constructor(editor: Editor) {
		super(editor);
	}

	static get pluginName() {
		return "formatPainterUI";
	}

	init() {
		const editor = this.editor;
		const cfg = editor.config.get("formatPainter") ?? {};
		const applyTrigger = cfg.applyTrigger ?? "mouseup";
		const clearOnBlur = cfg.clearOnBlur === true;

		editor.ui.componentFactory.add(FORMAT_PAINTER, (locale) => {
			const command = editor.commands.get(FORMAT_PAINTER) as unknown as FormatPainterCommand;
			const buttonView = new ButtonView(locale);
			let clickTimer: number | null = null;

			buttonView.set({
				label: "Format Painter",
				tooltip: true,
				icon: BrushIcon
			});

			// Handle double-click explicitly (keep painter active).
			const bind = buttonView.bindTemplate;
			buttonView.extendTemplate({
				on: {
					dblclick: bind.to("formatPainterDblClick")
				}
			});

			this.listenTo(buttonView, "formatPainterDblClick", (evt, domEvt: MouseEvent) => {
				domEvt.preventDefault();
				domEvt.stopPropagation();
				if (clickTimer != null) {
					window.clearTimeout(clickTimer);
					clickTimer = null;
				}

				if ((command as any).value) {
					editor.execute(FORMAT_PAINTER, { action: "reset" });
				} else {
					editor.execute(FORMAT_PAINTER, { action: "copy", persistent: true });
				}

				editor.editing.view.focus();
			});

			buttonView.bind("isOn").to(command as any, "value");
			buttonView.bind("isEnabled").to(command as any, "isEnabled");
			this.listenTo(buttonView, "execute", () => {
				// Single click: one-shot copy (auto resets after apply).
				// Delay slightly so a following dblclick can cancel this.
				if (clickTimer != null) {
					window.clearTimeout(clickTimer);
				}
				clickTimer = window.setTimeout(() => {
					clickTimer = null;

					if ((command as any).value) {
						editor.execute(FORMAT_PAINTER, { action: "reset" });
					} else {
						editor.execute(FORMAT_PAINTER, { action: "copy", persistent: false });
					}
					editor.editing.view.focus();
				}, 250);
			});

			if (applyTrigger === "mouseup") {
				this.listenTo(editor.editing.view.document, "mouseup", () => {
					(command as any).value && editor.execute(FORMAT_PAINTER, { action: "apply" });
				});
			} else if (applyTrigger === "selectionChange") {
				this.listenTo(editor.model.document.selection, "change:range", () => {
					(command as any).value && editor.execute(FORMAT_PAINTER, { action: "apply" });
				});
			}

			if (clearOnBlur) {
				this.listenTo(editor.editing.view.document, "blur", () => {
					editor.execute(FORMAT_PAINTER, { action: "reset" });
				});
			}

			return buttonView;
		});
	}
}
