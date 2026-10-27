# mjml-blocks

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

MJML's components as block types on the headless block editor, with a render to MJML's JSON form and source and a read back from MJML that refuses what the package does not take.

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

The compile is the consumer's, so `mjml` is installed beside the package, and so is `zod`, the peer the schemas are written in. This example declares one leaf type, which a node schema needs, registers MJML's components beside it, renders a one-section email to MJML's JSON form and compiles it under strict validation:

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

// A leaf the document holds beside MJML's own nodes, declared by merging its type tag into MjmlLeafNodes. A column or a hero names a leaf only
// when the registry is given its full definition as leafTypes, which this example leaves empty, so here they hold MJML's own nodes alone
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
            props: {
              children: [{ props: { content: { text: "Hello" }, id: crypto.randomUUID() }, type: "mj-text" }],
              id: crypto.randomUUID(),
            },
            type: "mj-column",
          },
        ],
        id: crypto.randomUUID(),
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

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=038758
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/mjml-blocks/latest?color=038758
[url-npm]: https://www.npmjs.com/package/mjml-blocks/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/mjml-blocks/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/mjml-blocks.svg
