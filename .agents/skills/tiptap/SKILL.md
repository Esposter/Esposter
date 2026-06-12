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

Any `new Extension({ ... })`, `Extension.create({ ... })`, or `addProseMirrorPlugins`/`new Plugin` logic belongs in a `use*Extension` composable in `app/composables/message/editor/` — never inline in a `.vue` `<script setup>`. A component's job is to compose extensions, not define them.

- The composable pulls whatever it needs (stores, session, refs) itself, so the component drops those imports. Make it `async` if it awaits (e.g. `authClient.useSession`) and `await` it at the call site.
- A reactive value the plugin must read/write (e.g. a cursor-style `Ref` for `v-bind` in CSS) is passed in as a parameter and stored via `addOptions()`; the plugin mutates `this.options.x.value`. This removes hacks like hijacking another extension's options with `@ts-expect-error`.

Reference extractions: `useKeyboardShortcutsExtension` (keyboard shortcuts reading the data/message stores), `useLinkClickExtension(cursorStyle)` (Ctrl/Cmd-click-to-open + cursor style for the link mark).

Single-use exception: an extension wiring only two local component callbacks (e.g. `Message/Model/Message/Editor.vue`'s Enter/Esc handlers) may stay inline — extracting it would be a useless one-liner composable.

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

Every entry is a `use*Extension()` call — no inline definitions. The `RichTextEditor` component itself owns only the always-on extensions (`StarterKit`, `CharacterCount`, `Placeholder`, `FileHandler`, `useLinkClickExtension`); feature extensions are passed in via the `:extensions` prop.
