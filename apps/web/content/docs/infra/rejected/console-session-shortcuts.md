---
title: Console session shortcuts
description: The Code tab's session keys — Cmd+N or Ctrl+N for a new session, Cmd+W or Ctrl+W to close one, Ctrl+Tab to cycle — in the agent console; the browser keeps those keys for its own windows and tabs, and an ordinary page cannot take them.
---

# Console Session Shortcuts

**What it was.** The Code tab starts a session with `Cmd+N` on macOS or `Ctrl+N` on Windows, closes one with `Cmd+W` or `Ctrl+W`, cycles them with `Ctrl+Tab` and `Ctrl+Shift+Tab`, and opens the mode, model and effort menus with `Cmd+Shift+M`, `Cmd+Shift+I` and `Cmd+Shift+E`, `Ctrl` in place of `Cmd` on Windows ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not.** The console is a browser tab, and the browser reserves `Cmd+N` or `Ctrl+N`, `Cmd+W` or `Ctrl+W` and `Ctrl+Tab` for its own windows and tabs: an ordinary page never receives them — only the [Keyboard Lock](https://developer.chrome.com/articles/keyboard-lock) API hands them to a page, and only in fullscreen, which a console beside the world is not — so the Code tab's keys cannot be carried over. Other keys would be the console's own invention, which parity does not ask for, and over the world every letter already moves or acts. The sessions tab starts, resumes, forks and closes sessions one click from anywhere, and the composer's selects are reached with Tab. The effort menu's key rides [effort level](/docs/proposals/infra/agent-console/effort-level), which binds it with the select it opens.

**Settled:** do not propose remapped session keys; a key the browser keeps is not the page's to take.
