---
title: Console remote sessions
description: Agent console sessions on another machine — over SSH, inside WSL or in Anthropic's cloud, as the Code tab offers — deferred while every session the console works runs on the machine its host runs on.
---

# Console Remote Sessions

**What it was.** The Code tab's environments beyond the local one: SSH sessions that "run Claude Code on a remote machine while using the desktop app as your interface", WSL sessions on Windows, and cloud sessions that "continue even if you close the app or shut down your computer" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why deferred.** The console already reaches a remote session without any of that: the host runs where the code is and the page connects to it, so a host started on another machine, or inside WSL, is a remote session with nothing built ([host](/docs/infra/claude-interface/agent-console/host)). What the Code tab adds is managing that from one window — installing the host, holding the connection — and every session worked today runs on the one machine the host runs on. A cloud session is a hosted agent, which the [agent console](/docs/proposals/infra/agent-console) proposal leaves out.

**Revisit when:** a second machine's sessions are worked often enough that starting its host by hand and pointing the page at it is a recurring cost.

**Cheaper interim:** start the host on the other machine and pair the page with it.
