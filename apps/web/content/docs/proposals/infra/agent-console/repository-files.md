---
title: Repository files
description: Proposal — the agent console reaches the session's files the way the Code tab does, typing @ in the composer to mention one and opening any path the conversation or a diff names in a read-only file view.
model: claude-opus-5-5
---

# Repository Files

A sub-spec of the [agent console](/docs/proposals/infra/agent-console). The composer takes a file by paste or drop, which needs the file already open somewhere else, and a path the agent names in its reply or its diff is text with nowhere to go. The Claude desktop app's Code tab does both from inside: "type @ followed by a filename to add a file to the conversation context", and "click file paths in chat or diff viewer to open in the file pane".

## What it changes

- **@ in the composer** opens a filterable list of the session's files, as the slash key opens the command palette today. The host answers a `ListFilesCommand` with `git ls-files` from the session's working directory, falling back to a directory walk outside a repository, and the page filters it as the reader types. A pick inserts the path as an `@path` mention, which Claude Code itself resolves on the prompt, so nothing is read into the prompt by the console.
- **A path is a link to the file.** A path in the conversation, a tool call's input or a diff's header opens the file in a read-only view over the conversation panel, drawn with the diff's own syntax highlighting; a `ReadFileCommand` returns the file's text from the host. A file over the view's size cap, or one that is not text, says so and offers nothing more.
- **The view offers what the Code tab's context menu does that the console can carry**: attach the file to the next prompt, and copy its path.

Every read is the host's, inside the session's working directory: a path outside it is refused, so the page cannot read a file the session could not name. A read is the host's rather than the driver's, and `handleCommand` resolves to a session id at most. So both commands are answered in `createAgentConsoleServer` beside `ListSessions`, and their answers reach the page as new `Files` and `FileContent` server messages.

## What is deliberately not in it

- **No editing.** The Code tab's file pane saves spot edits back; an edit here would race the agent's own edits to the same file, and the checkpoints that make rewind work only cover the agent's. A person editing a file uses their editor.
- **No open in an external editor.** The page cannot launch a desktop program; copying the path is the bridge.

## Key files

| File                                                                            | Role after the change                                             |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `packages/agent-console-server/src/models/command/CommandType.ts`               | gains the list and read file commands                             |
| `packages/agent-console-server/src/models/command/Command.ts`                   | both join the union, each in its own file                         |
| `packages/agent-console-server/src/models/server/ServerMessageType.ts`          | gains `Files` and `FileContent`                                   |
| `packages/agent-console-server/src/models/server/ServerMessage.ts`              | the two answer messages join the union                            |
| `packages/agent-console-server/src/services/server/createAgentConsoleServer.ts` | answers them from the session's working directory, confined to it |
| `apps/web/app/store/agentConsole/connection.ts`                                 | hands each answer to the list or the file view                    |
| `apps/web/app/components/AgentConsole/Panel/Composer.vue`                       | the @ list and the mention it inserts                             |
| `apps/web/app/components/AgentConsole/Panel/Diff.vue`                           | a file header that opens the file                                 |

## Sources

- [Claude Code desktop — file management](https://code.claude.com/docs/en/desktop) — "Type @ followed by a filename to add a file to the conversation context", and "Click file paths in chat or diff viewer to open in the file pane", with **Attach as context** and **Copy path** on its context menu.
