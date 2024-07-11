import { Plugin } from "ckeditor5/src/core.js";
import { FormatPainterEditing } from "./editing";
import FormatPainterUI from "./ui";

export const FORMAT_PAINTER = "formatPainter";

export default class FormatPainter extends Plugin {
  public static get requires() {
    return [FormatPainterEditing, FormatPainterUI] as const;
  }

  public static get pluginName() {
    return "Format Painter" as const;
  }
}
