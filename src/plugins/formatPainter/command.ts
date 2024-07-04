

import { Command, Editor } from "@ckeditor/ckeditor5-core";
import { Element, Writer, Selection, Range, Item } from "ckeditor5/src/engine";

export class FormatPainterCommand extends Command {
  private waiting: any;
  private formatNodes: any[] = [];

  constructor(editor: Editor) {
    super(editor);
    this.formatNodes = [];
    this.waiting = null;
    this.value = false;
  }

  public override refresh(): void {
    const model = this.editor.model;
    const selection = model.document.selection;
    const start = selection.getFirstPosition();
    const end = selection.getLastPosition();
    if (!start || !end || this._isNone(start, end)) {
    	return;
    }

    const range = model.createRange(start, end);
    const formatNodes = Array.from(range.getWalker()).filter((walker) => !!(walker.item as any).textNode);

    // if (!formatNodes.length) {
    // 	this.reset();
    // 	return;
    // }

    this.formatNodes = formatNodes;
    this.isEnabled = true;
  }

  /**
   * @inheritDoc
   *
   * @param {Object} options
   * @param {'copy'|'apply'|'reset'} options.type
   */
  public override execute(options = { type: "reset" }): void {
    const { type } = options;
    if (type === "reset") {
      this.reset();
      return;
    }

    if (type === "apply" && this.waiting) {
      this.apply();
      return;
    }

    if (type === "copy" && this.isEnabled) {
      this.copy();
    }
  }

  private _isNone(start: any, end: any): boolean {
    const [sRow, sCol] = start.path;
    const [eRow, eCol] = end.path;
    if (sRow === eRow) {
      return sCol === eCol;
    }

    return false;
  }

  public reset(): void {
    this.value = false;
    this.formatNodes = [];
    this.waiting = null;
  }

  public copy(): void {
    this.value = true;
    let attrs = {};
    this.formatNodes.forEach((node) => {
      const _attrs = Object.fromEntries(node.item.textNode.getAttributes());
      const _keys = Object.keys(_attrs);
      if (_attrs.hasOwnProperty("linkHref")) {
        delete _attrs.linkHref;
      }

      _keys.forEach((key: string) => {
        if (attrs.hasOwnProperty(key)) delete _attrs[key];
      });

      if (_keys.length) {
        attrs = Object.assign({}, attrs, _attrs);
      }
    });
    this.waiting = attrs;
  }

  public apply(): void {
    const model = this.editor.model;
    const selection = model.document.selection;
    const start = selection.getFirstPosition();
    const end = selection.getLastPosition();

    if (!start || !end || this._isNone(start, end)) {
      return;
    }

    const selectionRange = model.createRange(start, end);

    model.change((writer: Writer) => {
      const walkers = selectionRange.getWalker();
      for (const walker of walkers) {
        const textNode = (walker.item as any).textNode;
        if (textNode) {
          const range = writer.createRange(
            walker.previousPosition,
            walker.nextPosition
          );
          this.setAttributes(writer, range);
        }
      }
    });
  }

  public setAttributes(writer: Writer, itemOrRange: Range): void {
    if (!Object.keys(this.waiting).length) {
      writer.clearAttributes(itemOrRange);
    }
    writer.setAttributes(this.waiting, itemOrRange);
  }
}
