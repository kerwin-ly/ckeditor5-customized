/**
 * @license Copyright (c) 2014-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { DecoupledEditor } from "@ckeditor/ckeditor5-editor-decoupled";
import { Alignment } from "@ckeditor/ckeditor5-alignment";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
} from "@ckeditor/ckeditor5-basic-styles";
import { BlockQuote } from "@ckeditor/ckeditor5-block-quote";
import { CKBox } from "@ckeditor/ckeditor5-ckbox";
import { CloudServices } from "@ckeditor/ckeditor5-cloud-services";
import type { EditorConfig } from "@ckeditor/ckeditor5-core";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { FindAndReplace } from "@ckeditor/ckeditor5-find-and-replace";
import {
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
} from "@ckeditor/ckeditor5-font";
import { Heading } from "@ckeditor/ckeditor5-heading";
import { Highlight } from "@ckeditor/ckeditor5-highlight";
import {
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
} from "@ckeditor/ckeditor5-image";
import { Indent, IndentBlock } from "@ckeditor/ckeditor5-indent";
import { Link } from "@ckeditor/ckeditor5-link";
import { List, ListProperties, TodoList } from "@ckeditor/ckeditor5-list";
import { MediaEmbed } from "@ckeditor/ckeditor5-media-embed";
import { Paragraph } from "@ckeditor/ckeditor5-paragraph";
import { PasteFromOffice } from "@ckeditor/ckeditor5-paste-from-office";
import {
  Table,
  TableCellProperties,
  TableProperties,
  TableToolbar,
} from "@ckeditor/ckeditor5-table";
import { TextTransformation } from "@ckeditor/ckeditor5-typing";
import { Undo } from "@ckeditor/ckeditor5-undo";
import { Fullscreen, FormatPainter } from "./plugins";

// You can read more about extending the build with additional plugins in the "Installing plugins" guide.
// See https://ckeditor.com/docs/ckeditor5/latest/installation/plugins/installing-plugins.html for details.

class Editor extends DecoupledEditor {
  public static override builtinPlugins = [
    Alignment,
    Autoformat,
    BlockQuote,
    Bold,
    CKBox,
    CloudServices,
    Essentials,
    FindAndReplace,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Heading,
    Highlight,
    Image,
    ImageCaption,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    ImageUpload,
    Indent,
    IndentBlock,
    Italic,
    Link,
    List,
    ListProperties,
    MediaEmbed,
    Paragraph,
    PasteFromOffice,
    PictureEditing,
    Strikethrough,
    Table,
    TableCellProperties,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
    Undo,
    Fullscreen,
    FormatPainter,
  ];

  public static override defaultConfig: EditorConfig = {
    toolbar: {
      items: [
        "heading",
        "|",
        "fontSize",
        "fontFamily",
        "|",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "|",
        "alignment",
        "|",
        "numberedList",
        "bulletedList",
        "|",
        "outdent",
        "indent",
        "|",
        "todoList",
        "link",
        "blockQuote",
        "imageUpload",
        "insertTable",
        "mediaEmbed",
        "findAndReplace",
        "highlight",
        "|",
        "undo",
        "redo",
        "fullscreen",
				"formatPainter"
      ],
    },
    language: "en",
    image: {
      toolbar: [
        "imageTextAlternative",
        "toggleImageCaption",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
      ],
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableCellProperties",
        "tableProperties",
      ],
    },
    heading: {
      options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          // { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'text-huge' },
          // { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'text-big' },
          {
            model: 'heading1',
            view: {
                name: 'h1',
                classes: 'text-huge'
            },
            title: 'Heading 1',
            class: 'text-huge',
        },
          {
            model: 'heading2',
            view: {
                name: 'h2',
                classes: 'text-big'
            },
            title: 'Heading 2',
            class: 'text-big',
        }
      ]
    }
  }
}

export default Editor;
