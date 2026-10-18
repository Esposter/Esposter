# MJML blocks

## Why

The email editor's types are MJML's components, and everything that makes them right is about MJML rather than about Esposter: each component's attributes in MJML's type grammar, MJML's defaults, which tag may hold which, the cascade `mj-attributes` applies, and a faithful path to MJML and back. `grapesjs-mjml` held all of that inside GrapesJS, with unescaped attributes, nesting the validator refuses, head components that never reached the output, and a compile that needs a browser. Rebuilt as app modules, the page builder could not carry the plugin's Upstream table, and the next email builder on MJML would write the same tables again.

## What Changes

- A workspace package, `mjml-blocks`, holds MJML's current component set as block types on the editor core, with no framework, no DOM and no copy of MJML in its runtime.
- Each type's attributes are declared once in MJML's own type grammar, from which its props schema and the editor's field descriptors are derived, and are held equal to the installed MJML's allowed attributes and defaults.
- Each container's slot is MJML's own nesting rule, held equal to MJML's validator map, and the root's content takes only what MJML's body takes.
- An attribute the author did not set stays absent, and a resolver answers it through MJML's cascade: the node, the root's per-type defaults, its defaults for all, then MJML's.
- A document renders to MJML's JSON form with every attribute escaped once, serialises to MJML source for the export, and reads back from MJML source with every unsupported tag or value named in the refusal.
- Every issue and pull request of the plugin's tracker gets a verdict, and each in-scope defect a regression test named for it.

## Capabilities

- **mjml-blocks/block-types** (new)

## Waiting on

None.

## Impact

- A new workspace package, `mjml-blocks`, and its spec area.
- The page builder's document model, whose email registry is this package's with the app's survey invite added, and the email change, which draws these types.
