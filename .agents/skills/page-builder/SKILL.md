---
name: page-builder
description: Apply when working on the page builder — the editor shell the webpage and email resources mount, its document model, keyboard, undo and publish. Esposter's one page builder for its document resources.
---

# Page Builder

Rules every page-builder task needs, each owned by the page named in its line:

- A publish bakes the document into the HTML a reader gets, and the view serves that baked HTML in a sandboxed frame; nothing is rendered at read time (`openspec/specs/resource/page-builder/document-model/design.md`).
- Every URL prop passes `checkIsAllowedUrl`, and custom HTML is sanitised where it is rendered for publish, whatever was stored (`openspec/specs/resource/page-builder/document-model/design.md`).
- A merge field is the canonical `{{columnName}}` token from `toMergeField`, and substitution HTML-escapes the value (`openspec/specs/resource/email-personalization/design.md`).
- The canvas and the editor take their keys from one table, read through one lookup (`openspec/specs/resource/page-builder/keyboard/design.md`).
- Each open resource's undo and redo are JSON Patch operations, with the inverses that undo them kept beside them (`openspec/specs/resource/page-builder/undo-as-patches/design.md`).

## Owner pages

- when the built design of any page-builder subject is in question: `openspec/specs/resource/page-builder/README.md`
- when a node type, the document or its publish changes: `openspec/specs/resource/page-builder/document-model/design.md`
- when a key is bound, or an editor's or canvas's keydown changes: `openspec/specs/resource/page-builder/keyboard/design.md`
- when undo, redo or an edit's history changes: `openspec/specs/resource/page-builder/undo-as-patches/design.md`
- when the rollout of the page builder is still in question: `openspec/changes/resource-page-builder-program/design.md`
