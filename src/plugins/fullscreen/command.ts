import { Command, type Editor } from "@ckeditor/ckeditor5-core";

/**
 * Minimal surface the command needs from {@link FullscreenEditing} (avoids circular imports).
 */
export interface FullscreenToggleHost {
	readonly isFullscreen: boolean;
	toggleFullscreen(): void;
}

export class FullscreenCommand extends Command {
	public override value: boolean = false;

	constructor(editor: Editor, private readonly _host: FullscreenToggleHost) {
		super(editor);
	}

	public override refresh(): void {
		this.value = this._host.isFullscreen;
	}

	public override execute(): void {
		this._host.toggleFullscreen();
	}
}
