---
title: Rejected
description: Infrastructure ideas we decided against — one page per idea with the rationale.
---

# Rejected

Ideas we decided against. Check here before proposing — never re-argue a decided idea.

- [Character animation](/docs/infra/rejected/character-animation) — the session character’s burst, attacks or idle played in the terminal beside the welcome; nothing inside the tool moves, and no rendering read.
- [Official plugin directory](/docs/infra/rejected/official-plugin-directory) — listing the persona plugin in Anthropic's marketplace beside the repository's own.
- [Social preview image](/docs/infra/rejected/social-preview-image) — an image drawn in the tokens for a shared link, generated at build; no page prerenders without resetting the reader's style and session.
- [SDK-driven companion](/docs/infra/rejected/sdk-driven-companion) — a companion window driving a Claude session of its own; its turns come out of the limits the work needs, and a second session holds none of the work.
- [Console browser pane](/docs/infra/rejected/console-browser-pane) — a browser inside the console; the console is already a browser tab, and the agent driving one is decided against.
- [Console pull request bar](/docs/infra/rejected/console-pull-request-bar) — pull requests, CI status and auto-merge from a session; the review collector owns every pull request here.
- [Console view modes](/docs/infra/rejected/console-view-modes) — normal, thinking and verbose transcripts; every row already folds in place.
- [Console computer use](/docs/infra/rejected/console-computer-use) — the agent controlling the desktop; the console's reach ends at the host's sessions.
- [Console scheduled tasks](/docs/infra/rejected/console-scheduled-tasks) — prompts run on a timer; `/loop` and routines already schedule work, and unattended turns spend the work's limits.
- [Console customize panel](/docs/infra/rejected/console-customize-panel) — managing connectors, skills and plugins; they are Claude Code's own settings, and the palette already lists them.
- [Console environment editor](/docs/infra/rejected/console-environment-editor) — the variables a session runs with; it runs in the host's environment, and a store beside it is a second home for secrets.
- [CDN in front of Railway](/docs/infra/rejected/cdn-in-front-of-railway) — a CDN proxying the app to cut egress; a second service to run, where compressing our own assets saves most of it.
- [LiveKit stack trim](/docs/infra/rejected/livekit-stack-trim) — dropping Redis and develop's LiveKit to lower Railway usage; the setup waits on Railway routing UDP, and the saving never reaches the bill.
- [Console session shortcuts](/docs/infra/rejected/console-session-shortcuts) — Cmd+N or Ctrl+N, Cmd+W or Ctrl+W and Ctrl+Tab for sessions; the browser keeps those keys, and an ordinary page never receives them.
- [Console pane layout](/docs/infra/rejected/console-pane-layout) — draggable and pop-out panes; the panels are tabs over the world, and a second tab is a second window.
