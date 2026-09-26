---
name: slash-commands
description: Apply when writing or modifying slash commands, useExecuteSlashCommand, SlashCommandDefinitionMap, or the SlashCommandParameters components. Esposter slash command conventions — parameter definitions, execution modes, the chip-based parameter UI and its safeParse/setErrors validation, message formatting, adding new commands, and SlashCommandDefinitionMap being the inventory rather than any page that mirrors it (plus the two shapes the map cannot show — a command that posts nothing, and inline parameters versus a dialog being alternatives).
---

# Slash Command Conventions

## Core Types

`SlashCommandParameter` extends `Description` — always has both `name` and `description` (never optional):

```ts
export interface SlashCommandParameter extends Description {
  isRequired: boolean;
  name: string;
}

// Shared value schema — normalize, then require non-empty
export const slashCommandParameterValueSchema = z.string().transform(normalizeString).pipe(z.string().min(1));
```

`SlashCommand` — `parameters` is always present (never `parameters?`). Default to `[]` for commands with no parameters:

```ts
export interface SlashCommand extends Description, ItemEntityType<SlashCommandType> {
  icon: string;
  parameters: SlashCommandParameter[];
  title: string;
}

// no params: empty array — always present, never optional or omitted
[SlashCommandType.Roll]: { parameters: [], ... }
```

## Message Format

A posting case assigns markdown to `message` and nothing else — `marked.parse` and `sendMessage` run once after the switch, never a sanitize call, and `/me` is italic text rather than a `MessageType` (`references/messages.md`).

## Parameterized Command UI — Discord-style chips

Parameters are inline chips over raw inputs, validated by `safeParse` into the store's `setErrors` — no `UiForm`, no `UiRules`; `focusedIndex` is the one focus source, and Escape collapses to text rather than discarding (`references/parameter-ui.md`).

## Execution Modes

A command with no parameters runs at once, one with parameters goes pending; the one switch over `SlashCommandType` is in `useExecuteSlashCommand`, closed by `exhaustiveGuard` (`references/execution.md`).

## Adding a New Command

Enum value, map entry, switch case — the map's `satisfies` and the switch's guard fail typecheck until all three agree (`references/execution.md`).

## The registry is the list, not this page

The enum, the map and the switch must stay in sync — `satisfies Record<SlashCommandType, SlashCommand>` enforces the map and `exhaustiveGuard` enforces the switch — so `SlashCommandDefinitionMap` **is** the readable inventory of what exists and what each command does. Never mirror it here: a copy is one command behind from the first addition.

Two shapes are worth knowing before reading it, because neither is guessable from the map alone:

- **A command need not post a message at all.** Leave `message` empty and the shared tail sends nothing — that is how a command which only runs a mutation (setting a room topic) or only opens a dialog is written.
- **Inline parameters and a dialog are alternatives.** A command either collects its arguments as inline chips through `parameters`, or opens a dialog and declares none. Never both.

## Reference pages

- `references/messages.md` — when a command posts a message.
- `references/parameter-ui.md` — when changing how parameters are entered, validated, focused or dismissed.
- `references/execution.md` — when a command runs, or when adding one.
