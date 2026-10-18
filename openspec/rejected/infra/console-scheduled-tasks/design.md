# Console Scheduled Tasks

The Code tab's local scheduled tasks "start a new session automatically at a time and frequency you choose". The app checks the schedule every minute while it is open, beside cloud routines and a session's own `/loop` ([Claude Code desktop — scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks)).

**Why not:** Claude Code already has both halves. `/loop` repeats a prompt inside a session, and the console's palette runs it like any other command. Routines run work in the cloud with no machine on at all. A scheduler in the host would be a third, owned here, and a timer is the shape this repository turns down wherever a native trigger exists ([no polling](../../../specs/architecture/no-polling/design.md)). It would also start turns nobody is watching, out of the same subscription limits the day's work runs under, which is the ground the [SDK-driven companion](../sdk-driven-companion/design.md) was rejected on.
