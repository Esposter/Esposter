---
name: tiptap
description: Apply when writing or modifying Tiptap extensions, suggestion lists, or editor composables. Esposter Tiptap/ProseMirror conventions — suggestion extensions, plugin key uniqueness, suggestion lists drawn by the editor in a caret popover rather than mounted on the body, and SuggestionTrigger enum.
---

# Tiptap Conventions

## Suggestion Extensions

Three suggestion extensions exist in the message input: emoji, mention, and slash command. Each follows the same pattern.

### Files per suggestion feature

Paths differ per feature — there is no single `{feature}` folder convention:

| Feature       | Extension composable                                               | Suggestion config                                              |
| ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| Emoji         | `app/composables/message/editor/useEmojiExtension.ts`              | `app/services/message/emoji/EmojiSuggestion.ts`                |
| Mention       | `app/composables/message/mentions/useMentionExtension.ts`          | `app/services/message/MentionSuggestion.ts` (no subfolder)     |
| Slash command | `app/composables/message/slashCommand/useSlashCommandExtension.ts` | `app/services/message/slashCommands/SlashCommandSuggestion.ts` |

List components are uniform: `app/components/Message/Model/Message/Suggestion/{Feature}List.vue`.

### Unique PluginKey — required for every suggestion

ProseMirror throws `"Adding different instances of a keyed plugin (suggestion$)"` when multiple suggestion extensions share the same key. Every suggestion config **must** declare a unique `PluginKey`:

```ts
import { PluginKey } from "@tiptap/pm/state";

export const EmojiSuggestion: Except<SuggestionOptions<EmojiItem, EmojiItem>, "editor"> = {
  pluginKey: new PluginKey("emojiSuggestion"),
  char: SuggestionTrigger.Emoji,
  // ...
};
```

Named keys: `"emojiSuggestion"`, `"mentionSuggestion"`, `"slashCommandSuggestion"`.

### Custom extension boilerplate

```ts
const EmojiExtension = Extension.create({
  addOptions() {
    return { suggestion: {} };
  },
  addProseMirrorPlugins() {
    return [Suggestion({ editor: this.editor, ...this.options.suggestion })];
  },
  name: "emoji",
});

export const useEmojiExtension = () => EmojiExtension.configure({ suggestion: EmojiSuggestion });
```

### Never inline extensions in components

`new Extension(...)`, `Extension.create(...)`, or `addProseMirrorPlugins`/`new Plugin` belong in a `use*Extension` composable under `app/composables/message/` (see the table above for the per-feature folder), never in a `.vue` `<script setup>`. The composable pulls its own stores/session/refs (make it `async` + `await` if it awaits). A reactive value the plugin reads/writes (e.g. a cursor `Ref` for CSS `v-bind`) is passed in and stored via `addOptions()`, then mutated as `this.options.x.value` — avoids hijacking another extension's options with `@ts-expect-error`.

Exception: an extension wiring only a couple of local component callbacks (e.g. `Editor.vue`'s Enter/Esc) may stay inline.

### SuggestionTrigger enum

Trigger characters live in `app/services/message/SuggestionTrigger.ts`. Never hardcode `"/"`, `":"`, or `"@"` as string literals in suggestion configs or component templates:

```ts
export enum SuggestionTrigger {
  Emoji = ":",
  Mention = "@",
  SlashCommand = "/",
}
```

Use in suggestion config (`char: SuggestionTrigger.Emoji`) and in templates (`{{ SuggestionTrigger.Emoji }}{{ name }}{{ SuggestionTrigger.Emoji }}`).

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
