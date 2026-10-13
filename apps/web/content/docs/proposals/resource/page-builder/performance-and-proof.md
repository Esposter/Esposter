---
title: Performance and proof
description: Proposal — the page builder's performance targets and the tests that hold them, and how the editors' output is proved against the published page, since no saved document exists to compare against.
model: claude-opus-5-5
waiting: "resource/page-builder/document-model, which defines the typed nodes and patches the benches and proofs run over"
---

# Performance and proof

Built on the [document model](/docs/proposals/resource/page-builder/document-model), whose nodes and patches are what every bench and proof here measures.

## Performance

| Target                                                     | Number                                                                             | Held by                                             |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- |
| Script an Editor blade loads beyond the explorer, gzipped  | at most 200 KiB, each editor                                                       | measured on the cutover's production build, as here |
| Requests the editor itself makes to a third-party origin   | none; only content the author adds — an embed, MJML's social icons — loads its own | the security config names no origin for the editors |
| Render a 2,000-node document to HTML                       | under 20 ms                                                                        | a committed bench                                   |
| Apply one patch to a 2,000-node document, inverse recorded | under 0.5 ms                                                                       | a committed bench                                   |
| A prop or style edit, input to paint, 2,000 nodes          | under 50 ms at the 95th percentile                                                 | a browser test's performance marks                  |
| A selection change, input to outline                       | within one animation frame                                                         | the same                                            |
| Server compile of the starter email                        | under 250 ms at the 95th percentile                                                | a committed bench on the compile service            |

The size ceiling is an acceptance check of the cutover rather than a standing gate, for the reasons [bundle budgets](/docs/architecture/deferred/bundle-budgets) are deferred; the editors stay behind `ResourceEditorComponentMap`'s async components, so nothing of them reaches another route.

## Proof

There is nothing saved to hold the new editors to, so parity is proved against the published output and against the canvas itself:

- **Every type's output** is asserted whole with `toStrictEqual`: its HTML or MJML for a fixture of each prop's edge values, its accessible attributes, and the sanitiser's vectors on the raw-HTML types.
- **Every patch round-trips:** applying an edit and then its inverse returns a document equal to the original, for every command over a fixture document.
- **The canvas is the page.** A browser test renders the starter webpage in the canvas and in the published view's frame at each device width — the published copy rendered for the test with each node's id stamped on its element — and holds every node's box within one pixel across the two. The same test checks that the published page's own scripts run under the policy its frame inherits from the app.
- **The email canvas is close to the email.** The same test for the starter email, compiled with a class per node that MJML's `css-class` carries onto the output, holds each section, column and leaf box within a few pixels at desktop and mobile width.
- **Editor interactions** have component tests (the tree, the panels, the commands and the patches each issues, under happy-dom like the library's) and the browser suite: a drag from the palette across the frame boundary, Alt-arrow moves with their announcement, Move to…, focus into a text node and back out, and the sandbox question above. The app has no browser suite yet; it takes one on the shared browser configuration the Genshin packages use.
- **The ceiling** is measured on the cutover's build before it merges.
