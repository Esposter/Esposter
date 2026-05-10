---
name: slash-commands
description: Esposter slash command conventions — parameter definitions, execution modes, message formatting, and adding new commands. Apply when writing or modifying slash commands.
---

# Slash Command Conventions

## Core Types

### `SlashCommandParameter` extends `Description`

Always has both `name` and `description` — never make description optional:

```typescript
export interface SlashCommandParameter extends Description {
  isRequired: boolean;
}
```

### `SlashCommand` — `parameters` is always present (never optional)

Default to an empty array `[]` for commands with no parameters. Do not use `parameters?`:

```typescript
export interface SlashCommand extends Description, ItemEntityType<SlashCommandType> {
  icon: string;
  title: string;
  parameters: SlashCommandParameter[];
}
```

```typescript
// CORRECT — no params: empty array
[SlashCommandType.Roll]: {
  parameters: [],
  ...
}

// WRONG — omitting parameters
[SlashCommandType.Roll]: {
  // no parameters field ❌
}

// WRONG — optional field
parameters?: SlashCommandParameter[]; // ❌
```

## Message Format

Messages use **markdown** via `marked.parse()`. Rich text formatting applies:

- Italic: `*text*`
- Bold: `**text**`
- Code: `` `text` ``

### `/me` — no new `MessageType`

`/me [message]` does NOT introduce `MessageType.Me`. Simply wrap the argument in `*...*` and post as a regular `MessageType.Message`:

```typescript
// CORRECT
await createMessage({
  message: marked.parse(`*${sanitizeHtml(params.message)}*`, { async: false }),
  roomId,
  type: MessageType.Message,
});

// WRONG — unnecessary new MessageType
type: MessageType.Me ❌
```

## Parameterized Command UI

`SlashCommandParameters.vue` handles the inline parameter input mode:

- Styled header bar (like `ReplyHeader.vue`) showing command name + description + close button
- `<v-form @submit.prevent="onSubmit">` wrapping all parameter inputs
- `SubmitEventPromise` from Vuetify — `const { valid } = await event` before proceeding
- Required fields use `:rules="[formRules.required]"` — Vuetify shows inline validation errors
- Optional fields use `:rules="[]"` (empty array, not omitted)
- Escape key dismisses via `useEventListener("keydown", ...)`, submit button is `type="submit"`

```vue
const onSubmit = async (event: SubmitEventPromise) => { const { valid } = await event; if (!valid ||
!pendingSlashCommand.value || !currentRoomId.value) return; // execute createMessage...
slashCommandStore.clearPendingSlashCommand(); };
```

## Execution Modes

Commands fall into two categories based on their `parameters` array:

- **Immediate** — `parameters: []` — execute on selection, no extra input
- **Parameterized** — has one or more parameters — transforms the composer into inline parameter input mode

The distinction is derived from `slashCommand.parameters.length > 0`, not a separate `mode` field.

## Never Use String Literals for Command Types

Always use `SlashCommandType.X` enum values — never string literals `"Me"`, `"Shrug"`, etc.:

```typescript
// CORRECT
case SlashCommandType.Me:
case SlashCommandType.Shrug:

// WRONG
case "Me":
case "Shrug":
```

This applies in `SlashCommandSuggestion.ts`, `SlashCommandParameters.vue`, and any switch over `slashCommand.type`.

## Adding a New Command

1. Add value to `SlashCommandType` enum
2. Add entry to `SlashCommandDefinitionMap` with `parameters: []` or required/optional params
3. Add `case SlashCommandType.X:` to `SlashCommandSuggestion.ts`:
   - Immediate: call `createMessage` directly
   - Parameterized: set `pendingSlashCommand` in `useSlashCommandStore`
4. No new `MessageType` unless the rendering is structurally different (e.g. Poll, VoiceCall)

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
