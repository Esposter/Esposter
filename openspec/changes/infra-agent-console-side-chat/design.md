# Side Chat

A sub-spec of the [agent console](../infra-agent-console-program/design.md). A question about the work in progress — what a function the agent just wrote does, whether a name is used elsewhere — asked in the session becomes part of it, spends its context and can steer the next turn. The Code tab's side chat "lets you ask Claude a question that uses your session's context but doesn't add anything back to the main conversation", opened with `Ctrl+;`.

## What it changes

- **`Ctrl+;` opens a side chat** in a drawer beside the conversation, with its own composer and its own answers.
- **It is a fork, discarded.** The first question forks the session at its latest message through the host's existing `ForkCommand` — the same fork the sessions tab and every message already offer — so the side chat starts with the whole conversation as context and the session itself is untouched. Closing the drawer closes the fork's session; nothing it said reaches the main conversation.
- **It asks, it does not act.** The fork's query opens in plan mode through the SDK's `permissionMode` option, set when the fork opens rather than by a `SetPermissionModeCommand` after it, so no turn can run before the mode is in force and a question cannot turn into edits beside the session's own.
- **It is never saved.** A closed session's transcript stays on disk, and the sessions tab lists every saved transcript through the SDK's `listSessions`, so an ordinary fork would come back as a closed session. The side chat's `ForkCommand` therefore carries an `isSideChat` flag that opens the fork with the SDK's `persistSession: false`. The fork writes no transcript, and nothing of it is left once the drawer closes it.
- **It is not listed.** While open, the fork is in the host's open sessions, which the list also shows, so the host leaves an open side chat out of its sessions list. A window that holds a side chat reports the flag when the session opens and again when the window rejoins a host started since, so the list stays the person's real sessions.

## What is deliberately not in it

- **No merging an answer back.** A side chat's answer that should steer the work is copied into the main composer by the person; the side chat never writes to the session.

## Notes

- The first question needs no new fork behaviour. The whole-conversation fork, an empty message uuid, already starts at the session's latest message, so the side chat reuses it as it is.

## Key files

| File                                                                                              | Role after the change                                                                      |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `apps/web/app/components/AgentConsole/Sheet.vue`                                                  | the Ctrl+; chord, and the drawer beside the console's tabs                                 |
| `apps/web/app/components/AgentConsole/Panel/SideChat.vue`                                         | the drawer: its header, its conversation and composer, and the session scope they read     |
| `apps/web/app/store/agentConsole/sideChat.ts`                                                     | whether the drawer is open, the fork it asks through and the question held until it opens  |
| `apps/web/app/store/agentConsole/connection.ts`                                                   | asks, adopts and closes the side chat's fork, and routes its commands to its host          |
| `apps/web/app/services/agentConsole/createSessionReads.ts`                                        | the reads of one session's view, shared by the console's session and the drawer's          |
| `apps/web/app/composables/agentConsole/useAgentConsoleSession.ts`                                 | the session a component reads: the drawer's where it provides one, the console's otherwise |
| `packages/agent-console-server/src/models/command/ForkCommand.ts`                                 | gains `isSideChat`, the flag for a fork that is never saved                                |
| `packages/agent-console-server/src/services/drivers/claudeAgentSdk/createClaudeAgentSdkDriver.ts` | passes the flag into the fork, which the drawer closes                                     |
| `packages/agent-console-server/src/services/drivers/claudeAgentSdk/createSessionOpener.ts`        | opens a side chat's fork with `persistSession: false` and plan mode                        |
| `packages/agent-console-server/src/services/drivers/claudeAgentSdk/listSessionSummaries.ts`       | leaves an open side chat out of the sessions list                                          |
| `packages/agent-console-server/src/services/drivers/window/createWindowDriver.ts`                 | holds the flag for a side chat's window, for the list and for a rejoin                     |
| `packages/agent-console-server/src/services/drivers/window/serveSessionChild.ts`                  | reports the flag when a window's session opens and when the window rejoins                 |

## Sources

- [Claude Code desktop — side chat](https://code.claude.com/docs/en/desktop) — "A side chat lets you ask Claude a question that uses your session's context but doesn't add anything back to the main conversation", opened with `Ctrl+;` or `/btw`.
- [Claude Agent SDK — TypeScript reference](https://code.claude.com/docs/en/agent-sdk/typescript) — the `persistSession` option, which when false saves no session to disk.
