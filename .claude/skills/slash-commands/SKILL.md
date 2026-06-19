---
name: slash-commands
description: Esposter slash command conventions — parameter definitions, execution modes, message formatting, and adding new commands. Apply when writing or modifying slash commands.
---

# Slash Command Conventions

## Core Types

`SlashCommandParameter` extends `Description` — always has both `name` and `description` (never optional):

```typescript
export interface SlashCommandParameter extends Description {
  isRequired: boolean;
}
```

`SlashCommand` — `parameters` is always present (never `parameters?`). Default to `[]` for commands with no parameters:

```typescript
export interface SlashCommand extends Description, ItemEntityType<SlashCommandType> {
  icon: string;
  title: string;
  parameters: SlashCommandParameter[];
}

// CORRECT — no params: empty array
[SlashCommandType.Roll]: { parameters: [], ... }

// WRONG — omitting the parameters field, or making it optional ❌
```

## Message Format

Messages use markdown via `marked.parse()`. Rich text applies: italic `*text*`, bold `**text**`, code `` `text` ``.

### `/me` — no new `MessageType`

`/me [message]` does NOT introduce `MessageType.Me`. Wrap the argument in `*...*` and post as a regular `MessageType.Message`:

```typescript
// CORRECT
await createMessage({
  message: marked.parse(`*${sanitizeHtml(params.message)}*`, { async: false }),
  roomId,
  type: MessageType.Message,
});

// WRONG — unnecessary new MessageType: MessageType.Me ❌
```

## Parameterized Command UI

`SlashCommandParameters.vue` handles inline parameter input mode:

- Styled header bar (like `ReplyHeader.vue`) showing command name + description + close button
- `<v-form @submit.prevent="onSubmit">` wrapping all parameter inputs
- `SubmitEventPromise` from Vuetify — `const { valid } = await event` before proceeding
- Required fields: `:rules="[rules.required()]"` (from `useVRules()`; Vuetify shows inline validation errors)
- Optional fields: `:rules="[]"` (empty array, not omitted)
- Escape key dismisses via `useEventListener("keydown", ...)`; submit button is `type="submit"`

```vue
const onSubmit = async (event: SubmitEventPromise) => { const { valid } = await event; if (!valid ||
!pendingSlashCommand.value || !currentRoomId.value) return; // execute createMessage...
slashCommandStore.clearPendingSlashCommand(); };
```

## Execution Modes

Derived from `slashCommand.parameters.length > 0`, not a separate `mode` field:

- **Immediate** — `parameters: []` — execute on selection, no extra input
- **Parameterized** — one or more parameters — transforms the composer into inline parameter input mode

## Never Use String Literals for Command Types

Always use `SlashCommandType.X` enum values, never `"Me"`, `"Shrug"`, etc. Applies in `SlashCommandSuggestion.ts`, `SlashCommandParameters.vue`, and any switch over `slashCommand.type`:

```typescript
// CORRECT
case SlashCommandType.Me:

// WRONG
case "Me":
```

## Adding a New Command

1. Add value to `SlashCommandType` enum.
2. Add entry to `SlashCommandDefinitionMap` with `parameters: []` or required/optional params.
3. Add `case SlashCommandType.X:` to `SlashCommandSuggestion.ts`:
   - Immediate: call `createMessage` directly
   - Parameterized: set `pendingSlashCommand` in `useSlashCommandStore`
4. No new `MessageType` unless rendering is structurally different (e.g. Poll, Call).

## Existing Commands

| Command      | Parameters                                | Mode                                                                             |
| ------------ | ----------------------------------------- | -------------------------------------------------------------------------------- |
| `/roll`      | `[]`                                      | Immediate — posts `🎲 Rolled a **N**`                                            |
| `/poll`      | `[]`                                      | Immediate → opens `PollDialog` (special case: dialog, not inline params)         |
| `/me`        | `[{ name: "message", isRequired: true }]` | Parameterized                                                                    |
| `/shrug`     | `[{ name: "text", isRequired: false }]`   | Parameterized (optional — appends `¯\_(ツ)_/¯`)                                  |
| `/flip`      | `[]`                                      | Immediate — posts `🪙 **Heads**` or `🟡 **Tails**` (different sides of the coin) |
| `/tableflip` | `[]`                                      | Immediate — posts `(╯°□°）╯︵ ┻━┻`                                               |
| `/unflip`    | `[]`                                      | Immediate — posts `┬─┬ノ( º _ ºノ)`                                              |
