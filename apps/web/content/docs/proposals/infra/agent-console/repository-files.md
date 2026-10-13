---
title: Repository files, path links
description: Proposal — the part of repository files not yet built: a file path the conversation or a tool call names becomes a link that opens the file in the read-only view. The @ mention and the view itself are shipped.
model: claude-haiku-5-5
---

# Repository files, path links

A sub-spec of the [agent console](/docs/proposals/infra/agent-console). The [repository files](/docs/infra/claude-interface/agent-console/repository-files) page covers the `@` mention and the read-only file view, both shipped. What is left is the path that appears inside a reply or a tool call: it is text with nowhere to go, although the Code tab opens it in the file pane when clicked.

## What it changes

- **A path in the conversation is a link.** A path a reply names, in its prose or its code, opens the file in the view over the conversation. Detection runs over the rendered Markdown, so a path inside a code span links the same as one in prose, and a string that does not resolve to a file in the session's folder stays plain text.
- **A tool call's file input is a link.** The path a tool call reads, edits or writes in its input opens the same view, so a change the agent made is one click from the file it changed.
- **Opening goes through the existing read command.** A click sends the read command the view already uses, and the host's confinement answers a path outside the session's folder with a refusal shown as an alert, not a view.

## Key files

| File                                                      | Role after the change                                                 |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| `apps/web/app/components/AgentConsole/Markdown.vue`       | a path in rendered prose or code opens the file                       |
| `apps/web/app/components/AgentConsole/Panel/ToolCall.vue` | a file input opens the file                                           |
| `apps/web/app/components/AgentConsole/Panel/File.vue`     | the view takes a file opened from a link, as it does from the changes |

## Sources

- [Claude Code desktop — file management](https://code.claude.com/docs/en/desktop) — "Click file paths in chat or diff viewer to open in the file pane".
