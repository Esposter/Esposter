---
title: Console cross-session messages
description: One agent console session reading another's work and sending it a message, as the Code tab's sessions can — deferred until parallel sessions in the console need to coordinate rather than work apart.
---

# Console Cross-Session Messages

**What it was.** The Code tab's cross-session communication: "Claude can list your other Code tab sessions, read what each has been doing, and send messages between them" ([Claude Code desktop](https://code.claude.com/docs/en/desktop)). In the console it would be a tool the host gives every session, answered from the other sessions' event logs.

**Why deferred.** The sessions the console runs in parallel work apart by design: in the shared checkout each commits its own pathspecs, and what one needs from another it reads from git once the other has committed. A tool that reads another session's log is a new way for one session's context to fill with another's work, and nothing yet needs it.

**Revisit when:** the workflow comparison records a person relaying between two console sessions by hand — copying what one found into the other — often enough to be a cost.

**Cheaper interim:** the person copies the line across; git carries what was committed.
