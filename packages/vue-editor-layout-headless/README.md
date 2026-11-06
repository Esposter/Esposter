# vue-editor-layout-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A headless editor layout: the regions and panels of an editor held as data, resolved for the mode, tool, selection and window size, with the reader's sizes and open regions kept apart from it.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-editor-layout-headless
```

Its peers are `vue`, `@vueuse/core` and `zod`, which the app already ships.

## <a name="key-exports">🧩 Key Exports</a>

| Export                                              | Kind      | Purpose                                                                                                                                         |
| --------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkLayout`                                       | function  | The gaps in a layout for an editor: a selection kind with no content, an unregistered content key, a duplicate id, a panel in an unknown region |
| `Condition`                                         | interface | A panel's condition: lists of modes, tools and selection kinds, where a missing or empty list matches any value                                 |
| `Context`                                           | interface | What the reader is doing: the mode, the tool, the selection kind (`""` when nothing is selected) and the selection count                        |
| `EditorLayout`                                      | interface | What `useEditorLayout` answers: the reader's state, the resolved layout and the functions that change the reader's state                        |
| `Finding`                                           | interface | One thing a layout check reports, with the id, selection kind or content key it names                                                           |
| `FindingKind`                                       | enum      | What a layout check found: a duplicate id, a missing content, an unknown region or an unregistered content key                                  |
| `getDefaultReaderState`                             | function  | The reader state of a reader who has changed nothing                                                                                            |
| `Layout`                                            | interface | An editor's layout as plain data: its canvas, its regions and its panels                                                                        |
| `Panel`                                             | interface | A panel in one region, shown under its condition, with the content each selection kind shows                                                    |
| `parseReaderState`                                  | function  | Reads a stored value back as a reader state for a layout, or answers the default state when the value is not one                                |
| `Region`                                            | interface | A strip at one edge of the window, with its presentation for each size class, its size limits and how it opens                                  |
| `RegionEdge`                                        | enum      | The edge of the window a region sits at: top, bottom, start or end                                                                              |
| `RegionOpening`                                     | enum      | Whether a region opens with its content or on demand                                                                                            |
| `RegionPresentation`                                | enum      | How a region is drawn for a size class: docked, overlay, sheet or hidden                                                                        |
| `ReaderState`                                       | interface | What a reader has changed: each region's size, which on-demand regions are open and each tabbed region's active panel                           |
| `resizeRegion`                                      | function  | A reader state with a region sized to the size asked for, held between its limits                                                               |
| `resolveLayout`                                     | function  | Resolves a layout for a context, a size class and a reader state into the canvas and the regions to draw                                        |
| `ResolvedLayout`, `ResolvedRegion`, `ResolvedPanel` | interface | What resolving answers: the canvas and the regions, each with its edge, presentation, size, open state and panels                               |
| `setActivePanel`                                    | function  | A reader state with a tabbed region's active panel set                                                                                          |
| `SizeClass`                                         | enum      | The window's size class, compact, medium or expanded, which the caller derives                                                                  |
| `toggleRegion`                                      | function  | A reader state with a region's open state turned over                                                                                           |
| `useEditorLayout`                                   | function  | An editor's layout resolved for its reactive context and size class, with the reader's state kept beside it                                     |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-editor-layout-headless/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-editor-layout-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-editor-layout-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-editor-layout-headless.svg
