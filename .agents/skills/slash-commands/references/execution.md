# Execution and Adding a Command

Read when a command runs, or when adding one.

## Execution modes

Derived from `slashCommand.parameters.length > 0`, not a separate `mode` field. `SlashCommandSuggestion.ts` (which contains **no switch** — it only routes) branches on it:

- **Immediate** — `parameters: []` — `useExecuteSlashCommand()` runs straight away
- **Parameterized** — one or more parameters — `setPendingSlashCommand(slashCommand, remainingText)`, which parses any already-typed text into parameter values

## The execution switch

The only switch over `SlashCommandType` is in `app/composables/message/slashCommand/useExecuteSlashCommand.ts`, closed by `exhaustiveGuard(command)` — so a new enum value fails typecheck until handled. It is **not** in `SlashCommandSuggestion.ts`.

Its argument is a discriminated union pairing each type with its own parameter shape, so `command.parameterValues` is narrowed per case:

```ts
{ [P in SlashCommandType]: { parameterValues: SlashCommandParameters<P>; type: P } }[SlashCommandType]
```

Always use `SlashCommandType.X` enum values, never `"Me"`, `"Shrug"`, etc.

## Adding a command

1. Add value to `SlashCommandType` enum.
2. Add entry to `SlashCommandDefinitionMap` with `parameters: []` or required/optional params (`as const satisfies Record<SlashCommandType, SlashCommand>` forces this).
3. Add `case SlashCommandType.X:` to the switch in `useExecuteSlashCommand.ts`:
   - Posting a message: assign `message` and `break` — the shared tail parses + sends it
   - Opening a dialog: flip the dialog store's state (`isOpen.value = true`, `open(ScheduledMessageJobType.X)`)
   - Neither: do the work inline (e.g. `Topic` runs a room mutation and posts nothing)
4. No new `MessageType` unless rendering is structurally different (e.g. Poll, Call).
