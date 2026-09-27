---
title: Console session archive
description: Archiving agent console sessions and filtering or grouping the sessions tab by status and project, as the Code tab's sidebar does — deferred until the sessions tab holds more than a person scans at a glance.
---

# Console Session Archive

**What it was.** The Code tab's sidebar controls "filter sessions by status, project, or environment, and … group sessions by project". Each session has an archive icon, and sessions can archive themselves "when their pull request merges or closes" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)).

**Why deferred.** The sessions tab lists the most recent sessions newest first, each with its repository under its title and a state colour while it runs or waits. That answers "which session was I in" while the list fits a glance, and archive and filters are machinery for a list that no longer does. The automatic half keys on pull requests, which the review collector owns here ([console pull request bar](/docs/infra/rejected/console-pull-request-bar)). [Session titles](/docs/proposals/infra/agent-console/session-titles) is the cheaper fix for sessions that are hard to tell apart.

**Revisit when:** the workflow comparison records scrolling the sessions tab, or passing over finished sessions, to find one as a recurring cost.

**Cheaper interim:** the newest-first order, the repository shown on every row, and a session renamed to say what it is for.
