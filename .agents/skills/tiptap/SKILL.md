---
name: tiptap
description: Apply when writing or modifying Tiptap extensions, suggestion lists, or editor composables. Esposter Tiptap/ProseMirror conventions — suggestion extensions, plugin key uniqueness, suggestion lists drawn by the editor in a caret popover rather than mounted on the body, and SuggestionTrigger enum.
---

# Tiptap Conventions

## Suggestion Extensions

Every suggestion config declares a unique `PluginKey`, a plugin-only extension is `createSuggestionExtension`, an extension lives in a `use*Extension` composable rather than a component, ProseMirror comes through `@tiptap/pm/*`, and trigger characters are `SuggestionTrigger` (`references/suggestion-extensions.md`).

## Suggestion lists are drawn by the editor, never mounted on the body

**Rule**: a suggestion's `render` is `getRender(ListComponent)`, which only writes what the plugin reports to the rich-text suggestion store (`app/store/richTextEditor/suggestion.ts`). The editor whose caret opened it draws it — `RichTextEditorSuggestions`, inside `RichTextEditor`, in a `UiCaretPopover` at the caret — so the page's theme scope and style reach the list, and positioning is the popover's anchor, never a hand-measured one. A list exposes `onKeyDown` (`useSuggestionListNavigation`), which the store hands the plugin once the list is drawn, so the keys walk it while focus stays in the document. Never `new VueRenderer` and append to `document.body`: nothing above the body carries the theme.

## Wiring extensions into the editor

The feature stack a composer shares — keyboard shortcuts, code block, emoji, custom emoji, mention — is built once in `useComposer` (`app/composables/message/composer/useComposer.ts`), as a `computed` because the mention extension restyles itself from the theme, and each composer spreads it into `:extensions`; the room composer (`app/components/Message/Model/Message/Input/Index.vue`) adds the slash-command extension on top, since it is the room's alone:

```ts
const { extensions } = await useComposer(target);
const slashCommandExtension = useSlashCommandExtension();
```

```html
:extensions="[...extensions, slashCommandExtension]"
```

Every entry is a `use*Extension()` call. `RichTextEditor` owns only the always-on extensions (`StarterKit`, `CharacterCount`, `Placeholder`, `FileHandler`, `useLinkClickExtension`); feature extensions come via the `:extensions` prop.

## `useEditor` owns the editor's lifecycle — never register a second teardown

`useEditor` constructs the editor in `onMounted` (so a component that `await`s its content in setup is already
seeded by then) and destroys it in its own `onBeforeUnmount`. A component adding an `onBeforeUnmount` of its own
that calls `editor.destroy()` tears the same editor down twice — harmless today and a double-free the moment
Tiptap's teardown stops being idempotent. Nothing about the editor's lifetime belongs in the calling component.

## Reference pages

- `references/suggestion-extensions.md` — when adding or changing a suggestion or custom extension.
