---
title: Console WSL sessions
description: Agent console sessions run inside a WSL 2 distribution from the Windows host, as the Code tab's WSL sessions are — deferred while a host started inside WSL already serves the page as this computer's.
---

# Console WSL Sessions

**What it was.** The Code tab can run a session "inside WSL 2 distribution on Windows", so a repository kept in Linux runs with Linux's tools ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why deferred.** A host started inside WSL with `pnpm dlx agent-console-server` listens on WSL's loopback, which WSL 2 forwards to Windows' own, so the page pairs with it from its printed link exactly as with a host on Windows, and its sessions run with Linux's tools. What the Code tab adds is the Windows host starting the session inside WSL itself — a second launcher beside the [session window](/docs/infra/claude-interface/agent-console/session-windows)'s, with its own path translation — for a reader nobody has yet been.

**Revisit when:** a reader keeps repositories in WSL and asks to open them from the Windows host rather than a host of their own inside WSL.

**Cheaper interim:** the host started inside WSL, paired from its printed link.
