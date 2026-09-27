# Menus

Read when building a menu, an overflow button or a context menu's items.

- **A menu item is data** — a `UiMenuItem` list — and an overflow button builds its items from the same `Item` list its context menu opens, so the two never disagree (`references/keys-and-commands.md`). A command already under way is a disabled item, never a hidden one, and a family of commands — one per export format — is a flat group named by verb and member, never a submenu.
