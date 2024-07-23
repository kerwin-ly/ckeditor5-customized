import { Command, Editor } from '@ckeditor/ckeditor5-core';
import { first } from '@ckeditor/ckeditor5-utils';

import type { DocumentSelection, Schema, Element, Writer, Selection, Range, Item } from 'ckeditor5/src/engine';

const headingMapping = {
	heading1: 'huge',
	heading2: 'big'
};

export class FormatPainterCommand extends Command {
	private waiting: any;
	private formatNodes: any[] = [];

	constructor(editor: Editor) {
		super(editor);
		this.formatNodes = [];
		this.waiting = null;
		this.value = false;
	}

	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const start = selection.getFirstPosition();
		const end = selection.getLastPosition();
		if (!start || !end || this._isNone(start, end)) {
			return;
		}

		const range = model.createRange(start, end);
		const formatNodes = Array.from(range.getWalker()).filter((walker) => !!(walker.item as any).textNode);

		// if (!formatNodes.length) {
		// 	this.reset();
		// 	return;
		// }

		this.formatNodes = formatNodes;
		this.isEnabled = true;
	}

	/**
	 * @inheritDoc
	 *
	 * @param {Object} options
	 * @param {'copy'|'apply'|'reset'} options.type
	 */
	public override execute(options = { type: 'reset' }): void {
		const { type } = options;
		if (type === 'reset') {
			this.reset();
			return;
		}

		if (type === 'apply' && this.waiting) {
			this.apply();
			return;
		}

		if (type === 'copy' && this.isEnabled) {
			this.copy();
		}
	}

	private _isNone(start: any, end: any): boolean {
		const [sRow, sCol] = start.path;
		const [eRow, eCol] = end.path;
		if (sRow === eRow) {
			return sCol === eCol;
		}

		return false;
	}

	public reset(): void {
		this.value = false;
		this.formatNodes = [];
		this.waiting = null;
	}

	public copy(): void {
		this.value = true;
		let attrs = {};
		this.formatNodes.forEach((node) => {
			const newAttrs = Object.fromEntries(node.item.textNode.getAttributes());
			// const parentName = node.item.textNode.parent?.name;
			// set attrs for heading
			// if (parentName === 'heading1' || parentName === 'heading2') {
			// 	Object.assign(newAttrs, {
			// 		fontSize: headingMapping[parentName as 'heading1' | 'heading2'] || '',
			// 		bold: true
			// 	});
			// }

			const _keys = Object.keys(newAttrs);
			if (newAttrs.hasOwnProperty('linkHref')) {
				delete newAttrs.linkHref;
			}

			_keys.forEach((key: string) => {
				if (attrs.hasOwnProperty(key)) {
					delete newAttrs[key];
				}
			});

			if (_keys.length) {
				attrs = Object.assign({}, attrs, newAttrs);
			}
		});
		this.waiting = attrs;
	}

	public apply(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const start = selection.getFirstPosition();
		const end = selection.getLastPosition();

		if (!start || !end || this._isNone(start, end)) {
			return;
		}

		const selectionRange = model.createRange(start, end);
		model.change((writer: Writer) => {
			const walkers = selectionRange.getWalker();
			for (const walker of walkers) {
				const textNode = (walker.item as any).textNode;
				if (textNode) {
					const range = writer.createRange(walker.previousPosition, walker.nextPosition);
					this.clearAttributes(writer, range);
					this.setAttributes(writer, range);
				}
			}
		});
	}

	public clearAttributes(writer: Writer, itemRange: any): void {
		const model = this.editor.model;
		const schema = model.schema;
		for (const item of this._getFormattingItems(model.document.selection, schema)) {
			if (item.is('selection')) {
				for (const attributeName of this._getFormattingAttributes(item, schema)) {
					writer.removeSelectionAttribute(attributeName);
				}
			} else {
				// const itemRange = writer.createRangeOn( item );
				for (const attributeName of this._getFormattingAttributes(item, schema)) {
					writer.removeAttribute(attributeName, itemRange);
				}
			}
		}
	}

	private *_getFormattingItems(selection: DocumentSelection, schema: Schema) {
		const itemHasRemovableFormatting = (item: Item | DocumentSelection) => {
			return !!first(this._getFormattingAttributes(item, schema));
		};

		// Check formatting on selected items that are not blocks.
		for (const curRange of selection.getRanges()) {
			for (const item of curRange.getItems()) {
				if (!schema.isBlock(item) && itemHasRemovableFormatting(item)) {
					yield item;
				}
			}
		}

		// Check formatting from selected blocks.
		for (const block of selection.getSelectedBlocks()) {
			if (itemHasRemovableFormatting(block)) {
				yield block;
			}
		}

		// Finally the selection might be formatted as well, so make sure to check it.
		if (itemHasRemovableFormatting(selection)) {
			yield selection;
		}
	}

	private *_getFormattingAttributes(item: Item | DocumentSelection, schema: Schema) {
		for (const [attributeName] of item.getAttributes()) {
			const attributeProperties = schema.getAttributeProperties(attributeName);

			if (attributeProperties) {
				yield attributeName;
			}
		}
	}

	public setAttributes(writer: Writer, itemRange: Range): void {
		// if (!Object.keys(this.waiting).length) {
		//   writer.clearAttributes(itemRange);
		// }
		writer.setAttributes(this.waiting, itemRange);
	}
}
