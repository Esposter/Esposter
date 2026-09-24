---
title: Composer suggestions
description: Proposal — the message composer's mention, emoji and slash-command lists drawn by UiSuggestions inside the page's theme scope, rather than by Tiptap's suggestion renderer mounting its own lists outside it.
model: claude-opus-5-5
---

# Composer Suggestions

Typing `@`, `:` or `/` in the composer opens a list of members, emoji or slash commands. Tiptap's suggestion plugin decides when the list opens and what it holds; the list itself is ours, mounted by the plugin's renderer. Two things keep it off the library: `UiSuggestions` completes a text field, whose caret and value it reads, and not a contenteditable document; and the renderer mounts the list outside the page's theme scope, so a region pinned to voxel — the agent console, a game — gets standard's lists.

## What works today

- Each trigger's plugin key, its query and its items are the `tiptap` skill's conventions and stay.
- The lists already draw their rows with `UiItemContent` and lead with a mark.

## What this adds

- **`UiSuggestions` over a document**: it takes the editor's view instead of a field — the caret's rectangle as its anchor, Tiptap's own command to insert a pick — and keeps the virtual-focus contract it has for a field: the arrows walk, Enter or Tab takes, Escape closes, focus stays in the document.
- **Rendered where the composer is**: the list mounts inside the composer's component tree, so the nearest theme scope and style reach it, and the renderer only reports the query and the caret.
- **The @TODO in `Suggestion/List.vue` goes**, and so do the renderer's hand-written keyboard handling and positioning.

## Next steps

1. Split `UiSuggestions`' reading of its host into a field host and a document host, with its keyboard test run against both.
2. Change the three suggestion extensions' `render` to hand a reactive query and caret rectangle to a component the composer mounts, rather than mounting one themselves.
3. Move the mention, emoji and slash-command lists onto it, and test that a voxel scope reaches them.

## Key files

| File                                                                | Role after the change                                     |
| :------------------------------------------------------------------ | :-------------------------------------------------------- |
| `apps/web/app/components/Ui/Suggestions.vue`                        | Completions over a field or a document, focus kept in it  |
| `apps/web/app/components/Message/Model/Message/Suggestion/List.vue` | The composer's lists, mounted inside its tree             |
| `apps/web/app/components/RichTextEditor/Index.vue`                  | The document whose caret and insert command the list uses |

## Sources

- [Tiptap's suggestion utility](https://tiptap.dev/docs/editor/api/utilities/suggestion) — the `render` lifecycle that reports the query and the caret.
