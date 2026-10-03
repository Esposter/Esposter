---
title: Commission
description: A goal meter — while a turn works through a task list, the band shows the goal, how many tasks are done, the share complete and the time since it started, with the whole list one key away.
---

# Commission

Part of [Genshin mods](/docs/infra/claude-interface/genshin-mods). A long turn that plans a task list and works through it can run for many minutes, while the terminal shows only its newest step. Commission shows where the whole goal stands.

## How it works

A commission opens the first time the conversation creates a task, through the engine's task tools or its todo list, and its goal is the first line of the prompt that started that turn. From then on every task tool call is folded in once the tool has answered: a created task is added under the id its result gives, an update changes the fields it names, a deleted task goes, and a todo list replaces the list whole, its places as ids.

The row reads `goal · 3 of 4 · 75% · 12m`, the clock counting whole minutes from the commission's opening, with the task in progress under it. When every task is done the row shows it finished, and the commission closes when the person sends the next prompt; a `/clear` closes it too.

## How to use it

- With the band focused, `g` opens the whole list, each task ticked, current or waiting, and `g` again closes it.
- `/commission off` stops it, and `/commission on` brings it back.

## Key files

| File                                                                  | Role                                                    |
| :-------------------------------------------------------------------- | :------------------------------------------------------ |
| `packages/genshin-mods/src/services/commission/registerCommission.ts` | The task tools' calls folded in, opening the commission |
| `packages/genshin-mods/src/services/commission/foldTaskCall.ts`       | One call and its result into the list                   |
| `packages/genshin-mods/src/services/band/getCommissionSummary.ts`     | The row's line: goal, tasks done, share and minutes     |
| `packages/genshin-mods/src/services/registerLifecycle.ts`             | The prompt the goal is read from, and the close         |

## Notes

- The goal meter in the walkthrough this comes from also lists goals running in other sessions. A mod cannot read another session's state, so that view belongs to the [agent console](/docs/infra/claude-interface/agent-console), which already sees every session on a machine.
