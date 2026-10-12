---
title: Console pull request bar
description: A pull request opened from an agent console session, with a CI status bar, auto-fix and auto-merge, as the Code tab offers — rejected, because this repository reaches `main` through the review, never through a session's pull request.
---

# Console Pull Request Bar

The Code tab's pull request flow: "after you open a pull request, a CI status bar appears in the session", with auto-fix that "attempts to fix failing CI checks" and auto-merge "once all checks pass" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why not:** In this repository a session never opens a pull request. It pushes `ai/queue`, and the [review](/docs/infra/review) reads each window of commits and fast-forwards `main` to its end. A session's own pull request would be a second way onto `main` that no review read, and an auto-merge would race the review's own fast-forward.
