# mjml-blocks

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

This package provides MJML's components as block types for the headless block editor. It renders to MJML's JSON form and MJML source, and it reads MJML source back, refusing any tag, attribute or value it does not take.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs/mjml-blocks).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i mjml-blocks mjml zod
```

The consumer runs the compile. Install `mjml` and `zod` beside the package. `zod` is the peer that the schemas are written in. The example below does the following:

1. Declares one leaf type, which a node schema needs.
2. Registers MJML's components beside that leaf type.
3. Renders a one-section email to MJML's JSON form.
4. Compiles the JSON under strict validation.

```ts
import mjml2html from "mjml";
import {
  createMjmlDocumentSchema,
  createMjmlNodeSchema,
  createMjmlRegistry,
  mjmlNodeChildren,
  renderMjmlDocument,
} from "mjml-blocks";
import type { MjmlRichTextDefinition } from "mjml-blocks";
import { z } from "zod";

// The document holds this leaf beside MJML's own nodes. Declare it by merging its type tag into MjmlLeafNodes.
// A column or a hero names a leaf only when the registry is given its full definition as leafTypes.
// This example leaves leafTypes empty, so its columns and heroes hold MJML's own nodes alone
interface LinkNode {
  props: { href: string; id: string };
  type: "link";
}

declare module "mjml-blocks" {
  interface MjmlLeafNodes {
    link: LinkNode;
  }
}

const richText: MjmlRichTextDefinition<{ text?: string }> = {
  parseHtml: (html) => ({ text: html }),
  renderHtml: (content) => content.text ?? "",
  schema: z.object({ text: z.string().optional() }),
};
const { bodyChildrenSchema } = createMjmlNodeSchema({
  leafNodeSchema: z.strictObject({
    props: z.strictObject({ href: z.string(), id: z.string() }),
    type: z.literal("link"),
  }),
  maxChildren: Number.MAX_SAFE_INTEGER,
  richText,
});
const registry = createMjmlRegistry({
  children: (node) => (node.type === "link" ? {} : mjmlNodeChildren(node)),
  leafTypes: [],
  richText,
});
const document = createMjmlDocumentSchema(registry, bodyChildrenSchema, Number.MAX_SAFE_INTEGER).parse({
  content: [
    {
      props: {
        children: [
          {
            props: { children: [{ props: { content: { text: "Hello" }, id: v7() }, type: "mj-text" }], id: v7() },
            type: "mj-column",
          },
        ],
        id: v7(),
      },
      type: "mj-section",
    },
  ],
  root: { props: {} },
});
const json = renderMjmlDocument(document, registry, { context: undefined, isStampingIds: false });
const { html } = await mjml2html(json, { validationLevel: "strict" });
```

## <a name="key-exports">🧩 Key Exports</a>

| Export               | What it is                                                                                          |
| :------------------- | :-------------------------------------------------------------------------------------------------- |
| `createMjmlRegistry` | MJML's component set as block types, with the consumer's leaf types and rich text                   |
| `MjmlDocument`       | a document whose head is the root's props, typed by the registry                                    |
| `parseMjmlDocument`  | MJML source read back into a document, refusing a tag, attribute or value the package does not take |
| `renderMjmlDocument` | a checked document rendered to MJML's JSON form                                                     |
| `serializeMjml`      | MJML's JSON form written as MJML source                                                             |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/mjml-blocks/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/mjml-blocks/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/mjml-blocks/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/mjml-blocks.svg
