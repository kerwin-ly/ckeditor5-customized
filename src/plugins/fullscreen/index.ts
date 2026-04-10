import { Plugin } from "@ckeditor/ckeditor5-core";

import { FullscreenEditing, type FullscreenChangeCallback } from "./editing";
import FullscreenUI from "./ui";

export { FULLSCREEN_COMMAND, type FullscreenConfig } from "./config";
export { FullscreenCommand, type FullscreenToggleHost } from "./command";
export { FullscreenEditing, type FullscreenChangeCallback } from "./editing";
export { default as FullscreenUI } from "./ui";

/**
 * Fullscreen for the decoupled editor (toolbar + command + DOM), split like {@link FormatPainter}.
 *
 * ### Why the button was missing (vs FormatPainter)
 * The original implementation read `editable.element` in `init()` and returned early before
 * `componentFactory.add()`. On {@link DecoupledEditor}, `initPlugins()` runs **before** `ui.init()` /
 * `view.render()`, so the editable is not in the DOM yet — the factory was never registered.
 * {@link FormatPainterUI} only registers the factory in `init()`; the factory **callback** runs later
 * during toolbar fill, so it never depended on that early DOM read.
 *
 * ### Viewport coverage
 * By default the layer mounts on `document.body` and uses `100vw` / `100vh` (and `min-height: 100dvh`)
 * so the editor covers the full browser. Use `fullscreen.inPlace` when the editor must stay inside a
 * focus-trapped container (e.g. Ant Design `Modal`).
 */
export default class Fullscreen extends Plugin {
	public static get requires() {
		return [FullscreenEditing, FullscreenUI] as const;
	}

	public static get pluginName() {
		return "Fullscreen" as const;
	}

	public get isFullscreen(): boolean {
		return this._editing.isFullscreen;
	}

	/**
	 * @deprecated Use {@link onFullscreenChange}.
	 */
	public toggle(callback: FullscreenChangeCallback): void {
		this._editing.toggle(callback);
	}

	public onFullscreenChange(callback: FullscreenChangeCallback | null): void {
		this._editing.onFullscreenChange(callback);
	}

	private get _editing(): FullscreenEditing {
		return this.editor.plugins.get(
			FullscreenEditing.pluginName
		) as FullscreenEditing;
	}
}
