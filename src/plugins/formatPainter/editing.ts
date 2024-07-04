import { Plugin } from '@ckeditor/ckeditor5-core';
import { FormatPainterCommand } from './command';
import { FORMAT_PAINTER } from '.';

export class FormatPainterEditing extends Plugin {
	/**
	 * @inheritDoc
	 * @return {string}
	 */
	static get pluginName() {
		return 'formatPainterEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		editor.commands.add(FORMAT_PAINTER, new FormatPainterCommand(editor));
	}
}
