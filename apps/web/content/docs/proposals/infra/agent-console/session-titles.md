---
title: Session titles
description: Proposal — a session in the agent console is renamed by clicking its title, in the heads-up display or the sessions tab, and the title is saved in the session's own transcript rather than in the page.
model: claude-opus-5-5
---

# Session Titles

A sub-spec of the [agent console](/docs/proposals/infra/agent-console). A session's title is read from its transcript: a custom title if one was set, else Claude Code's summary, else the first prompt. The sessions tab and the heads-up display both draw it, and neither can change it. Several sessions in one repository are then told apart by whatever their first prompt happened to say. The Code tab renames a session by clicking "the session title in the toolbar at the top of the active session".

## What it changes

- **Clicking the title renames the session**, in the heads-up display for the open session and on a session's row in the sessions tab for any other. The title becomes a text field in place. Enter saves and Escape keeps the old title. An empty title saves nothing.
- **The title is the transcript's.** A new `RenameSessionCommand` has the host call the SDK's `renameSession`, which appends a custom-title entry to the session's own transcript file. `getSessionTitle` already prefers `customTitle`, so the sessions list reads the new title back with no change, and the title travels with the transcript rather than living in the page.
- **An open session's title updates at once.** The host also sets the open session's in-memory title and refreshes the sessions list, so every connected page redraws it.
- **A session with no transcript yet**, opened but not prompted, is renamed in memory only. Its first prompt starts the transcript, and the host writes the pending title to it then.

## What is deliberately not in it

- **No tags or colours.** The SDK's `tagSession` exists, but a title is the one thing both reference surfaces let a person set. Grouping sessions is [deferred](/docs/infra/deferred/console-session-archive).

## Key files

| File                                                                                              | Role after the change                                                       |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `packages/agent-console-server/src/models/command/CommandType.ts`                                 | gains `RenameSession`                                                       |
| `packages/agent-console-server/src/models/command/Command.ts`                                     | `RenameSessionCommand` joins the union, in its own file                     |
| `packages/agent-console-server/src/models/driver/Driver.ts`                                       | gains `renameSession`                                                       |
| `packages/agent-console-server/src/services/server/handleCommand.ts`                              | routes the command to the driver                                            |
| `packages/agent-console-server/src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver.ts` | writes the title to the transcript, or holds it until the first prompt does |
| `apps/web/app/components/AgentConsole/Panel/Hud.vue`                                              | the open session's title, editable in place                                 |
| `apps/web/app/components/AgentConsole/Panel/Sessions.vue`                                         | each row's title, editable in place                                         |

## Sources

- [Claude Code desktop — work in parallel with sessions](https://code.claude.com/docs/en/desktop) — "To rename a session, click the session title in the toolbar at the top of the active session."
- [Claude Agent SDK — TypeScript reference](https://code.claude.com/docs/en/agent-sdk/typescript) — `renameSession`, which appends a custom-title entry to the session's transcript.
