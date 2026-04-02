# Esbabbler — Slash Command Architecture

## Overview

Slash commands are triggered by `/` in the message input. The Tiptap suggestion API (already used for `@` mentions) powers the picker UI. Each command is a definition in a `SlashCommandDefinitionMap` — the same map-based pattern used in `ColumnStatisticsDefinitionMap` and `ColumnChartDataMap`.

Commands fall into two categories:

- **Immediate** — execute on selection with no extra input (e.g. `/roll`)
- **Dialog** — open a form dialog to collect parameters before sending (e.g. `/poll`)

---

## Folder Structure

```
packages/shared/
  models/message/
    slashCommands/
      SlashCommand.ts          # interface SlashCommand + SlashCommandContext
      SlashCommandType.ts       # enum SlashCommandType { Poll, Roll }
    poll/
      PollMessageContent.ts     # interface PollMessageContent { question, options, votes }
  constants/message/
    SlashCommandDefinitionMap.ts  # Record<SlashCommandType, SlashCommand>

packages/app/
  app/
    composables/message/
      useSlashCommandExtension.ts   # Tiptap Extension (mirrors useMentionExtension)
    services/message/
      slashCommands/
        SlashCommandSuggestion.ts   # suggestion config (mirrors suggestion.ts)
        executeRoll.ts              # immediate: posts RNG result as a message
    components/Message/
      SlashCommand/
        Suggestion.vue              # picker dropdown (mirrors Mention suggestion UI)
      Model/Message/Type/
        Poll.vue                    # renders a poll message with vote buttons
      Input/
        PollDialog.vue              # form dialog: question + options input
  server/trpc/routers/message/
    vote.ts                         # createVote / deleteVote mutations
```

---

## Core Types

### `SlashCommandType.ts`

```typescript
export enum SlashCommandType {
  Poll = "Poll",
  Roll = "Roll",
}
```

### `SlashCommand.ts`

Interface-first. The `execute` function receives a `SlashCommandContext` and is responsible for the full action — either firing a tRPC call directly (Roll) or triggering a dialog that eventually does (Poll).

```typescript
export interface SlashCommandContext {
  roomId: string;
}

export interface SlashCommand extends ItemEntityType<SlashCommandType> {
  title: string;
  description: string;
  icon: string; // MDI icon name
  execute(context: SlashCommandContext): Promise<void>;
}
```

`ItemEntityType<SlashCommandType>` provides `readonly type: SlashCommandType` — same pattern as column and transformation types.

### `SlashCommandDefinitionMap.ts`

```typescript
export const SlashCommandDefinitionMap = {
  [SlashCommandType.Poll]: { ... },
  [SlashCommandType.Roll]: { ... },
} as const satisfies Record<SlashCommandType, SlashCommand>;
```

---

## Poll Message Type

`/poll` introduces a new `MessageType.Poll`. Poll data lives in the existing `message` string field serialised as JSON (no schema change needed beyond the new enum value).

### `PollMessageContent.ts`

```typescript
export interface PollOption {
  id: string; // nanoid — stable across edits
  label: string;
}

export interface PollMessageContent {
  question: string;
  options: PollOption[];
}
```

Votes are stored separately via a new `votes` Azure Table (partitioned by `roomId`, row key `messageRowKey|userId`) — one row per user per poll, value is `optionId`. This avoids mutating the original message and keeps vote writes cheap.

### New `MessageType`

```typescript
enum MessageType {
  EditRoom = "EditRoom",
  Message = "Message",
  PinMessage = "PinMessage",
  Poll = "Poll", // new
  Webhook = "Webhook",
}
```

---

## Tiptap Integration

Mirrors the existing `@` mention flow exactly:

| Mention                                        | Slash Command                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `useMentionExtension.ts`                       | `useSlashCommandExtension.ts`                                            |
| `services/message/suggestion.ts`               | `services/message/slashCommands/SlashCommandSuggestion.ts`               |
| `components/Message/.../MentionSuggestion.vue` | `components/Message/SlashCommand/Suggestion.vue`                         |
| Trigger char: `@`                              | Trigger char: `/`                                                        |
| Items: room members                            | Items: `Object.values(SlashCommandDefinitionMap)`                        |
| On select: inserts mention node                | On select: calls `command.execute(context)` then clears the editor input |

`useSlashCommandExtension` is passed into `RichTextEditor` via the existing `extensions` prop on `Message/Model/Message/Input/Index.vue`.

---

## Per-Command Specs

### `/roll`

- **Type**: Immediate
- **Execute**: Calls `createMessage` tRPC mutation with `type: MessageType.Message`, `message: "🎲 Rolled a **N**"` where N is generated server-side (RNG in the mutation handler, not client-side)
- **No dialog needed**

### `/poll`

- **Type**: Dialog
- **Execute**: Opens `PollDialog.vue` (a `StyledEditFormDialog`) with:
  - Question field (string, required)
  - Options list (minimum 2, max 10 — add/remove rows, same drag pattern as column reorder)
- **On submit**: Calls `createMessage` with `type: MessageType.Poll`, `message: JSON.stringify(pollContent)`
- **Rendered by**: `Message/Model/Message/Type/Poll.vue` — shows question, option buttons, live vote counts, highlights the user's current vote
- **Vote**: `createVote` / `deleteVote` tRPC mutations in `server/trpc/routers/message/vote.ts`

---

## What Does Not Change

- `sendMessage(editor)` in `store/message/data.ts` — slash commands bypass the normal send flow entirely; `execute()` calls `createMessage` directly
- `RichTextEditor` — no changes; extensions are passed in as props
- `suggestion.ts` for mentions — untouched
