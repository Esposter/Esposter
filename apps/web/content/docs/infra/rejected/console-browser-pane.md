---
title: Console browser pane
description: A browser inside the agent console, previewing the app and browsing sites beside the session as the Code tab's Browser pane does — rejected, because the console is already a browser tab, and the agent driving a browser is decided against.
---

# Console Browser Pane

The Code tab's Browser pane: Claude "can start a dev server and open it in the Browser pane to verify its changes", auto-verifying after every edit by screenshots, the DOM and clicks, and the pane is "a tabbed browser" for docs beside the app ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not:** Both halves are already had or already decided. The console is a page in the person's own browser, so the app it previews and the docs it reads are the next browser tab, with the person's own extensions, sessions and devtools — a browser nested inside that tab is a worse copy of the one it sits in. The half where the agent drives the browser to verify its own changes is decided against for this repository: no browser the agent drives, and the person's eyes are the layout check (the `run-app` skill). The same answer covers the Code tab's other preview panes: the dev servers it starts from `.claude/launch.json` to verify against, and the iOS Simulator pane, which is macOS-only and previews nothing this repository builds.
