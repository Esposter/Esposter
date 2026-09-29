---
title: Console pane layout
description: Draggable, resizable and pop-out panes in the agent console, arranged in any layout as the Code tab's workspace is — rejected, because the console's panels are tabs over the world, and a second window is already a second browser tab on the same host.
---

# Console Pane Layout

The Code tab's workspace: "drag a pane by its header to reposition it, or drag a pane edge to resize it", and "pop a pane such as the diff or terminal out into its own window" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not:** The Code tab's panes share a window with nothing else. The console's page is its world, and its panels are tabs in one overlay over it ([console overlay](/docs/infra/claude-interface/agent-console/console-overlay)). A grid of panes a person arranges would make the world one pane among many and give every panel a second layout to keep working. The pop-out half is already had: the console is a web page, so a second tab or window on the same host shows another panel, or another session, beside the first.
