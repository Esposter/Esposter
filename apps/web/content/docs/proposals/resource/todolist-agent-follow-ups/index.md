---
title: TodoList agent follow-ups
description: Proposal — the drain that works a repository's captured follow-ups one change at a time until none is left, the last part of TodoList agent follow-ups still to ship.
model: claude-opus-5-5
---

# TodoList Agent Follow-ups

Sessions already write the follow-ups they leave into the owner's TodoList ([TodoList agent follow-ups](/docs/resource/todolist-agent-follow-ups)), over the MCP endpoint every opted-in procedure is served from ([agent access](/docs/architecture/agent-access)). What remains is the loop that does them.

## The sub-specs

- [Agent access](/docs/architecture/agent-access) — shipped as a standard: the API key, the MCP endpoint, and the bridge that makes every opted-in procedure a tool.
- [Capture](/docs/resource/todolist-agent-follow-ups) — shipped: the `origin` field, the four follow-up procedures, the Claude Code plugin and what counts as a follow-up.
- [Drain](/docs/proposals/resource/todolist-agent-follow-ups/drain) — the loop, what it may and may not do on its own, handing a follow-up back to the owner, and the stop rule that keeps it converging.

## Key files

| File                                                      | Role after the change                                     |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `apps/web/content/docs/architecture/engineering-loops.md` | lists the drain among the work a session picks up unasked |
