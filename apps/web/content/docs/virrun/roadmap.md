---
title: Roadmap
description: Open work for virrun — prioritized checkboxes linking their proposals.
---

# Roadmap

Open work only. Everything else that was considered is trigger-gated in [deferred](/docs/virrun/deferred) or decided in [rejected](/docs/virrun/rejected) — grep both before adding an item.

## Later

- [ ] **WSL run registry — pair the owner pid with a process identity.** A registry entry is `<pid>.<marker>` and liveness is `process.kill(pid, 0)`, so a pid the OS reuses keeps that entry's corpse alive until the unrelated process exits; the next sweep then reaps it, which bounds the cost to a delay rather than a leak. Closing it means recording the owner's start time beside the pid and requiring both to match, and the start-time probe is platform-specific (`/proc/<pid>/stat`, `Get-Process`), so it waits for a second symptom.
