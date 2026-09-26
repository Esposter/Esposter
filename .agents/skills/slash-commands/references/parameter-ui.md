# The Parameter Chips

Read when changing how a command's parameters are entered, validated, focused or dismissed.

There is **no `UiForm` and no `UiRules`** anywhere in this feature. Parameters render as inline chips built from raw `<input>` elements, and validation is manual.

Components (`app/components/Message/Model/Message/Input/`):

| File                                       | Role                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `SlashCommandParameters/Index.vue`         | Chip row + focus orchestration (delegates submit to `useSubmitSlashCommand`)   |
| `SlashCommandParameters/CommandInput.vue`  | Editable `/command` name at the head of the row                                |
| `SlashCommandParameters/Chip.vue`          | One parameter: bold name label + bare `<input>`                                |
| `SlashCommandParameters/TrailingInput.vue` | Free-text tail; adds hidden parameters                                         |
| `Header/SlashCommandParameters.vue`        | Hidden-parameter list (REQUIRED OPTIONS / OPTIONAL) + focused-param hint/error |

## Validation — `safeParse` + `setErrors`, not `:rules`

Errors live in `useSlashCommandStore` as `SlashCommandParameterError[]` (`{ id, messages }`, keyed by parameter name), written via `setErrors(name, messages)`. `Chip.vue` validates per keystroke and only styles its own border; the message text renders in the input header:

```ts
setErrors(
  name,
  isRequired && !slashCommandParameterValueSchema.safeParse($event).success ? [REQUIRED_ERROR_MESSAGE] : [],
);
```

`REQUIRED_ERROR_MESSAGE` comes from `app/services/message/slashCommands/constants.ts` — never inline the string.

`useSubmitSlashCommand` (`app/composables/message/slashCommand/useSubmitSlashCommand.ts`) re-validates every required parameter on submit, and if any required one is missing it **reveals** the hidden chip (appends to `activeParameterNames`) and returns instead of sending; `Index.vue` only calls it. Parameter mutations (`createParameter`, `deleteParameter`, `collapseToText`, `clearPendingSlashCommand`) all live in the store, not the components.

## Focus model

`focusedIndex` in the store is the single source of truth: `-1` = the command name input, `0..n-1` = chips, `n` = trailing input, `-2` = blurred. Navigation is emit-driven (`navigate:previous` / `navigate:next`), fired from `Chip.vue` only when the caret sits at the very start/end of the input.

## Dismissal — collapse to text, never discard

Escape (and Backspace at `focusedIndex === -1`) calls `collapseToText()`, which round-trips the pending command back into the composer via `getText()` (`/type name:value …`) rather than dropping the user's input:

```ts
onKeyStroke("Escape", () => collapseToText());
```
