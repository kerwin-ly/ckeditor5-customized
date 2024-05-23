import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { Editor } from "@ckeditor/ckeditor5-core";
declare class Fullscreen extends Plugin {
    static get pluginName(): string;
    private isFullscreen;
    constructor(editor: Editor);
    init(): void;
    private toggleFullscreen;
    private enterFullscreen;
    private exitFullscreen;
}
export default Fullscreen;
