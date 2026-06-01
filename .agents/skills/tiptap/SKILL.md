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

## VueRenderer: v-if vs v-show on root element

**This is a critical gotcha.** When a suggestion list component uses `v-if` on its root element:

- `VueRenderer.element` returns a **comment node** (not an HTMLElement) when the condition is false
- `getRender.ts`'s `onStart` appends that comment node to `document.body`
- When items later populate, Vue re-renders the real div inside VueRenderer's internal container — which is never in `document.body`
- Result: the popup never appears

**Rule**: Always use `v-show` on the suggestion list root element, never `v-if`.

```html
<!-- WRONG — any suggestion list root -->
<div v-if="items.length > 0" ...>
  <!-- CORRECT — always a real HTMLElement, just hidden when empty -->
  <div v-show="items.length > 0" ...></div>
</div>
```

`v-show` ensures `VueRenderer.element` is always a real HTMLElement from the moment `onStart` fires. This keeps the element anchored in `document.body` for the lifetime of the suggestion session so `computePosition` can always measure and reposition it correctly.

## Wiring extensions into the editor

In `app/components/Message/Model/Message/Input/Index.vue`, each extension is instantiated as a `const` and passed in the `:extensions` array:

```ts
const emojiExtension = useEmojiExtension();
const mentionExtension = useMentionExtension();
const slashCommandExtension = useSlashCommandExtension();
```

```html
:extensions="[keyboardExtension, codeBlockExtension, emojiExtension, mentionExtension, slashCommandExtension]"
```
