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

      const editorContainer = editor.ui.view.editable.element?.parentElement!;
      const editorParentNode = editorContainer?.parentElement!;

      view.on("execute", () => {
        this.toggleFullscreen(editor, editorContainer, editorParentNode);
      });

      return view;
    });
  }

  private toggleFullscreen(
    editor: Editor,
    editorContainer: HTMLElement,
    editorParentNode: HTMLElement
  ) {
    this.isFullscreen = !this.isFullscreen;

    if (this.isFullscreen) {
      this.enterFullscreen(editor, editorContainer, editorParentNode);
    } else {
      this.exitFullscreen(editor, editorContainer, editorParentNode);
    }
    if (typeof this.fullscreenCb === "function") {
      this.fullscreenCb(this.isFullscreen);
    }
  }

  public toggle(callback: Function) {
    this.fullscreenCb = callback;
  }

  private enterFullscreen(
    editor: Editor,
    element: HTMLElement,
    parentNode: HTMLElement
  ) {
    let newElement = document.createElement("div");
    newElement.className = "editor-fullscreen";
    let coverModal = document.createElement("div");
    coverModal.className = "v-modal";
    newElement.appendChild(coverModal);

    parentNode && parentNode.removeChild(element);
    newElement.appendChild(element);
    document.body.appendChild(newElement);

    newElement.style.position = "fixed";
    newElement.style.width = "100%";
    newElement.style.height = "100%";
    newElement.style.zIndex = "9999";

    element.style.position = "relative";
    element.style.width = "100%";
    element.style.height = "100%";
    element.style.zIndex = "3000";
    element.style.backgroundColor = "white";
    element.style.marginTop = "0";
    // this.isFullscreen = true;
  }

  private exitFullscreen(
    editor: Editor,
    element: HTMLElement,
    parentNode: HTMLElement
  ) {
    document.body.removeChild(document.querySelector(".editor-fullscreen")!);
    parentNode.appendChild(element);

    element.style.marginTop = "50px";
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
