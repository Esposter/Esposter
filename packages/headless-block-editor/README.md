# headless-block-editor

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A headless block editor: a typed node tree over a registry, the commands that edit it as JSON Patch operations, and navigation, with no framework or DOM.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⌨️ [Commands](#commands)
- 🔗 [Related Documentation](#related)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i headless-block-editor zod
```

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/headless-block-editor) to level up.

A registry declares its root, the content types the root accepts and the props schema its props pass, beside its types. `renderBlockNodes` folds a checked document into a consumer's output, rendering each node once its slots have rendered. Its undo history is the bounded history of @esposter/shared.

### Key Exports

| Export                      | Kind      | Purpose                                                                                                                |
| :-------------------------- | :-------- | :--------------------------------------------------------------------------------------------------------------------- |
| `applyBlockEdit`            | function  | Applies an edit's operations and parses the result with the document's schema, refusing the whole edit if either fails |
| `BlockChildren`             | type      | A consumer's children port, switched on a node's type so a slot the type lacks fails the typecheck                     |
| `BlockDocument`             | interface | A document: its content, and its root's props                                                                          |
| `BlockRegistry`             | interface | One definition per block type, and the root's definition                                                               |
| `BlockTypeDefinition`       | interface | One block type's props schema, and the child types each of its slots allows                                            |
| `createBlockDocumentSchema` | function  | The document's schema: content the root accepts, props, ids unique across every slot, and a node limit                 |
| `getBlockLayerRows`         | function  | Every node in document order, with its depth and pointer                                                               |
| `insertBlockNode`           | function  | Adds a node at an index of a slot, or no operations when the slot does not accept its type                             |
| `moveBlockNode`             | function  | Moves a node to an index of another slot as a remove and an add, or no operations when refused                         |
| `removeBlockNode`           | function  | Removes the node a pointer names, with its subtree                                                                     |
| `renderBlockNodes`          | function  | Renders each node once its slots have rendered, skipping a node whose type the registry lacks                          |
| `updateBlockNodeProps`      | function  | One JSON Patch add per prop, replacing a prop the node already has                                                     |

### Usage

```ts
import { applyBlockEdit, insertBlockNode } from "headless-block-editor";

// The registry, children port and document schema are the consumer's own, the schema made by createBlockDocumentSchema
const operations = insertBlockNode(document, registry, children, "/content/0/props/children", 1, {
  props: { id: crypto.randomUUID(), text: "" },
  type: "heading",
});
// A neverthrow Result: its document is the schema's typed output, and its inverses undo the edit
const edit = applyBlockEdit(documentSchema, document, operations);
```

## <a name="commands">⌨️ Commands</a>

```bash
pnpm build       # Builds `dist`
pnpm lint        # Lints the package
pnpm lint:fix    # Lints the package and fixes what it can
pnpm test        # Runs the tests with Vitest in watch mode
pnpm typecheck   # Typechecks the package
```

## <a name="related">🔗 Related Documentation</a>

- [neverthrow](https://github.com/supermacro/neverthrow)
- [Vitest](https://vitest.dev/guide/)
- [Zod](https://zod.dev/)

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/headless-block-editor/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/headless-block-editor/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/headless-block-editor/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/headless-block-editor.svg
