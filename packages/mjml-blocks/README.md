# mjml-blocks

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

MJML's components as block types on the headless block editor — each component's attributes, defaults and nesting rules, a render to MJML's JSON form and source, and a read back from MJML, with no framework, DOM or MJML runtime.

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 📖 [Documentation](#documentation)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

```bash
pnpm i mjml-blocks mjml
```

The compile is the consumer's, so `mjml` is installed beside the package. This example registers MJML's components, renders a one-section email to MJML's JSON form and compiles it under strict validation:

```ts
import { createBlockDocumentSchema } from "headless-block-editor";
import mjml2html from "mjml";
import { createMjmlRegistry, renderMjmlDocument } from "mjml-blocks";
import { z } from "zod";

const registry = createMjmlRegistry({
  leafTypes: [],
  richText: { parseHtml: (html) => html, renderHtml: (html) => html, schema: z.string() },
});
const document = createBlockDocumentSchema(registry, Number.MAX_SAFE_INTEGER).parse({
  content: [
    {
      props: {
        children: [
          {
            props: {
              children: [{ props: { content: "Hello", id: crypto.randomUUID() }, type: "mj-text" }],
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

| Export               | What it is                                                                                          |
| :------------------- | :-------------------------------------------------------------------------------------------------- |
| `createMjmlRegistry` | MJML's component set as block types, with the consumer's leaf types and rich text                   |
| `MjmlDocument`       | a document whose head is the root's props, typed by the registry                                    |
| `renderMjmlDocument` | a checked document rendered to MJML's JSON form                                                     |
| `serializeMjml`      | MJML's JSON form written as MJML source                                                             |
| `parseMjmlDocument`  | MJML source read back into a document, refusing a tag, attribute or value the package does not take |

## <a name="documentation">📖 Documentation</a>

We highly recommend you take a look at the [documentation](https://github.com/Esposter/Esposter/tree/main/openspec/specs/mjml-blocks) to level up.

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/mjml-blocks/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/mjml-blocks/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/mjml-blocks/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/mjml-blocks.svg
