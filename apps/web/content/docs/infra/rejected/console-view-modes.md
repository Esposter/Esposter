---
title: Console view modes
description: Normal, thinking and verbose transcript modes for the agent console, as the Code tab cycles them — rejected, because every tool call and thinking block already folds in place and opens on a click.
---

# Console View Modes

The Code tab's view modes: **Normal** collapses tool calls, **Thinking** adds the model's thinking, and **Verbose** shows "every tool call, file read, and intermediate step, plus thinking" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not:** A mode decides the detail of every row at once, where the console decides it per row: each tool call is folded in place over the opening of its output, each thinking block is folded as Claude folds it, and either opens on a click anywhere on it ([terminal parity](/docs/infra/claude-interface/agent-console/terminal-parity)). The one reading a verbose mode serves — everything that ran, in order — is the timeline tab. A mode would be a second control for what the fold already does, which the one-affordance rule refuses.
