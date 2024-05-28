import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { Editor } from "@ckeditor/ckeditor5-core";
declare class Fullscreen extends Plugin {
    static get pluginName(): string;
    private isFullscreen;
    private fullscreenCb;
    constructor(editor: Editor);
    init(): void;
    private toggleFullscreen;
    toggle(callback: Function): void;
    private enterFullscreen;
    private exitFullscreen;
}
export default Fullscreen;
