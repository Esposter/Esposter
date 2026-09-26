# Suggestion Extensions

Read when adding or changing a suggestion extension — emoji, mention, slash command — or any custom extension.

Three suggestion extensions exist in the message input: emoji, mention, and slash command. Each follows the same pattern.

## Files per suggestion feature

Paths differ per feature — there is no single `{feature}` folder convention:

| Feature       | Extension composable                                               | Suggestion config                                              |
| ------------- | ------------------------------------------------------------------ | -------------------------------------------------------------- |
| Emoji         | `app/composables/message/editor/useEmojiExtension.ts`              | `app/services/message/emoji/EmojiSuggestion.ts`                |
| Mention       | `app/services/message/MentionExtension.ts`                         | `app/services/message/MentionSuggestion.ts` (no subfolder)     |
| Slash command | `app/composables/message/slashCommand/useSlashCommandExtension.ts` | `app/services/message/slashCommands/SlashCommandSuggestion.ts` |

List components are uniform: `app/components/Message/Model/Message/Suggestion/{Feature}List.vue`.

## Unique PluginKey — required for every suggestion

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

## Custom extension boilerplate — `createSuggestionExtension`

Every suggestion extension that is only a plugin is the same shell — an options slot the `configure` call fills and one `Suggestion` plugin built from it — so it is built by `createSuggestionExtension` (`app/services/message/editor/createSuggestionExtension.ts`), never written out again. What differs lives in the suggestion config. Mention is the exception: it is a node rather than a bare plugin, so `MentionExtension` extends Tiptap's `Mention` to keep its `type` attribute and configures the suggestion on that — replacing it with the shell would drop every mention's type.

```ts
const EmojiExtension = createSuggestionExtension("emoji");

export const useEmojiExtension = () => EmojiExtension.configure({ suggestion: EmojiSuggestion });
```

ProseMirror is reached through tiptap's re-export, `@tiptap/pm/<module>`, never a `prosemirror-*` package of its own (`no-restricted-syntax`): the editor and the plugins it runs must share one copy of the state classes.

## Never inline extensions in components

`new Extension(...)`, `Extension.create(...)`, or `addProseMirrorPlugins`/`new Plugin` belong in a `use*Extension` composable under `app/composables/message/` (see the table above for the per-feature folder), never in a `.vue` `<script setup>`. An extension that reads no store, session or ref needs no composable and is a module constant under `app/services/message/`, as Mention's is. The composable pulls its own stores/session/refs (make it `async` + `await` if it awaits). A reactive value the plugin reads/writes (e.g. a cursor `Ref` for CSS `v-bind`) is passed in and stored via `addOptions()`, then mutated as `this.options.x.value` — avoids hijacking another extension's options with `@ts-expect-error`.

Exception: an extension wiring only a couple of local component callbacks (e.g. `Editor.vue`'s Enter/Esc) may stay inline.

## SuggestionTrigger enum

Trigger characters live in `app/services/message/SuggestionTrigger.ts`. Never hardcode `"/"`, `":"`, or `"@"` as string literals in suggestion configs or component templates:

```ts
export enum SuggestionTrigger {
  Emoji = ":",
  Mention = "@",
  SlashCommand = "/",
}
```

Use in suggestion config (`char: SuggestionTrigger.Emoji`) and in templates (`{{ SuggestionTrigger.Emoji }}{{ name }}{{ SuggestionTrigger.Emoji }}`).
