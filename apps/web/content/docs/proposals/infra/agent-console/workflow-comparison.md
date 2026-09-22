---
title: Workflow comparison
description: Proposal — today's terminal workflow set against the agent console's, as flows and task by task, so each claimed gain is a step the console removes and each cost is a step it adds — the ground truth the console is judged against once it runs.
model: claude-opus-5-5
---

# Workflow comparison

The [agent console](/docs/proposals/infra/agent-console) claims to be an upgrade, which is a claim about steps: what a person does to get a thing done today, and what they do with the console. This page draws both, so the claim can be checked the day the console runs — every row below is a thing to time with a stopwatch in a real session, and a row the console loses is a defect.

## One turn, today

```mermaid
flowchart TD
  A[Type the prompt in the terminal] --> B[Watch the scrollback]
  B --> C{Permission prompt}
  C -->|scroll up to read the full input| D[Answer with a key]
  D --> B
  B --> E[Turn ends]
  E --> F{Review what changed}
  F -->|git diff in a second terminal or the editor| G[Read the diff]
  F -->|scroll back for the tool calls| H[Reconstruct what ran]
  E --> I{Context left}
  I -->|read the status line, or run a command| J[Decide to compact]
  E --> K{Other sessions}
  K -->|switch terminal tab| L[Find where that one was]
```

## One turn, in the console

```mermaid
flowchart TD
  A[Type the prompt in the console] --> B[Conversation, tool timeline and diff fill side by side]
  B --> C{Permission prompt}
  C -->|full input shown on the card| D[Click allow or deny]
  D --> B
  B --> E[Turn ends — a notification if the tab is hidden]
  E --> F[The turn's diff is already open, per file]
  E --> G[Context gauge in view, warns before compaction]
  E --> H[Session list shows every session's state — one click to switch]
```

## Task by task

| Task                                   | Today                                                         | In the console                                                       |
| :------------------------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------- |
| Start work                             | open a terminal, `cd`, run `claude`                           | open the page; the host is already running, pick the repo            |
| Read a long tool input before allowing | scroll the prompt, the input often truncated                  | the card shows it whole, formatted                                   |
| Review an edit                         | a second terminal or the editor, `git diff`                   | the turn's diff beside the conversation, per file                    |
| Find what a command printed earlier    | scroll back, or search the scrollback if the terminal can     | the timeline, each call collapsible, searchable                      |
| Know how much context is left          | the status line, if configured                                | a gauge, with a warning before automatic compaction                  |
| Run two sessions at once               | two terminal tabs, their state invisible from each other      | the session list, each with its state, one click apart               |
| Stop a runaway turn                    | escape                                                        | the stop button, or escape in the page                               |
| Hand a session to the terminal         | —                                                             | `claude --resume` on the same session id; nothing is lost either way |
| Follow the review collector            | the Actions tab, the release pull request and commit comments | the harbour view                                                     |
| Hear the character                     | the persona plugin's hooks                                    | the Genshin theme, with the scene reacting                           |

## What the console costs

The comparison is only honest with the other column filled in. The console adds:

- **A process to run.** The host must be running before the page is useful; the terminal needs nothing. The host installs as a login item so the step is paid once, not per session.
- **A tab to keep.** The work is in a browser tab rather than a terminal window. Anything the person does from the terminal around a session — a quick `git` command, a test run — still happens in a terminal, or in the console's shell panel once one exists.
- **Surface to maintain.** A host, a wire, a page and a theme layer, against a terminal someone else maintains. Every Claude Code release that changes the SDK's messages is a change the driver has to follow.
- **A dependency on the SDK's billing.** Today the SDK runs on the subscription's own limits; if that changes, the SDK driver changes cost and the terminal-mirror driver is the fallback that keeps the console free ([drivers](/docs/proposals/infra/agent-console/drivers)).

## How the comparison is used

Once terminal parity ships, one working day is done in the console alone, and every time the terminal had to be opened is written down as a row here with the reason. The console is not taken further — no theme, no view — while that list is non-empty.
