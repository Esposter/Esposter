# AI-native resources

How an agent reaches the operations a person runs in a resource editor, through typed procedures derived from what each type already declares. Each unit below is built on its own.

| Page                                                   | What it covers                                                                                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Typed commands](typed-commands/design.md)             | The few acts a patch fits badly, run as the editor's own commands on the server: a Sheet column or row command, a repeating todo's tick, a Note written from Markdown           |
| [Agent keys](agent-keys/design.md)                     | Keys that carry scopes, and the operations a key never reaches because no undo can take them back                                                                               |
| [Lifecycle tools](lifecycle-tools/design.md)           | One tool per resource operation under the Resources scope: create, rename, bin, publish, upload, references, history and dataset reads, dispatched to each type's own procedure |
| [Live edits](live-edits/design.md)                     | One save subscription for an open resource of any type, and another device's save adopted in place or held behind a notice when it would drop an unsaved edit                   |
| [In-product assistant](in-product-assistant/design.md) | Ask Claude from inside an editor, a line sent to the person's own Claude Code session, which edits with the person's own key                                                    |
