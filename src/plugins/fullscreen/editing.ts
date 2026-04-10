import { Plugin, type Editor } from "@ckeditor/ckeditor5-core";

import { FullscreenCommand, type FullscreenToggleHost } from "./command";
import { FULLSCREEN_COMMAND, type FullscreenConfig } from "./config";

export type FullscreenChangeCallback = (isFullscreen: boolean) => void;

/**
 * Registers the fullscreen command, keyboard handling, and DOM behavior.
 */
export class FullscreenEditing extends Plugin implements FullscreenToggleHost {
	public static get pluginName() {
		return "fullscreenEditing" as const;
	}

	private _isFullscreen = false;
	private _onChange: FullscreenChangeCallback | null = null;

	private _wrapper: HTMLElement | null = null;
	private _originalParent: HTMLElement | null = null;
	private _originalNextSibling: ChildNode | null = null;
	private _usedExternalMount = false;

	private _savedEditorStyles: {
		position: string;
		width: string;
		height: string;
		zIndex: string;
		backgroundColor: string;
		marginTop: string;
	} | null = null;
	private _savedEditableStyles: {
		height: string;
		minHeight: string;
		maxHeight: string;
		overflow: string;
	} | null = null;

	private _originHeight = "";

	public get isFullscreen(): boolean {
		return this._isFullscreen;
	}

	public init(): void {
		const editor = this.editor;
		const command = new FullscreenCommand(editor, this);

		editor.commands.add(FULLSCREEN_COMMAND, command);
		command.isEnabled = false;

		editor.keystrokes.set(
			"Esc",
			(evt, cancel) => {
				if (!this._isFullscreen) {
					return;
				}
				cancel();
				editor.execute(FULLSCREEN_COMMAND);
			},
			{ priority: "high" }
		);

		this.on("destroy", () => {
			if (this._isFullscreen) {
				const host = editor.ui.view.editable.element?.parentElement;
				const hostParent = host?.parentElement;
				if (host && hostParent) {
					this._restoreDom(editor, host, hostParent);
				}
				this._isFullscreen = false;
				command.refresh();
			}
		});
	}

	/**
	 * Called from {@link FullscreenUI} after {@link module:ui/editorui~EditorUI#event:ready}
	 * when the decoupled editable is in the DOM.
	 */
	public syncDomBaseline(): void {
		const command = this.editor.commands.get(FULLSCREEN_COMMAND);
		if (!command) {
			return;
		}

		const host = this.editor.ui.view.editable.element?.parentElement;
		const hostParent = host?.parentElement;

		if (!host || !hostParent) {
			command.isEnabled = false;
			command.refresh();
			return;
		}

		this._originHeight = host.style.height;
		command.isEnabled = true;
		command.refresh();
	}

	public toggle(callback: FullscreenChangeCallback): void {
		this.onFullscreenChange(callback);
	}

	public onFullscreenChange(callback: FullscreenChangeCallback | null): void {
		this._onChange = callback;
	}

	public toggleFullscreen(): void {
		const editor = this.editor;
		const editorContainer = editor.ui.view.editable.element?.parentElement;
		const editorParentNode = editorContainer?.parentElement;

		if (!editorContainer || !editorParentNode) {
			return;
		}

		this._isFullscreen = !this._isFullscreen;

		if (this._isFullscreen) {
			this._enterFullscreen(editor, editorContainer, editorParentNode);
		} else {
			this._exitFullscreen(editor, editorContainer, editorParentNode);
		}

		editor.commands.get(FULLSCREEN_COMMAND)?.refresh();

		this._onChange?.(this._isFullscreen);
	}

	private _getConfig(): FullscreenConfig {
		return this.editor.config.get("fullscreen") ?? {};
	}

