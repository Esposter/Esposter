# Surfaces

Read when choosing between a card and a row, drawing a list row, dressing a surface, or recolouring one for a state. The one-line rules are in `SKILL.md`; this page is their full statement.

- **A card is not a row.** What a reader chooses whole from among its siblings — a post, a type to create, an achievement — is a `ui-card`, a frame that takes the style's hover; `ui-item` and `ui-row` are for a list or a menu. Minimal never means turning cards into rows: a menu's look on a page's content blends what is picked into what is chosen from.

- **Every row of a list is drawn by `UiItemContent` inside a `ui-item`** — or a `ui-row` where the row goes nowhere: mark, title, shortcut on one line — and leads with a mark; `Item` and `UiCommand` refuse a row with none at the typecheck. A `UiList` row whose mark the list's mark slot draws says so with `hasMarkSlot`, never a placeholder `icon: ""`.

- **A surface is a rule, not a style block.** `ui-frame`, `ui-lifted`, `ui-raised`, `ui-field`, `ui-pill`, `ui-popover` and `ui-item` live in `uno.config.ts`, since a primitive's part can only be dressed by class. A component that draws a surface wears the rule instead of restating its shadows.

- **A utility cannot recolour a surface**: a `bg-*` or `text-*` written on `ui-frame`, `ui-raised` or `ui-field` loses to it (why is the architecture page's "What building them taught"). A state that recolours one is a data attribute the component's scoped style reads.
