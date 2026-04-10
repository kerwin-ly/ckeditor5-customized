import { Command, type Editor } from "@ckeditor/ckeditor5-core";
import { first } from "@ckeditor/ckeditor5-utils";

import type {
	DocumentSelection,
	Schema,
	Writer,
	Range,
	Item,
} from "ckeditor5/src/engine";

import { FORMAT_PAINTER, type FormatPainterConfig, type FormatPainterMode } from "./config";

export type FormatPainterExecuteAction = "copy" | "apply" | "reset";
export interface FormatPainterExecuteOptions {
	action: FormatPainterExecuteAction;
	/**
	 * When copying, whether the format painter should stay active after apply.
	 * If omitted, defaults to `false` (single-use).
	 */
	persistent?: boolean;
}

type CopiedAttributes = Record<string, unknown>;

export class FormatPainterCommand extends Command {
	public override value: boolean = false;
	private _copied: CopiedAttributes | null = null;
	private _persistent = false;

	constructor(editor: Editor) {
		super(editor);
	}

	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const hasRange = !selection.isCollapsed;
		this.isEnabled = hasRange;
	}

	public override execute(options?: Partial<FormatPainterExecuteOptions> & { type?: string }): void {
		// Backward compatibility: previous API used `{ type: 'copy'|'apply'|'reset' }`.
		const action = (options?.action ?? options?.type ?? "reset") as FormatPainterExecuteAction;

		if (action === "reset") {
			this.reset();
			return;
		}

		if (action === "copy") {
			const persistent = Boolean((options as any)?.persistent);

			// If format painter is already active, allow promoting to persistent mode
			// even when the current selection is collapsed (e.g. toolbar double-click).
			if (this.value && this._copied && persistent) {
				this._persistent = true;
				return;
			}

			if (!this.isEnabled) {
				return;
			}
			this.copy(persistent);
			return;
		}

		if (action === "apply") {
			if (!this._copied) {
				return;
			}
			this.apply();
		}
	}

	public reset(): void {
		this.value = false;
		this._copied = null;
		this._persistent = false;
	}

	public copy(persistent = false): void {
		const mode = this._getConfig().mode ?? "first";
		const attrs = this._collectAttributesFromSelection(mode);

		// Empty object means "default/plain style". It is a valid copied payload and
		// should clear formatting on apply.
		this._copied = attrs;
		this._persistent = persistent;
		this.value = true;
	}

	public getCopiedAttributes(): Readonly<CopiedAttributes> | null {
		return this._copied;
	}

	public apply(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		if (selection.isCollapsed || !this._copied) {
			return;
		}

		const selectionRange = selection.getFirstRange();
		if (!selectionRange) {
			return;
		}

		model.change((writer: Writer) => {
			this.clearAttributes(writer, selectionRange);
			this.setAttributes(writer, selectionRange);
		});

		if (!this._persistent) {
			this.reset();
		}
	}

	public clearAttributes(writer: Writer, itemRange: Range): void {
		const model = this.editor.model;
		const schema = model.schema;
		for (const item of this._getFormattingItems(model.document.selection, schema)) {
			if (item.is('selection')) {
				for (const attributeName of this._getFormattingAttributes(item, schema)) {
					if (this._isAttributeAllowed(attributeName)) {
						writer.removeSelectionAttribute(attributeName);
					}
				}
			} else {
				for (const attributeName of this._getFormattingAttributes(item, schema)) {
					if (this._isAttributeAllowed(attributeName)) {
						writer.removeAttribute(attributeName, itemRange);
					}
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
		if (!this._copied) {
			return;
		}
		const attrs = Object.fromEntries(
			Object.entries(this._copied).filter(([name]) => this._isAttributeAllowed(name))
		);
		writer.setAttributes(attrs, itemRange);
	}

	private _getConfig(): FormatPainterConfig {
		return this.editor.config.get("formatPainter") ?? {};
	}

	private _isAttributeAllowed(name: string): boolean {
		const cfg = this._getConfig();
		const exclude = cfg.exclude ?? [];
		if (exclude.includes(name)) {
			return false;
		}
		if (cfg.include === "all" || cfg.include == null) {
			return true;
		}
		return cfg.include.includes(name);
	}

	private _collectAttributesFromSelection(mode: FormatPainterMode): CopiedAttributes {
		const model = this.editor.model;
		const selection = model.document.selection;
		const range = selection.getFirstRange();
		if (!range) {
			return {};
		}

		const textNodes: Array<{ getAttributes(): Iterable<[string, unknown]> }> = [];
		for (const entry of range.getWalker()) {
			// `textNode` is an internal field used by the previous implementation.
			const tn = (entry.item as any)?.textNode;
			if (tn) {
				textNodes.push(tn);
			}
		}

		if (!textNodes.length) {
			return {};
		}

		if (mode === "first") {
			return this._filterAttributes(Object.fromEntries(textNodes[0].getAttributes()));
		}

		if (mode === "union") {
			const out: CopiedAttributes = {};
			for (const tn of textNodes) {
				Object.assign(out, Object.fromEntries(tn.getAttributes()));
			}
			return this._filterAttributes(out);
		}

		// "common": intersection of key+value across all nodes.
		let common = Object.fromEntries(textNodes[0].getAttributes()) as CopiedAttributes;
		for (let i = 1; i < textNodes.length; i++) {
			const cur = Object.fromEntries(textNodes[i].getAttributes()) as CopiedAttributes;
			for (const key of Object.keys(common)) {
				if (!(key in cur) || cur[key] !== common[key]) {
					delete common[key];
				}
			}
		}
		return this._filterAttributes(common);
	}

	private _filterAttributes(attrs: CopiedAttributes): CopiedAttributes {
		const out: CopiedAttributes = {};
		for (const [k, v] of Object.entries(attrs)) {
			if (this._isAttributeAllowed(k)) {
				out[k] = v;
			}
		}
		return out;
	}
}
