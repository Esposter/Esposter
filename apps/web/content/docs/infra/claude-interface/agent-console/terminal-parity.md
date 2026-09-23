---
title: Terminal parity
description: The agent console's acceptance test, walked row by row. Every surface the Claude Code terminal shows and every action it takes, the part of the page that carries it, and where the console still falls short, each named rather than hidden.
---

# Terminal parity

The [agent console](/docs/infra/claude-interface/agent-console) replaces the terminal only if nothing is lost in the move, so every row here is something the terminal shows or does, set against the part of the page that carries it. A row marked partial says what is missing. The shortfalls are the work before the console can take a whole day's work without the terminal being opened.

## What the terminal shows

| Terminal surface                   | Where the console carries it                                                                                     | Status                                                                                                         |
| :--------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| The conversation                   | the conversation column, answers rendered as sanitized markdown, a search over the session                       | partial: a whole answer copies in one click, a single code block inside it does not                            |
| Thinking                           | a folded panel per thinking block, summarized rather than omitted                                                | done                                                                                                           |
| Tool calls and their results       | the timeline, each call collapsible, with its duration and a success or error mark                               | done                                                                                                           |
| File edits                         | a side-by-side diff per edit, and the Changes tab grouping every edit by file                                    | partial: a file's edits are listed in order, not merged into one diff against where it started                 |
| Subagents                          | a timeline lane per subagent, titled by its task and marked with its status                                      | partial: the lanes are stacked in the side panel rather than drawn beside the main one                         |
| Permission prompts                 | a card with the tool and its whole input, an edit shown as its diff; allow, always allow, or deny with a message | done                                                                                                           |
| Model, context used, cost          | the header: the model, a context gauge that warns at nine tenths of the compaction threshold, the cost so far    | done                                                                                                           |
| Plan usage                         | a chip in the header with the usage window's share, coloured once the SDK warns                                  | done                                                                                                           |
| Todo list                          | a checklist pinned above the timeline                                                                            | partial: the Claude Code build the SDK ships gives SDK sessions no todo tool, so it stays empty                |
| Hook output                        | a folded row where the hook fired                                                                                | done                                                                                                           |
| Session start output — the persona | the SessionStart hook's row                                                                                      | partial: shown as a row; a theme reading it is the [Genshin theme](/docs/proposals/infra/agent-console/themes) |

## What the terminal does

| Terminal action                 | Where the console carries it                                                           | Status                                                                                      |
| :------------------------------ | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| Send a prompt                   | a multi-line editor; Enter sends and Shift+Enter breaks the line                       | done                                                                                        |
| Attach a file                   | paste or drop into the editor                                                          | partial: images only; other files are named in the prompt, as the terminal does with a path |
| Interrupt a turn                | the stop button and the Escape key                                                     | done                                                                                        |
| Slash commands                  | a palette listing the session's own commands, the person's skills and plugins included | done                                                                                        |
| Plan mode, accept edits, bypass | the mode select in the header                                                          | done                                                                                        |
| Switch model                    | the model select in the header                                                         | done                                                                                        |
| Resume and continue             | the session list: a closed session resumes on a click, its transcript replayed first   | done                                                                                        |
| Fork                            | the session list, or from any message                                                  | done                                                                                        |
| Rewind                          | from any message                                                                       | partial: the conversation rewinds; the files the later turns edited do not                  |

## Notes

- Every row marked done is covered by the store, component and visual tests replaying the recorded session. A live session driven end to end from the page, a prompt through a permission card to a turn's end, is the check this page has not had: the host was run live for pairing, opening, the palette's commands and models, the context gauge and closing, and nothing further.
- The page does what the terminal cannot in the rows above: parallel sessions each with their state one click apart, a notification when a hidden session needs attention, a search over the session, and a diff for every edit, including the one a permission card is asking about.
