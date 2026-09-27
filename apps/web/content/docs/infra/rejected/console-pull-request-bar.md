---
title: Console pull request bar
description: A pull request opened from an agent console session, with a CI status bar, auto-fix and auto-merge, as the Code tab offers — rejected, because this repository's pull requests are the review collector's alone.
---

# Console Pull Request Bar

The Code tab's pull request flow: "after you open a pull request, a CI status bar appears in the session", with auto-fix that "attempts to fix failing CI checks" and auto-merge "once all checks pass" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not:** In this repository a session never opens a pull request. It pushes `ai/queue`, and the [review collector](/docs/infra/review-collector) cuts every window, opens the one release pull request, merges it on its review and repairs a red `main` itself. A session opening its own pull request would spend a review slot on a range nothing measured, and an auto-merge would race the collector's own. The collector's state belongs in the console as a view instead — the [collector harbour](/docs/proposals/infra/agent-console/collector-harbour).
