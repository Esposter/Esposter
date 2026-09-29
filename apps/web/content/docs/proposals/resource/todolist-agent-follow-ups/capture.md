---
title: Capture
description: Proposal — a todo's optional origin names the repository and Claude Code session that wrote it, and a Claude Code plugin carries the endpoint, the session id and a capture skill into every repository, so a session's unfinished follow-ups land in the TodoList instead of its scrollback.
model: claude-opus-5-5
---

# Capture

Part of [TodoList agent follow-ups](/docs/proposals/resource/todolist-agent-follow-ups), built on [agent access](/docs/proposals/resource/todolist-agent-follow-ups/agent-access). The endpoint lets a session write a todo. Capture decides what a session writes, what the todo remembers about where it came from, and how every repository on the machine gets the endpoint without configuring each one.

## The origin

`TodoListItem` gains one optional field, absent on every todo the owner writes, as its other optional fields are:

```ts
interface TodoListItemOrigin {
  // The repository the follow-up belongs to, as `owner/name` from its origin remote, so the same repository matches
  // From every clone and every machine
  repository: string;
  // The Claude Code session that wrote it, for `claude --resume`
  sessionId: string;
  // Set once a drain hands it to the owner, and absent while an agent may still take it
  handedBackAt?: Date;
}
```

A todo with an `origin` is a follow-up. It is still an ordinary todo: it sorts, stars, dates, reminds and prints like the rest. The row's metadata line gains the repository's name, and the edit dialog shows the session with a copy button for `claude --resume <sessionId>`. A resume works only on the machine holding the session's transcript and from its project folder, which the dialog says.

No backfill is owed: the field is optional and absent everywhere today.

## The plugin

The endpoint, the session id and the two skills ship as one Claude Code plugin, a package of its own laid out as the [persona plugin](/docs/infra/claude-interface/persona-plugin) is, so a single install reaches every repository on the machine rather than one repository's config:

```text
packages/follow-ups/
  .claude-plugin/plugin.json   ← userConfig: the site url, and the token marked sensitive
  .mcp.json                    ← the endpoint, over HTTP, with the token as its Authorization header
  hooks/                       ← SessionStart: puts the session id and repository into context
  skills/capture/SKILL.md      ← what a follow-up is, and writing one
  skills/drain/SKILL.md        ← the loop (drain)
```

- **The token lives in the credential store.** It is a `userConfig` value marked sensitive, which Claude Code keeps in the system credential store rather than in a settings file, and `.mcp.json` reads it into the header. Setup is the one line the **Connect an agent** dialog shows.
- **The session id comes from a hook.** A tool call cannot see which session made it, but every hook's input names the session. A `SessionStart` hook reads its session id and the repository's origin remote and adds both to the session's context, so the model passes them to `add_follow_up` unchanged. A folder with no origin remote gets no repository line, and the skill writes no follow-up there, since nothing could drain it.

## What counts as a follow-up

The capture skill is what keeps the list from filling with noise, so its rules are strict:

- **Work the session saw and left undone** because it was outside the change in hand: the same defect in a sibling file, a page that still describes the old behaviour, a test that only passed by luck. Written as an instruction a cold session can act on, with the files named in the notes.
- **Never what the session could finish now.** A repository whose rules have a finding fixed by the change that finds it gets it fixed, and a follow-up is not a way around that rule.
- **Never what needs a design.** In Esposter that is a proposal ([engineering loops](/docs/architecture/engineering-loops)); elsewhere the skill tells the owner in its reply instead.
- **Written when found, not at the end.** A session ends in many ways, and one interrupted or compacted before a closing step loses everything held for it. Each follow-up is written at the moment it is recognised.
- **One todo each**, never a list of several in one todo's notes, since the drain completes one todo per change.

## Key files

| File                                                       | Role after the change                                                 |
| ---------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/web/shared/models/resource/todoList/TodoListItem.ts` | the optional `origin`, in the class and its schema                    |
| `apps/web/app/components/Resource/TodoList/ItemTitle.vue`  | the repository on the row's metadata line                             |
| `apps/web/app/components/Resource/TodoList/EditForm.vue`   | the session, with its resume command to copy                          |
| `packages/genshin-persona/.claude-plugin/plugin.json`      | the plugin manifest and sensitive `userConfig` the new plugin follows |
