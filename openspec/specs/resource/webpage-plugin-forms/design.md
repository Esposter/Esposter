# Webpage Plugin Forms

The webpage editor registers the form component types on every page, so a saved page that holds a form, input, select or button loads as that component. The Forms sidebar category is empty: the editor's `usePlugin(formsPlugin, { blocks: [] })` call registers no blocks. The component types and the options trait come from `formsPlugin`, our own module that replaces the `grapesjs-plugin-forms` npm package.

## How it works

The plugin registers nine component types on the editor, under the upstream ids: `form`, `input`, `textarea`, `option`, `select`, `checkbox`, `radio`, `button` and `label`. Each keeps the upstream tag, traits and defaults, so saved projects reference them unchanged. The `select-options` trait writes one `value::label` line per option and reads them back; an option's label is a text node child.

The options take the upstream surface: `blocks` filters which of the eight form blocks are registered, `category` sets the block category (default `Forms`), and `block(id)` adds properties to one block. Preview interaction is kept: a form's submit is always prevented, and the select, checkbox, radio and button events are ignored in the editor unless the editor is in preview.

Changes from the package:

- A select's default options carry their labels as text node children, so the options trait reads `opt1::Option 1` (the package read `opt1::`).
- An option line keeps everything after its first `::` as the label.
- An input, textarea and select have an `id` trait, so a label's `for` can point at them. The checkbox already had one.

## Upstream

All forty-eight upstream issues and pull requests, the twenty dependency bumps sharing one row:

| Upstream                                                              | Subject                                                   | Verdict                       | Proof or owner                                                                                                                  |
| :-------------------------------------------------------------------- | :-------------------------------------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| #1                                                                    | How to add option elements to a select                    | False positive, answered      | The options trait answers it: one `value::label` line per option (`select-options`)                                             |
| #2                                                                    | An empty form that drops can take                         | Out of scope                  | A form's size is the page's own CSS, which the user's style manager owns                                                        |
| #3                                                                    | The button text trait blurs after each letter             | False positive, fixed         | The text trait is `changeProp: true` in the upstream source and in `formsPlugin`                                                |
| #4                                                                    | Form method shows POST with no method attribute           | False positive, fixed         | The form defaults to `method="get"`; "#4" in `formsPlugin.test.ts` pins that the method trait reads GET                         |
| #5                                                                    | PR: category option                                       | Feature, kept                 | The `category` option is in `FormsPluginOptions`; "category and block options" in `formsPlugin.test.ts`                         |
| #6                                                                    | Form elements have no id, so a label's `for` does nothing | Feature, implemented          | Inputs, textareas and selects take an `id` trait; "#6" in `formsPlugin.test.ts`                                                 |
| #7                                                                    | Other blocks disappear when the plugin is added           | False positive, stale         | The only reply asks for a reproduction on the latest versions; none is recorded                                                 |
| #8                                                                    | Form elements cannot be dragged                           | False positive, stale         | The maintainer's reply says it is not a bug (`draggable` on the form); 2.0.5 lets elements drop outside a form (#16's reply)    |
| #9                                                                    | A component with a script block does not run              | Out of scope                  | A question about grapesjs component scripts, not this package; `script` belongs to grapesjs core                                |
| #10                                                                   | Input contents are not stored with the component          | Out of scope                  | The maintainer's reply is to extend the form components; the editor's form components keep the upstream shape                   |
| #11                                                                   | PR: improved docs                                         | Out of scope                  | Docs of a package we no longer depend on                                                                                        |
| #12                                                                   | The `blocks` option does not filter blocks                | False positive, fixed         | The filter works in 2.0.6 and in `formsPlugin`; "#12" in `formsPlugin.test.ts` keeps a subset                                   |
| #13                                                                   | All buttons are identified as inputs                      | False positive, fixed         | The button type has its own `isComponent` (`BUTTON`); "#13 #47" in `formsPlugin.test.ts` parses one                             |
| #15                                                                   | A hidden input type                                       | Out of scope                  | The maintainer's reply is a custom component for hidden fields; the editor has no hidden-field use yet                          |
| #16                                                                   | Form elements rejected by blocks-basic's drop target      | False positive, fixed         | Fixed in 2.0.5 (the maintainer's reply); the form's `droppable` is `:not(form)`                                                 |
| #23                                                                   | Attributes stay editable after reload                     | Out of scope                  | The maintainer's reply: set the value from a plugin on load; the trait panel is the editor's own                                |
| #24                                                                   | Cannot override the block category                        | False positive, fixed         | The category is the plugin's own `category` option; "category and block options" in `formsPlugin.test.ts`                       |
| #27                                                                   | A select's options show their value, not their text       | Defect, fixed here            | Reproduced on 2.0.6: the default options read `opt1::`. "#27 #29" in `formsPlugin.test.ts` fails on the package and passes here |
| #29                                                                   | PR: fix `createOption`                                    | Defect, fixed here            | The option's label was a property, not a child text node. Fixed by the same test as #27                                         |
| #32                                                                   | Form method accepts only get and post                     | Out of scope                  | The HTML standard limits a form's method to `get` and `post`; the select stays                                                  |
| #37, #38                                                              | A label or button gets text when dropped                  | Out of scope, by design       | The component defaults are `Label` and `Send`; the upstream's maintainer says the bug is an old version, but it is in 2.0.5 too |
| #39                                                                   | PR: preview interaction, category and block options       | Feature, kept                 | Preview interaction is the `checkIfInPreview` guard; the category and block options are in `FormsPluginOptions`                 |
| #40                                                                   | Type definitions break on a grapesjs dev branch           | False positive, fixed         | The module is typed on the grapesjs 0.23 API the editor runs                                                                    |
| #44                                                                   | Is this the same as `grapesjs-plugin-forms-ca`            | False positive, other package | A question about a different package on npm                                                                                     |
| #46                                                                   | Break change from grapesjs 0.20.1                         | False positive, fixed         | The module is written against the grapesjs 0.23 API the editor runs                                                             |
| #47                                                                   | A select inherits `type="text"` from the input            | False positive, fixed         | The select is its own component type, not an input; "#13 #47" in `formsPlugin.test.ts`                                          |
| #48                                                                   | Styling and alignment of the form example                 | Out of scope                  | A question about the demo's styling; the page builder's style manager owns styling                                              |
| #14, #17 to #22, #25, #26, #28, #30, #31, #33 to #36, #41 to #43, #45 | Dependabot bumps                                          | Out of scope                  | One line for the group: we no longer depend on the package                                                                      |

Counts: 2 defects (fixed here), 3 features (1 implemented, 2 kept), 10 out of scope, 13 false positives, 20 dependency bumps.

## Key files

| File                                                              | Role                                                                  |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `apps/web/app/services/webpageEditor/plugins/formsPlugin.ts`      | The module: the form blocks, their traits and the preview check       |
| `apps/web/app/services/webpageEditor/plugins/formsPlugin.test.ts` | The block and trait tests                                             |
| `apps/web/app/services/webpageEditor/WebpageEditorPlugins.ts`     | The editor's plugin list, where the plugin is passed with its options |

## Sources

- Upstream repository: `GrapesJS/components-forms` (version 2.0.6, read from its published source map).
- grapesjs 0.23 for the component, trait and block APIs.
