---
title: Console scheduled tasks
description: Prompts the agent console runs on a schedule, starting sessions unattended, as the Code tab's Routines page does — rejected, because Claude Code already schedules work inside and outside a session, and a host firing turns on a timer spends the limits the work runs on.
---

# Console Scheduled Tasks

The Code tab's local scheduled tasks "start a new session automatically at a time and frequency you choose". The app checks the schedule every minute while it is open, beside cloud routines and a session's own `/loop` ([Claude Code desktop — scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)).

**Why not:** Claude Code already has both halves. `/loop` repeats a prompt inside a session, and the console's palette runs it like any other command. Routines run work in the cloud with no machine on at all. A scheduler in the host would be a third, owned here, and a timer is the shape this repository turns down wherever a native trigger exists ([no polling](/docs/architecture/no-polling)). It would also start turns nobody is watching, out of the same subscription limits the day's work runs under, which is the ground the [SDK-driven companion](/docs/infra/rejected/sdk-driven-companion) was rejected on.
