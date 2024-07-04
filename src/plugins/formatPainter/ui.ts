import { Editor, Plugin } from "ckeditor5/src/core";
import { ButtonView } from "ckeditor5/src/ui";
import BrushIcon from "../../icons/brush.svg";
import { FORMAT_PAINTER } from ".";
import { Command } from "@ckeditor/ckeditor5-core";
import './style.css';

export default class FormatPainterUI extends Plugin {
	private isActivated: boolean;

	constructor(editor: Editor) {
		super(editor);
		this.isActivated = false;
	}

	static get pluginName() {
		return "formatPainterUI";
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add(FORMAT_PAINTER, (locale) => {
			const command = editor.commands.get(FORMAT_PAINTER) as Command;
			const buttonView = new ButtonView(locale);

			buttonView.set({
				label: "Format Painter",
				tooltip: true,
				icon: BrushIcon
			});
			buttonView.bind("isOn").to(command as any, "value");
			this.listenTo(buttonView, "execute", () => {
				this.isActivated = !this.isActivated;
				if (this.isActivated) {
					editor.execute(FORMAT_PAINTER, { type: "copy" });
					document.body.classList.add('cursor-format-painter');
				} else {
					editor.execute(FORMAT_PAINTER, { type: "reset" });
					document.body.classList.remove('cursor-format-painter');
				}
				editor.editing.view.focus();
			});

			editor.editing.view.document.on("mouseup", () => {
				this.isActivated && editor.execute(FORMAT_PAINTER, { type: "apply" });
			});

			editor.editing.view.document.on('blur', () => {
				editor.execute(FORMAT_PAINTER, { type: 'clear' });
			});

			return buttonView;
		});
	}
}
