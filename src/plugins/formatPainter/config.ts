import type {} from "@ckeditor/ckeditor5-core";

export const FORMAT_PAINTER = "formatPainter" as const;

export type FormatPainterMode = "first" | "common" | "union";
export type FormatPainterApplyTrigger = "mouseup" | "selectionChange" | "manual";

export interface FormatPainterConfig {
	/**
	 * When `true`, resets on editable blur.
	 * Default: `false`.
	 */
	clearOnBlur?: boolean;

	/**
	 * When active, what event should trigger automatic apply.
	 * Default: `"mouseup"`.
	 */
	applyTrigger?: FormatPainterApplyTrigger;

	/**
	 * How to compute copied attributes from a selection that contains multiple text nodes.
	 * - `"first"`: take attributes from the first text node.
	 * - `"common"`: intersection of attributes (same key+value across all).
	 * - `"union"`: union of attributes (keys from anywhere, last write wins).
	 *
	 * Default: `"first"`.
	 */
	mode?: FormatPainterMode;

	/**
	 * Attribute allowlist. When provided, only these attribute names are copied/applied.
	 */
	include?: readonly string[] | "all";

	/**
	 * Attribute denylist. Always excluded even if included.
	 */
	exclude?: readonly string[];
}

declare module "@ckeditor/ckeditor5-core" {
	interface EditorConfig {
		formatPainter?: FormatPainterConfig;
	}
}

