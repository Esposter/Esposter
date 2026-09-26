# Custom Blocks

Read when adding or re-syncing blocks — dataset merge fields, survey invites — or writing a block's markup.

Blocks derived from reactive sources (dataset columns, published surveys) are re-synced with `setBlocks(editor, category, blocks)` (`app/services/grapesjs/setBlocks.ts`): it removes every block in the category, then adds the new set — no per-block bookkeeping. Watch `[editor, source]` so a session-driven editor re-init re-registers them. Block `label`s and any user text interpolated into `content` go through `escapeHtml`.

Survey invite blocks are shared by both editors: `createSurveyInviteBlocks` (`app/services/grapesjs/`) is the core (list → block identity + public url) and each editor passes only its button renderer (`createEmailSurveyInviteBlocks` = MJML, `createWebpageSurveyInviteBlocks` = plain HTML). The block source is `useReadPublishedSurveys`, and the watch is shared too — call `useSurveyInviteBlocks(editor, publishedSurveys, createBlocks)` (`app/composables/grapesjs/`) rather than re-writing the watch in a component.

**Never inline block markup in a component.** A block's content string lives in a `create*Blocks` service beside its siblings, which is also what makes it testable — merge fields build through `createMergeFieldBlocks` (`app/services/emailEditor/`), never inline in the editor blade.

Merge fields use the canonical `toMergeField(columnName)` token (`{{columnName}}`), inserted into block content as `escapeHtml(toMergeField(columnName))` — the canvas entity-encodes special characters on serialization, so the exported HTML carries the escaped token form. `substituteMergeFields` therefore replaces **both** the raw and escaped token forms with the HTML-escaped row value. See `apps/web/content/docs/resource/email-personalization.md`.
