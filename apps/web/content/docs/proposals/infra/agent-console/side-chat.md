---
title: Side chat
description: Proposal — a question asked beside the agent console's session, answered with the session's context but adding nothing back to it, as the Code tab's side chat does, built on the fork the host already has.
model: claude-opus-5-5
---

# Side Chat

A sub-spec of the [agent console](/docs/proposals/infra/agent-console). A question about the work in progress — what a function the agent just wrote does, whether a name is used elsewhere — asked in the session becomes part of it, spends its context and can steer the next turn. The Code tab's side chat "lets you ask Claude a question that uses your session's context but doesn't add anything back to the main conversation", opened with `Ctrl+;`.

## What it changes

- **`Ctrl+;` opens a side chat** in a drawer beside the conversation, with its own composer and its own answers.
- **It is a fork, discarded.** The first question forks the session at its latest message through the host's existing `ForkCommand` — the same fork the sessions tab and every message already offer — so the side chat starts with the whole conversation as context and the session itself is untouched. Closing the drawer closes the fork's session; nothing it said reaches the main conversation.
- **It asks, it does not act.** The fork opens in plan mode through the existing `SetPermissionModeCommand`, so a question cannot turn into edits beside the session's own.
- **It is never saved.** A closed session's transcript stays on disk, and the sessions tab lists every saved transcript through the SDK's `listSessions`, so an ordinary fork would come back as a closed session. The side chat's `ForkCommand` therefore carries a flag that opens the fork with the SDK's `persistSession: false`. The fork writes no transcript, and nothing of it is left once the drawer closes it.
- **It is not listed.** While open, the fork is in the host's open sessions, which the list also shows, so the sessions tab leaves an open side chat's fork out. The list stays the person's real sessions.

## What is deliberately not in it

- **No merging an answer back.** A side chat's answer that should steer the work is copied into the main composer by the person; the side chat never writes to the session.

## Key files

| File                                                                                              | Role after the change                                    |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/web/app/components/AgentConsole/Sheet.vue`                                                  | the drawer beside the conversation                       |
| `apps/web/app/components/AgentConsole/Panel/Sessions.vue`                                         | leaves an open side chat's fork out of the list          |
| `packages/agent-console-server/src/models/command/ForkCommand.ts`                                 | gains the flag for a fork that is never saved            |
| `packages/agent-console-server/src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver.ts` | the fork, opened in plan mode and closed with the drawer |
| `packages/agent-console-server/src/services/drivers/claudeAgentSdk/createSessionOpener.ts`        | passes `persistSession: false` for that fork             |

## Sources

- [Claude Code desktop — side chat](https://code.claude.com/docs/en/desktop) — "A side chat lets you ask Claude a question that uses your session's context but doesn't add anything back to the main conversation", opened with `Ctrl+;` or `/btw`.
- [Claude Agent SDK — TypeScript reference](https://code.claude.com/docs/en/agent-sdk/typescript) — the `persistSession` option, which when false saves no session to disk.
