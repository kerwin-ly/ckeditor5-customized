import type {} from "@ckeditor/ckeditor5-core";

/**
 * Toolbar item and {@link @ckeditor/ckeditor5-core#Command} name for fullscreen.
 */
export const FULLSCREEN_COMMAND = "fullscreen" as const;

/**
 * Options for {@link Fullscreen} (under `editor.config.get( 'fullscreen' )`).
 *
 * **Default:** the fullscreen layer is mounted on `document.body` with viewport-sized
 * `position: fixed` so the editor covers the **entire browser** (width × height).
 *
 * Set {@link FullscreenConfig#inPlace} to `true` if the editor must stay in the
 * original DOM parent (e.g. Ant Design `Modal` focus trap); then coverage is limited
 * by any `transform` ancestor instead of the whole viewport.
 */
export interface FullscreenConfig {
	/**
	 * When `true`, insert the fullscreen wrapper **in place** under the editor’s current parent
	 * (focus-trap friendly). When `false` or omitted, the editor host is moved to
	 * {@link appendTo} (default `document.body`) for true viewport fullscreen.
	 */
	inPlace?: boolean;

	/**
	 * When `inPlace` is not `true`, the fullscreen root is appended here.
	 * Default: `document.body`.
	 */
	appendTo?: HTMLElement;

	/** CSS `z-index` for the fullscreen root. Default high enough for typical stacked modals. */
	zIndex?: string;

	/** When `false`, no dimmed backdrop is rendered. Default `true`. */
	showBackdrop?: boolean;
}

declare module "@ckeditor/ckeditor5-core" {
	interface EditorConfig {
		fullscreen?: FullscreenConfig;
	}
}