	private _enterFullscreen(
		editor: Editor,
		editorContainer: HTMLElement,
		parentNode: HTMLElement
	): void {
		const cfg = this._getConfig();
		const inPlace = cfg.inPlace === true;
		const externalRoot = inPlace ? null : cfg.appendTo ?? document.body;

		this._wrapper = document.createElement("div");
		this._wrapper.className = "editor-fullscreen ck-fullscreen";
		this._wrapper.setAttribute("data-cke-fullscreen", "true");

		if (cfg.showBackdrop !== false) {
			const backdrop = document.createElement("div");
			backdrop.className = "ck-fullscreen__backdrop v-modal";
			Object.assign(backdrop.style, {
				position: "absolute",
				left: "0",
				top: "0",
				width: "100%",
				height: "100%",
				zIndex: "0",
			});
			this._wrapper.appendChild(backdrop);
		}

		this._originalParent = parentNode;
		this._originalNextSibling = editorContainer.nextSibling;
		this._usedExternalMount = Boolean(externalRoot);

		if (externalRoot) {
			parentNode.removeChild(editorContainer);
			externalRoot.appendChild(this._wrapper);
		} else {
			parentNode.insertBefore(this._wrapper, editorContainer);
		}

		this._wrapper.appendChild(editorContainer);

		const z = cfg.zIndex ?? "10050";

		const box: Partial<CSSStyleDeclaration> = {
			position: "fixed",
			margin: "0",
			padding: "0",
			zIndex: z,
			boxSizing: "border-box",
			display: "flex",
			flexDirection: "column",
			alignItems: "stretch",
			justifyContent: "flex-start",
			overflow: "hidden",
		};

		if (externalRoot) {
			Object.assign(box, {
				top: "0",
				left: "0",
				width: "100vw",
				height: "100vh",
				maxWidth: "100vw",
				maxHeight: "100vh",
				minHeight: "100dvh",
			});
		} else {
			Object.assign(box, {
				inset: "0",
				width: "100%",
				height: "100%",
				maxWidth: "100%",
				maxHeight: "100%",
			});
		}

		Object.assign(this._wrapper.style, box);

		this._savedEditorStyles = {
			position: editorContainer.style.position,
			width: editorContainer.style.width,
			height: editorContainer.style.height,
			zIndex: editorContainer.style.zIndex,
			backgroundColor: editorContainer.style.backgroundColor,
			marginTop: editorContainer.style.marginTop,
		};

		Object.assign(editorContainer.style, {
			position: "relative",
			width: "100%",
			height: "100%",
			flex: "1 1 auto",
			minHeight: "0",
			zIndex: "1",
			backgroundColor: "white",
			marginTop: "0",
		});

		const editable = editor.ui.view.editable.element;
		if (editable) {
			this._savedEditableStyles = {
				height: editable.style.height,
				minHeight: editable.style.minHeight,
				maxHeight: editable.style.maxHeight,
				overflow: editable.style.overflow,
			};

			Object.assign(editable.style, {
				height: "100%",
				minHeight: "0",
				maxHeight: "none",
				overflow: "auto",
			});
		}

		window.requestAnimationFrame(() => {
			editor.editing.view.focus();
		});
	}

	private _exitFullscreen(
		editor: Editor,
		editorContainer: HTMLElement,
		parentNode: HTMLElement
	): void {
		this._restoreDom(editor, editorContainer, parentNode);

		window.requestAnimationFrame(() => {
			editor.editing.view.focus();
		});
	}

	private _restoreDom(
		_editor: Editor,
		editorContainer: HTMLElement,
		_parentNode: HTMLElement
	): void {
		if (!this._wrapper) {
			return;
		}

		if (this._usedExternalMount && this._originalParent) {
			this._originalParent.insertBefore(
				editorContainer,
				this._originalNextSibling
			);
			this._wrapper.remove();
		} else if (this._originalParent) {
			this._originalParent.insertBefore(editorContainer, this._wrapper);
			this._wrapper.remove();
		}

		if (this._savedEditorStyles) {
			const s = this._savedEditorStyles;
			editorContainer.style.position = s.position;
			editorContainer.style.width = s.width;
			editorContainer.style.height = s.height;
			editorContainer.style.zIndex = s.zIndex;
			editorContainer.style.backgroundColor = s.backgroundColor;
			editorContainer.style.marginTop = s.marginTop;
			this._savedEditorStyles = null;
		}

		const editable = this.editor.ui.view.editable.element;
		if (editable && this._savedEditableStyles) {
			const s = this._savedEditableStyles;
			editable.style.height = s.height;
			editable.style.minHeight = s.minHeight;
			editable.style.maxHeight = s.maxHeight;
			editable.style.overflow = s.overflow;
			this._savedEditableStyles = null;
		}

		if (this._originHeight) {
			editorContainer.style.height = this._originHeight;
		} else {
			editorContainer.style.height = "";
		}

		this._wrapper = null;
		this._originalParent = null;
		this._originalNextSibling = null;
		this._usedExternalMount = false;
	}
}
