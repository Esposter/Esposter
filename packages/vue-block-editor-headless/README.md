# vue-block-editor-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

This package is a headless Vue block editor with no styling or DOM. It edits a typed node tree over a registry, with commands that edit it as JSON Patch operations, and its `useEditSession` composable holds one document's edit state for a Vue component.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/vue-block-editor-headless).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- 📝 [Usage](#usage)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i vue-block-editor-headless zod
```

## <a name="key-exports">🧩 Key Exports</a>

| Export                      | Kind       | Purpose                                                                                                                                    |
| :-------------------------- | :--------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `applyBlockEdit`            | function   | Applies an edit's operations and parses the result with the document's schema, refusing the whole edit if either fails                     |
| `BlockChildren`             | type       | A consumer's children port, switched on a node's type so a slot the type lacks fails the typecheck                                         |
| `BlockDocument`             | interface  | A document: its content and its root's props, with a third type parameter naming the node type the root accepts (default: every node type) |
| `BlockRegistry`             | interface  | One definition per block type, and the root's definition                                                                                   |
| `BlockTypeDefinition`       | interface  | One block type's props schema, and the child types each of its slots allows                                                                |
| `createBlockDocumentSchema` | function   | The document's schema: content the root accepts, props, ids unique across every slot, and a node limit                                     |
| `getBlockLayerRows`         | function   | Every node in document order, with its depth and pointer                                                                                   |
| `insertBlockNode`           | function   | Adds a node at an index of a slot, or no operations when the slot does not accept its type                                                 |
| `moveBlockNode`             | function   | Moves a node to an index of another slot as a remove and an add, or no operations when refused                                             |
| `NO_BLOCK_SLOTS`            | constant   | The slots of a node that holds none, the record a children port returns for it                                                             |
| `removeBlockNode`           | function   | Removes the node a pointer names, with its subtree                                                                                         |
| `renderBlockNodes`          | function   | Renders each node once its slots have rendered, skipping a node whose type the registry lacks                                              |
| `updateBlockNodeProps`      | function   | One JSON Patch add per prop, replacing a prop the node already has                                                                         |
| `useEditSession`            | composable | An editing session over one document: a commit sets the document and its undo history together, and a load clears the history              |

## <a name="usage">📝 Usage</a>

```ts
import { applyBlockEdit, insertBlockNode } from "vue-block-editor-headless";

// The registry, children port and document schema are the consumer's own, the schema made by createBlockDocumentSchema
const operations = insertBlockNode(document, registry, children, "/content/0/props/children", 1, {
  props: { id: v7(), text: "" },
  type: "heading",
});
// A neverthrow Result: its document is the schema's typed output, and its inverses undo the edit
const edit = applyBlockEdit(documentSchema, document, operations);
```

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/vue-block-editor-headless/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/vue-block-editor-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/vue-block-editor-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/vue-block-editor-headless.svg
