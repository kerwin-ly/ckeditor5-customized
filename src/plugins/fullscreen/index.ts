import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { ButtonView } from "@ckeditor/ckeditor5-ui";
import { Editor } from "@ckeditor/ckeditor5-core";
import fullscreenIcon from "../../icons/fullscreen-icon.svg";

class Fullscreen extends Plugin {
  static get pluginName() {
    return "Fullscreen";
  }

  private isFullscreen: boolean;
  private fullscreenCb: Function | null;

  constructor(editor: Editor) {
    super(editor);
    this.isFullscreen = false;
    this.fullscreenCb = null;
  }

  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add("fullscreen", (locale) => {
      const view = new ButtonView(locale);

      view.set({
        label: "Fullscreen",
        icon: fullscreenIcon,
        tooltip: true,
      });

      view.on("execute", () => {
        this.toggleFullscreen(editor);
      });

      return view;
    });
  }

  private toggleFullscreen(editor: Editor) {
    this.isFullscreen = !this.isFullscreen;
    const editorContainer = editor.ui.view.editable.element?.parentElement;

    if (!editorContainer) {
      return;
    }

    if (this.isFullscreen) {
      this.enterFullscreen(editorContainer);
    } else {
      this.exitFullscreen(editorContainer);
    }
    if (typeof this.fullscreenCb === "function") {
      this.fullscreenCb(this.isFullscreen);
    }
  }

  public toggle(callback: Function) {
    this.fullscreenCb = callback;
  }

  private enterFullscreen(element: HTMLElement) {
    element.style.position = "fixed";
    element.style.top = "0";
    element.style.left = "0";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.zIndex = "9999";
    element.style.backgroundColor = "white";
    // this.isFullscreen = true;
  }

  private exitFullscreen(element: HTMLElement) {
    element.style.position = "";
    element.style.top = "";
    element.style.left = "";
    element.style.width = "";
    element.style.height = "";
    element.style.zIndex = "";
    element.style.backgroundColor = "";
    // this.isFullscreen = false;
  }
}

export default Fullscreen;
