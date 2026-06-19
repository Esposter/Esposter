---
name: tiptap
description: Esposter Tiptap/ProseMirror conventions — suggestion extensions, plugin key uniqueness, VueRenderer v-show rule, and SuggestionTrigger enum. Apply when writing or modifying Tiptap extensions, suggestion lists, or editor composables.
---

# Tiptap Conventions

## Suggestion Extensions

Three suggestion extensions exist in the message input: emoji, mention, and slash command. Each follows the same pattern.

### Files per suggestion feature

| Concern              | Location                                                            |
| -------------------- | ------------------------------------------------------------------- |
| Extension composable | `app/composables/message/editor/use{Feature}Extension.ts`           |
| Suggestion config    | `app/services/message/{feature}/{Feature}Suggestion.ts`             |
| List component       | `app/components/Message/Model/Message/Suggestion/{Feature}List.vue` |

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

`new Extension(...)`, `Extension.create(...)`, or `addProseMirrorPlugins`/`new Plugin` belong in a `use*Extension` composable in `app/composables/message/editor/`, never in a `.vue` `<script setup>`. The composable pulls its own stores/session/refs (make it `async` + `await` if it awaits). A reactive value the plugin reads/writes (e.g. a cursor `Ref` for CSS `v-bind`) is passed in and stored via `addOptions()`, then mutated as `this.options.x.value` — avoids hijacking another extension's options with `@ts-expect-error`.

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

## VueRenderer: always `v-show` on suggestion list root

**Rule**: Always use `v-show` on the suggestion list root element, never `v-if`.

```html
<!-- WRONG -->
<div v-if="items.length > 0" ...></div>
<!-- CORRECT -->
<div v-show="items.length > 0" ...></div>
```

With `v-if`, `VueRenderer.element` returns a comment node when the condition is false; `getRender.ts`'s `onStart` appends that comment to `document.body`, and the later-rendered real div lives in VueRenderer's internal container outside `document.body` — so the popup never appears. `v-show` keeps `VueRenderer.element` a real HTMLElement anchored in `document.body` for the whole session, so `computePosition` can always measure and reposition it.

## Wiring extensions into the editor

In `app/components/Message/Model/Message/Input/Index.vue`, each extension is instantiated as a `const` and passed in the `:extensions` array:

```ts
const keyboardExtension = await useKeyboardShortcutsExtension();
const codeBlockExtension = useCodeBlockExtension();
const emojiExtension = useEmojiExtension();
const mentionExtension = useMentionExtension();
const slashCommandExtension = useSlashCommandExtension();
```

```html
:extensions="[keyboardExtension, codeBlockExtension, emojiExtension, mentionExtension, slashCommandExtension]"
```

Every entry is a `use*Extension()` call. `RichTextEditor` owns only the always-on extensions (`StarterKit`, `CharacterCount`, `Placeholder`, `FileHandler`, `useLinkClickExtension`); feature extensions come via the `:extensions` prop.
