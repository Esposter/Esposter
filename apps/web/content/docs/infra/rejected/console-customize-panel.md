---
title: Console customize panel
description: A panel in the agent console managing connectors, skills and plugins, as the Code tab's Customize button does — rejected, because those are Claude Code's own settings and commands, and the console reuses Claude Code rather than keeping a second editor of it.
---

# Console Customize Panel

The Code tab's **Customize**: "to manage connectors, skills, and plugins in one place, click Customize in the sidebar" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not:** Skills, plugins and MCP servers are Claude Code's own settings, written by its own commands and files and read by a session when it starts. The console already shows what a session has: its slash palette lists the session's commands, the person's skills and plugins included ([terminal parity](/docs/infra/claude-interface/agent-console/terminal-parity)). A panel that installs or removes them would be a second writer of files Claude Code owns, kept in step with every change to their format, where parity's rule is to reuse what Claude Code has rather than stand in for it.
