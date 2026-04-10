import { Editor, Plugin } from "ckeditor5/src/core.js";
import { ButtonView } from "ckeditor5/src/ui.js";
import fullscreenIcon from "../../icons/fullscreen-icon.svg";
import { FullscreenCommand } from "./command";
import { FULLSCREEN_COMMAND } from "./config";
import { FullscreenEditing } from "./editing";

/**
 * Toolbar button; defers enabling the command until the decoupled editable exists in the DOM.
 */
export default class FullscreenUI extends Plugin {
	public static get pluginName() {
		return "fullscreenUI" as const;
	}

	constructor(editor: Editor) {
		super(editor);
	}

	public init(): void {
		const editor = this.editor;

		editor.ui.componentFactory.add(FULLSCREEN_COMMAND, (locale) => {
			const command = editor.commands.get(
				FULLSCREEN_COMMAND
			) as FullscreenCommand;
			const view = new ButtonView(locale);

			view.set({
				label: "Fullscreen",
				icon: fullscreenIcon,
				tooltip: true,
			});

			view.bind("isOn").to(command, "value");
			view.bind("isEnabled").to(command, "isEnabled");

			this.listenTo(view, "execute", () => {
				editor.execute(FULLSCREEN_COMMAND);
			});

			return view;
		});

		editor.ui.once("ready", () => {
			const editing = editor.plugins.get(
				FullscreenEditing.pluginName
			) as FullscreenEditing;
			editing.syncDomBaseline();
		});
	}
}
