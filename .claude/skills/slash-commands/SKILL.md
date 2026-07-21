---
name: slash-commands
description: Esposter slash command conventions — parameter definitions, execution modes, the chip-based parameter UI and its safeParse/setErrors validation, message formatting, and adding new commands. Apply when writing or modifying slash commands, useExecuteSlashCommand, SlashCommandDefinitionMap, or the SlashCommandParameters components.
---

# Slash Command Conventions

## Core Types

`SlashCommandParameter` extends `Description` — always has both `name` and `description` (never optional):

```typescript
export interface SlashCommandParameter extends Description {
  isRequired: boolean;
  name: string;
}

// Shared value schema — normalize, then require non-empty
export const slashCommandParameterValueSchema = z.string().transform(normalizeString).pipe(z.string().min(1));
```

`SlashCommand` — `parameters` is always present (never `parameters?`). Default to `[]` for commands with no parameters:

```typescript
export interface SlashCommand extends Description, ItemEntityType<SlashCommandType> {
  icon: string;
  parameters: SlashCommandParameter[];
  title: string;
}

// no params: empty array — always present, never optional or omitted
[SlashCommandType.Roll]: { parameters: [], ... }
```

## Message Format

Messages use markdown. Rich text applies: italic `*text*`, bold `**text**`, code `` `text` ``.

Each `case` only builds a plain `StandardCreateMessageInput`. `marked.parse()` and `storeSendMessage` are applied **once**, after the switch — never per-case:

```typescript
if (!createMessageInput) return;

await storeSendMessage({
  ...createMessageInput,
  message: createMessageInput.message ? marked.parse(createMessageInput.message, { async: false }) : undefined,
  replyRowKey: replyRowKey.value,
});
```

Never call `sanitizeHtml`/`sanitizeTextHtml` here. Sanitization is declared at the Zod boundary in the base db-schema schemas — see the `string-utils` skill, which bans manual frontend calls.

### `/me` — no new `MessageType`

`/me [message]` does NOT introduce `MessageType.Me`. Wrap the argument in `*...*` and post as a regular `MessageType.Message`:

```typescript
case SlashCommandType.Me: {
  const { message } = command.parameterValues;
  createMessageInput = { message: `*${message}*`, roomId, type: MessageType.Message };
  break;
}
```

## Parameterized Command UI — Discord-style chips

There is **no `v-form`, no `useVRules()`, no `SubmitEventPromise`** anywhere in this feature. Parameters render as inline chips built from raw `<input>` elements, and validation is manual.

Components (`app/components/Message/Model/Message/Input/`):

| File                                       | Role                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| `SlashCommandParameters/Index.vue`         | Chip row + focus orchestration (delegates submit to `useSubmitSlashCommand`)   |
| `SlashCommandParameters/CommandInput.vue`  | Editable `/command` name at the head of the row                                |
| `SlashCommandParameters/Chip.vue`          | One parameter: bold name label + bare `<input>`                                |
| `SlashCommandParameters/TrailingInput.vue` | Free-text tail; adds hidden parameters                                         |
| `Header/SlashCommandParameters.vue`        | Hidden-parameter list (REQUIRED OPTIONS / OPTIONAL) + focused-param hint/error |

### Validation — `safeParse` + `setErrors`, not `:rules`

Errors live in `useSlashCommandStore` as `SlashCommandParameterError[]` (`{ id, messages }`, keyed by parameter name), written via `setErrors(name, messages)`. `Chip.vue` validates per keystroke and only styles its own border; the message text renders in the input header:

```ts
setErrors(
  name,
  isRequired && !slashCommandParameterValueSchema.safeParse($event).success ? [REQUIRED_ERROR_MESSAGE] : [],
);
```

`REQUIRED_ERROR_MESSAGE` comes from `app/services/message/slashCommands/constants.ts` — never inline the string.

`useSubmitSlashCommand` (`app/composables/message/slashCommand/useSubmitSlashCommand.ts`) re-validates every required parameter on submit, and if any required one is missing it **reveals** the hidden chip (appends to `activeParameterNames`) and returns instead of sending; `Index.vue` only calls it. Parameter mutations (`createParameter`, `deleteParameter`, `collapseToText`, `clearPendingSlashCommand`) all live in the store, not the components.

