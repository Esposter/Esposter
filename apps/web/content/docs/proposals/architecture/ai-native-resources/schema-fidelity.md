---
title: Schema fidelity
description: Proposal — the source fixes where a content schema stops describing what its editor edits — the Flowchart's node data, the Note checked against its writing kit's own schema, the Survey's model parsed as JSON, and the GrapesJS types' captured HTML marked read-only — each shrinking the paths the content tools refuse.
model: claude-opus-5-5
---

# Schema fidelity

Built on the [agent content tools](/docs/architecture/agent-content-tools), whose test records, for every type, the paths its content schema leaves undescribed or read-only, and which refuse an agent's write there. Generic tools can only be as good as the schema they read, and [write once](/docs/architecture/write-once) says where to fix a case the mechanism cannot serve: at its source, never with a branch in the mechanism. Each fix below is a change to one type's schema, and each removes lines from that record.

## Flowchart: a node's data

A node's and an edge's `data` are records of `z.unknown()`, so a Flowchart is described down to every node's position and type but not to the one thing a reader sees, its label. The canvas reads one key there: the rectangle node draws `data.label`, and the content panel writes it. So a node's `data` is declared as what it holds, a label bounded by a named limit, and an edge's from what the edge editor reads, checked against stored edges when the fix is built. This is the smallest fix with the largest gain, and the first one built: with it, every part of a diagram is an agent's to write. The [flowchart shapes](/docs/proposals/resource/flowchart-shapes) proposal adds node types and edits each one's label in place, so the declared label serves every shape and the two do not wait on each other.

## Note: the writing kit's own schema checks the document

The Note's schema is a loose recursive ProseMirror node. A node's `type` is any string, its `attrs` are undescribed, and extra keys pass, so that a document an extension writes never fails to parse. That looseness stays, since it is what keeps every valid document saving. The save also loads the document into the writing kit's own ProseMirror schema — Tiptap's `getSchema` over the extensions `getNoteExtensions` lists, the set the published view already renders with — so a node type or a mark the editor lacks fails the save with ProseMirror's own message, rather than vanishing the next time the editor opens it. `getNoteExtensions` moves to `apps/web/shared` for the server to build the same schema; it lists only extensions, none of them Vue.

Attributes stay undescribed, so writes under `attrs` stay refused: a heading's level or a link's address reaches a Note through its Markdown command ([typed commands](/docs/proposals/architecture/ai-native-resources/typed-commands)), parsed against the same extensions.

## Survey: the model parses as JSON

A Survey's questions are SurveyJS's own JSON, stored as one `model` string bounded by its length. An agent replaces it whole, which suits how a model is written, but nothing checks that what it wrote is even JSON until the editor or the public page tries to load it. The schema refines the string to parse as a JSON object, so a malformed model fails at the door with the parser's message. What SurveyJS itself requires of a model — its question types, unique names — stays unchecked by the server.

## Webpage and Email: the captured output is read-only

A Webpage's `html` and `css`, and an Email's `html`, are what GrapesJS rendered at the last editor save, and the published view serves them. Each is given `.meta({ readOnly: true })`, which reaches the agent as JSON Schema's `readOnly`, so the content tools refuse a write there; the GrapesJS project around them is undescribed and refused already. An agent reads both types whole and writes only the Email's dataset binding. The [page builder](/docs/proposals/resource/page-builder)'s cutover deletes these fields with the format.

## Blueprint: entries stay undescribed

A Blueprint entry's `content` is another type's document, which deploy writes through the content door, where that type's schema parses it. Describing it would make the Blueprint's JSON Schema every content schema at once, keyed by the entry's type, for documents an owner captures from resources rather than writes by hand. So the entry content stays undescribed, its line in the record stays, and an agent works a Blueprint through capture and deploy ([lifecycle tools](/docs/proposals/architecture/ai-native-resources/lifecycle-tools)).

## Key files

| File                                                          | Role after the change                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/web/shared/models/flowchartEditor/data/GraphNode.ts`    | `data` declared as the label it holds                                |
| `apps/web/shared/models/flowchartEditor/data/GraphEdge.ts`    | `data` declared from what the edge editor reads                      |
| `apps/web/shared/models/resource/note/NoteResource.ts`        | the document also loads in the writing kit's ProseMirror schema      |
| `apps/web/app/services/resource/note/getNoteExtensions.ts`    | moves to `apps/web/shared`, so the server builds the editor's schema |
| `apps/web/shared/models/resource/survey/SurveyResource.ts`    | `model` parses as a JSON object                                      |
| `apps/web/shared/models/webpageEditor/data/WebpageEditor.ts`  | `html` and `css` read-only                                           |
| `apps/web/shared/models/emailEditor/data/EmailEditor.ts`      | `html` read-only                                                     |
| `apps/web/shared/models/resource/blueprint/BlueprintEntry.ts` | unchanged — entry content stays undescribed                          |
