# The Document Chrome

Read when styling a scrollbar, the selection, the caret, a native control's accent or the focus ring, or putting a region in another theme.

Scrollbars, selection, the caret, native control accents and the focus ring live once in the `ui-chrome` layer of `apps/web/app/assets/css/globals.css`. A page never restates them, and a component that wants its own focus or selection treatment simply declares it — the layer is first in `apps/web/app/assets/css/layers.css`, so no override is needed.

**The focus ring is the document's on every control.** A field and a row draw it just inside their edge, as `ui-field` and `ui-row` do, and add their tint beneath it. A composite around an editable — a rich text editor with its menu bar and footer — is one `ui-field`, never a `ui-frame` with a ring of its own around the text: `ui-field` rings the whole of it while the editable is focused, and the editable draws none (`apps/web/app/components/RichTextEditor/Index.client.vue`). A document that is the page rings its scroller, not the document, so the ring does not scroll away (`apps/web/app/components/Resource/Note/Editor.vue`). What may replace the ring is the focus rule in `openspec/specs/architecture/ui-library/design.md`, and which utility hides it is the `styling` skill's `references/utility-vocabulary.md`.
