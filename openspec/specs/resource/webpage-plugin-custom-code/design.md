# Webpage Plugin Custom Code

The webpage editor's Extra category holds a custom code block: a component the author fills with HTML from a modal, with a code editor and a Save button. It comes from `customCodePlugin`, our own module that replaces the `grapesjs-custom-code` npm package. Registered with no options, since the app passed none.

## How it works

The plugin registers the block `custom-code` and the component type `custom-code` on the editor, under the upstream ids, so the markup it parses back into components is unchanged. It also registers the command `custom-code:open-modal`, which the component's toolbar button and a double-click both run.

The modal's code is stored on the component as the `custom-code-plugin__code` property, and the component's children are that code parsed by grapesjs's own HTML parser. That parser strips `<script>` elements and `on*` attributes, so a script typed into the block never reaches the canvas or the exported HTML. A code that still contains `<script` shows a placeholder on the canvas instead of its markup, and the component is not droppable into.

An empty code keeps the default text, so the block stays something a reader can click to edit again.

The editor saves the page as `getHtml()` and `getCss()` only, so a reloaded page has its custom code as plain markup, not as this component (see the upstream table, #5, #9, #15 and #30).

## Upstream

Its 39 issues and pull requests with their verdicts, the Dependabot bumps sharing a row. Two defects its source map showed beyond them follow the table.

| Upstream                     | Subject                                                                            | Verdict                     | Proof or owner                                                                                                                                                                                               |
| :--------------------------- | :--------------------------------------------------------------------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #1                           | Issue with the development instructions                                            | False positive              | The old boilerplate's dev instructions; this module has no boilerplate                                                                                                                                       |
| #2, #14                      | Scripts are not rendered on the canvas                                             | Out of scope, by design     | The placeholder is the intent; the parser strips `<script>` (the test "a script in the code is never in the exported HTML")                                                                                  |
| #3                           | Auto-formatting on save breaks Django tags                                         | Out of scope                | The plugin's save stores the editor's text unchanged; `js-beautify` runs only on the app's import modal, in `WebpageEditorPlugins.ts`                                                                        |
| #4                           | A second drag of the block shows the placeholder text                              | False positive              | Not reproduced on 1.0.2: a second drop renders the default text (headless run; the defaults are a string, so no object is shared between drops)                                                              |
| #5, #9, #15, PR #30          | A reloaded HTML loses the custom-code type, so the code is not editable            | Feature, not built          | The app saves `getHtml()` only (`Resource/Webpage/Editor.vue`), which holds no code to restore; the maintainer's answer is to store the project JSON. Needs a save-format decision for the webpage save path |
| #6                           | `mjml-get-code` misses the custom code                                             | Out of scope                | The email editor's MJML export; the webpage editor does not use MJML                                                                                                                                         |
| #7                           | A `<template>` in the code renders empty                                           | Out of scope, grapesjs core | The parser's handling of the `template` element, not this plugin's                                                                                                                                           |
| #8, #10, #11, #25            | Plugin not found, or not loaded on the server                                      | False positive              | Packaging and string-id lookup of the old package; the module is imported, not looked up by name                                                                                                             |
| #12, #16                     | Quote marks and entities converted in the output                                   | Out of scope, grapesjs core | The exporter's text escaping; the rewrite keeps the same `components(code)` path, so the output is unchanged                                                                                                 |
| #13                          | README example for the npm install                                                 | Out of scope                | Documentation of the package that is no longer a dependency                                                                                                                                                  |
| PR #17                       | The Save button submits an enclosing form                                          | False positive              | Fixed upstream: the button is `type="button"`, and the module keeps it (`createSaveButton`)                                                                                                                  |
| #18                          | Parse the code as text/html for templating                                         | Out of scope, rejected      | A raw HTML parser would bypass the parser's script and `on*` stripping, so it is an XSS path; not offered                                                                                                    |
| #19, #22                     | CodeMirror version, autocomplete and theme CSS                                     | Out of scope                | The viewer is grapesjs's `CodeManager`; its theme CSS is grapesjs's                                                                                                                                          |
| PR #20, PR #29, #28          | Move to the CLI, the TypeScript rewrite, and grapesjs 0.20 compatibility           | Out of scope, superseded    | Tooling and the 0.20 API; the module is TypeScript on the app's toolchain and targets the grapesjs 0.23 API the editor runs                                                                                  |
| #21                          | `defaults` has only a getter (grapesjs 0.20.1)                                     | False positive              | A 0.20 API break; the module uses the 0.23 `Components.addType` API                                                                                                                                          |
| #23, #24, #26, #27, #31, #32 | Dependabot bumps (loader-utils, json5, webpack, @babel/traverse, follow-redirects) | Out of scope                | Bumps of the upstream's build dependencies; the package and its build are no longer ours                                                                                                                     |
| #33                          | Saving an empty code leaves the block with nothing to click                        | Defect, fixed               | An empty code left zero children, so the block had no size to double-click; the module keeps the default text (test "#33 an empty code keeps the default text")                                              |
| #34                          | Render React components from the code                                              | Out of scope                | A React renderer is a separate plugin's job; the block takes HTML                                                                                                                                            |
| #35, #36                     | A `<script>` is sanitised in the output, or not imported from a template           | Out of scope, by design     | The parser's `allowScripts` is off, and the app does not set it; enabling it would run scripts in the canvas and the export. Stays off                                                                       |
| #37                          | An iframe in the code is shown as a div on the canvas                              | Out of scope, grapesjs core | The canvas's component types for `iframe`, not the plugin's                                                                                                                                                  |
| #38                          | CSS from the code persists after the block is removed                              | Out of scope, grapesjs core | A `<style>` in the code is removed by the parser and parsed into global CSS (`parserCss`), not into the component; the app registers `grapesjs-parser-postcss` for it                                        |
| #39                          | Editing the children does not update the code                                      | Feature, not built          | The stored code is the source the modal edits; syncing the children back would change what the source is, a design decision                                                                                  |

Fixed beyond the issues, each tested as "no upstream issue":

- Two custom codes shared one pending placeholder update, so the second change cancelled the first's, and the first never showed its placeholder or stopped being droppable. Fixed by keeping the pending update per view (test "no upstream issue: two custom codes each get their own pending placeholder update").

## Security

The module passes user HTML through grapesjs's parser exactly as the upstream does, so the script and escaping behaviour is unchanged by the rewrite. The parser's own checks, read from grapesjs 0.23.6 ("sanitizeNode"), remove an element's `on*` attributes and an attribute value that starts with `javascript:` exactly. Those checks are weaker than they look, and the verdicts below are read from the source; they were not reproduced in a browser, since the test DOM drops every attribute the parser reads.

| Vector                                                                                            | Verdict                                 | Owner                                                                 |
| :------------------------------------------------------------------------------------------------ | :-------------------------------------- | :-------------------------------------------------------------------- |
| `<script>` in the code                                                                            | Blocked (parser, by default)            | grapesjs core; a test pins that it is absent from the export          |
| `on*` attributes                                                                                  | Blocked (parser)                        | grapesjs core                                                         |
| `javascript:` with a leading space or a different case, `srcdoc`, SVG `xlink:href`, `form action` | Open, not blocked by the parser's check | grapesjs core parser ("sanitizeNode"); the rewrite does not change it |
| `allowScripts` or `allowUnsafeAttr` set on the editor                                             | Off; the app does not set them          | `Resource/Webpage/Editor.vue` and `WebpageEditorPlugins.ts`           |

The open vectors reach the stored HTML the editor saves, so a published page with them can run script in a viewer's browser. Closing them is a decision for the webpage publish or render path (sanitising the saved HTML once at its boundary), not for this block; it is recorded here and not fixed by the rewrite.

## Key files

| File                                                                   | Role                                                                     |
| :--------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `apps/web/app/services/webpageEditor/plugins/customCodePlugin.ts`      | The module: the custom-code component type, its modal and its sanitising |
| `apps/web/app/services/webpageEditor/plugins/customCodePlugin.test.ts` | The component, script and sanitising tests                               |
| `apps/web/app/services/webpageEditor/WebpageEditorPlugins.ts`          | The editor's plugin list, where the plugin is passed with its options    |
| `apps/web/app/components/Resource/Webpage/Editor.vue`                  | The editor that saves `getHtml()`, which holds no code to restore        |

## Sources

- Upstream repository: `GrapesJS/components-custom-code` (version 1.0.2, read from its published source map).
- grapesjs 0.23.6 for the parser's sanitising ("sanitizeNode", `allowScripts`), `resetFromString` and the component types.
