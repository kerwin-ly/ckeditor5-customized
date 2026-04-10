# CKEditor 5 editor generated with the online builder

This repository contains a CKEditor 5 build produced with the [Online builder tool](https://ckeditor.com/ckeditor-5/online-builder) and adds custom plugins (Fullscreen, Format Painter).

## Quick start

### Install dependencies

```shell
yarn
```

### Develop with live rebuild (recommended)

```shell
yarn dev
```

Then open [http://localhost:8080/sample/index.html](http://localhost:8080/sample/index.html)

### Production build

```shell
yarn build
```

### Publish to npm

```shell
npm login
npm publish
```

### Adding or removing plugins

Follow the official guide: [Adding a plugin to an editor](https://ckeditor.com/docs/ckeditor5/latest/installation/plugins/installing-plugins.html#adding-a-plugin-to-an-editor).

---

## Custom plugins

### Format Painter

There is **no** `editor.config` block for this plugin. It is controlled via the toolbar item and the command API.

| Item | Value |
|------|--------|
| Toolbar item name | `formatPainter` |
| Command name | `formatPainter` (see exported `FORMAT_PAINTER`) |

**Command:** `editor.execute('formatPainter', { type })`

| `type` | Behavior |
|--------|----------|
| `'copy'` | Copies formatting from the current non-empty selection (when the command is enabled). |
| `'apply'` | Applies copied formatting to the current selection (used by the UI after copy). |
| `'reset'` | Clears the format-painter state. |

The toolbar button toggles copy/reset; mouseup applies when active. Integrations can also use `editor.commands.get('formatPainter')` for `isEnabled`, `value`, etc.

**TypeScript imports from this package:**

```ts
import DecoupledEditor, { FORMAT_PAINTER } from "ckeditor5-customized";
```

---

### Fullscreen

**Editor configuration** (`EditorConfig.fullscreen`):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `inPlace` | `boolean` | `false` | If `true`, the fullscreen layer stays under the editor’s original parent (useful for focus traps, e.g. inside Ant Design `Modal`). If `false`, the editable host is moved to `appendTo` (default `document.body`) for full-viewport coverage. |
| `appendTo` | `HTMLElement` | `document.body` when `inPlace` is not `true` | Mount node for the fullscreen root. |
| `zIndex` | `string` | `'10050'` | CSS `z-index` of the fullscreen layer. |
| `showBackdrop` | `boolean` | `true` | Whether to show the dimmed backdrop behind the editor. |

**Keyboard:** `Esc` exits fullscreen when active.

**Main plugin API** (`editor.plugins.get('Fullscreen')`):

- `isFullscreen` (getter)
- `onFullscreenChange((isFullscreen: boolean) => void | null)`
- `toggle(callback)` — deprecated alias for `onFullscreenChange`

**Command / toolbar:**

- Toolbar item and command name: `'fullscreen'` (exported as `FULLSCREEN_COMMAND`).
- `editor.execute('fullscreen')` toggles fullscreen.

**Examples:**

```js
// Default: mount on document.body, cover the whole viewport.
DecoupledEditor.create(element, {
  fullscreen: {},
});

// Stay in the original DOM subtree (e.g. modal + focus trap).
DecoupledEditor.create(element, {
  fullscreen: { inPlace: true },
});

// Custom mount + z-index.
DecoupledEditor.create(element, {
  fullscreen: {
    appendTo: document.getElementById("my-portal"),
    zIndex: "20000",
    showBackdrop: false,
  },
});

const fs = editor.plugins.get("Fullscreen");
fs.onFullscreenChange((on) => {
  console.log("fullscreen:", on);
});
```

**TypeScript imports from this package:**

```ts
import DecoupledEditor, {
  FULLSCREEN_COMMAND,
  type FullscreenConfig,
} from "ckeditor5-customized";
```

---

## How to use as an npm package

```shell
npm install ckeditor5-customized -S
```

or

```shell
yarn add ckeditor5-customized
```

**HTML (Decoupled editor):**

```html
<div>
  <div id="toolbar"></div>
  <div id="editor"></div>
</div>
```

**JavaScript:**

```js
import DecoupledEditor from "ckeditor5-customized";

const editorContainer = document.getElementById("editor");

DecoupledEditor.create(editorContainer, {}).then((editor) => {
  const toolbarContainer = document.getElementById("toolbar");
  toolbarContainer.appendChild(editor.ui.view.toolbar.element);
  editor.setData("<p>Hello</p>");
});
```

The default build includes `formatPainter` and `fullscreen` toolbar items. If you need a different toolbar setup, configure your build accordingly.