### Focus model

`focusedIndex` in the store is the single source of truth: `-1` = the command name input, `0..n-1` = chips, `n` = trailing input, `-2` = blurred. Navigation is emit-driven (`navigate:previous` / `navigate:next`), fired from `Chip.vue` only when the caret sits at the very start/end of the input.

### Dismissal — collapse to text, never discard

Escape (and Backspace at `focusedIndex === -1`) calls `collapseToText()`, which round-trips the pending command back into the composer via `buildText()` (`/type name:value …`) rather than dropping the user's input:

```ts
onKeyStroke("Escape", () => collapseToText());
```

## Execution Modes

Derived from `slashCommand.parameters.length > 0`, not a separate `mode` field. `SlashCommandSuggestion.ts` (which contains **no switch** — it only routes) branches on it:

- **Immediate** — `parameters: []` — `useExecuteSlashCommand()` runs straight away
- **Parameterized** — one or more parameters — `setPendingSlashCommand(slashCommand, remainingText)`, which parses any already-typed text into parameter values

## The Execution Switch Lives in One Place

The only switch over `SlashCommandType` is in `app/composables/message/slashCommand/useExecuteSlashCommand.ts`, closed by `exhaustiveGuard(command)` — so a new enum value fails typecheck until handled. It is **not** in `SlashCommandSuggestion.ts`.

Its argument is a discriminated union pairing each type with its own parameter shape, so `command.parameterValues` is narrowed per case:

```typescript
{ [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P } }[SlashCommandType]
```

Always use `SlashCommandType.X` enum values, never `"Me"`, `"Shrug"`, etc.

## Adding a New Command

1. Add value to `SlashCommandType` enum.
2. Add entry to `SlashCommandDefinitionMap` with `parameters: []` or required/optional params (`as const satisfies Record<SlashCommandType, SlashCommand>` forces this).
3. Add `case SlashCommandType.X:` to the switch in `useExecuteSlashCommand.ts`:
   - Posting a message: assign `createMessageInput` and `break` — the shared tail parses + sends it
   - Opening a dialog: flip the dialog store's state (`isOpen.value = true`, `open(ScheduledMessageJobType.X)`)
   - Neither: do the work inline (e.g. `Topic` runs a room mutation and posts nothing)
4. No new `MessageType` unless rendering is structurally different (e.g. Poll, Call).

## Existing Commands

The enum, the map, and the switch must stay in sync (the map is enforced by `satisfies Record<SlashCommandType, SlashCommand>`, the switch by `exhaustiveGuard`):

| Command      | Parameters                                | Behaviour                                                                                               |
| ------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `/flip`      | `[]`                                      | Immediate — posts `🌝 **Heads**` or `🌚 **Tails**` (different sides of the coin)                        |
| `/me`        | `[{ name: "message", isRequired: true }]` | Parameterized — posts `*message*`                                                                       |
| `/poll`      | `[]`                                      | Immediate → opens `PollDialog` (dialog, not inline params); posts nothing itself                        |
| `/remind`    | `[]`                                      | Immediate → opens `ScheduledMessageJobDialog(ScheduledMessageJobType.Reminder)`                         |
| `/roll`      | `[]`                                      | Immediate — posts `🎲 Rolled a **N**` (1–100)                                                           |
| `/schedule`  | `[]`                                      | Immediate → opens `ScheduledMessageJobDialog(ScheduledMessageJobType.ScheduledMessage)`                 |
| `/shrug`     | `[{ name: "text", isRequired: false }]`   | Parameterized (optional) — posts `text¯\_(ツ)_/¯`                                                       |
| `/tableflip` | `[]`                                      | Immediate — posts `(╯°□°）╯︵ ┻━┻`                                                                      |
| `/topic`     | `[{ name: "text", isRequired: false }]`   | Parameterized — **posts no message**; runs `room.updateRoom` optimistically to set/clear the room topic |
| `/unflip`    | `[]`                                      | Immediate — posts `┬─┬ノ( º _ ºノ)`                                                                     |

`/topic` is the proof that a slash command need not produce a message at all — leave `createMessageInput` unassigned and the shared tail sends nothing.
