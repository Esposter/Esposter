# Custom Blocks

Read when adding merge fields or survey invites to an email, or writing a node a palette item inserts.

There are no GrapesJS blocks left: the email and webpage editors are the page builder, and its palette inserts typed nodes rather than block markup. A merge field is a text node built by `createMergeFieldNode(columnName, id)` (`apps/web/app/services/pageBuilder/email/createMergeFieldNode.ts`), whose one paragraph is `toMergeField(columnName)` — the canonical `{{columnName}}` token (`apps/web/app/services/emailEditor/toMergeField.ts`).

The bound dataset's columns reach the palette and the two-brace suggestion through `useMergeFieldColumns()` (`apps/web/app/composables/pageBuilder/useMergeFieldColumns.ts`), which reads the columns the shell provides under `MERGE_FIELD_COLUMNS_KEY`. `MergeFieldExtension` (`apps/web/app/services/pageBuilder/MergeFieldExtension.ts`) builds the suggestion from the same source, so a column is offered in one place only.

The survey invite is a page-builder node of the email's kind (`apps/web/shared/services/pageBuilder/email/emailSurveyInviteType.ts`), not a block; the webpage's invite is a node too.

**Never write node content by hand in a component.** Each node's props are built by a `create*Node` function beside its siblings, which is what makes it testable. Text that is not a token goes into the node's document as plain text; the substitution escapes it when a row is filled in (`substituteMergeFields`, see `openspec/specs/resource/email-personalization/design.md`).

Merge fields use the canonical `{{columnName}}` token. The canvas entity-encodes special characters on serialization, so `substituteMergeFields` replaces **both** the raw and escaped token forms with the HTML-escaped row value.
