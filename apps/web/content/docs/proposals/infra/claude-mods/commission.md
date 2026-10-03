---
title: Commission
description: Proposal — a goal meter; while a turn works through a task list, the band shows the goal, how many tasks are done, the share complete and the time since it started, with the list itself one key away.
model: claude-opus-5-5
---

# Commission

Part of [Claude Code mods](/docs/proposals/infra/claude-mods). A long turn that plans a task list and works through it can run for many minutes, and the terminal shows only its newest step. Commission shows where the whole goal stands.

## Behaviour

A commission opens the first time a turn creates a task, through the engine's task tools or its todo list. Its goal is the prompt that started the turn, cut to one line. From then on, every task tool call's result updates the list: a created task is added with the id the result gives it, an updated one changes status, a deleted one goes. A todo list is replaced whole each time it is written.

The band row reads `goal · 3 of 4 · 75% · 12m`, the clock counting from the commission's opening. Under it is the task in progress, or the list itself while the band is focused and `g` has opened it, each task ticked, current or waiting.

The commission closes when every task is complete and the turn has ended, after the row has shown it finished, or on a `/clear`. A new commission replaces an open one when a later turn creates tasks again.

## State and switching

| State        | Holds                                                     |
| :----------- | :-------------------------------------------------------- |
| `commission` | The goal, when it opened and the tasks, empty when closed |
| `isExpanded` | Whether the full list is open                             |
| `isEnabled`  | `/commission on` or `off`, kept in the store              |

Folding a task tool's call and result into the list is a pure function, the one the tests cover: create, update, delete and a whole todo list.

## Files

All new, under `packages/genshin-mods`:

```text
src/commission/registerCommission.ts the task tool calls folded in, the close
src/commission/foldTaskCall.ts       one call and its result into the list
src/commission/foldTaskCall.test.ts
```

## Notes

- The video's version also lists goals running in other sessions. That needs one session to read another's state, which the engine does not offer a mod, so it is left to the [agent console](/docs/infra/claude-interface/agent-console), which already sees every session on a machine.
