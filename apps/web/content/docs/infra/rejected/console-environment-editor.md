---
title: Console environment editor
description: An editor in the agent console for the environment variables a session and its dev servers run with, as the Code tab's local environment editor does — rejected, because a session already runs in the host's environment, and a store of variables beside it would be a second home for secrets.
---

# Console Environment Editor

The Code tab's local environment editor: "to set environment variables for local sessions and dev servers on any platform, open the environment dropdown in the prompt box, hover over Local, and click the gear icon" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not:** The host is a process the person starts from their own shell, and every session it opens inherits that environment, as a terminal session does. Changing it is changing that shell's profile, or the repository's own `.env` files, which the session reads as it always has. An editor here would keep variables in the page or the host, a second home for the values most likely to be secrets, drifting from the shell the person also works in. The [shell pane](/docs/proposals/infra/agent-console/shell-pane) opens with the same environment, so a variable is checked there.
