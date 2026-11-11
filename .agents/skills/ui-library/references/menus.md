# Menus

Read when building a menu, an overflow button or a context menu's items.

- **A menu item is data** — a `UiMenuItem` list — and an overflow button builds its items from the same `Item` list its context menu opens, so the two never disagree (`references/keys-and-commands.md`). A command already under way is a disabled item, never a hidden one, and a family of commands — one per export format — is one item named by the verb whose `children` open beneath it in the same menu (`Import` over Csv, Json, Xlsx), a lone member being the command itself. The members expand inline, never as a flyout beside the menu, which is a second aim to hold with the pointer and has no touch form; and never as a flat row per member, which buries the commands around them. A child's menu value is its group's title and its own (`getMenuItemValue`), so one format under Import and under Export stays two choices.
