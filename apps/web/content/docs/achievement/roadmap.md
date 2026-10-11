---
title: Roadmap
description: Open work for achievements — prioritized checkboxes linking their proposals.
---

# Roadmap

Open work only. Decided ideas live in [rejected](/docs/achievement/rejected) — check it before adding an item. Per-product achievement content (the [clicker](/docs/clicker) and [dungeons](/docs/dungeons) milestones) is owned by those areas, not tracked here.

## Next

- [ ] **The time-of-day achievements read the reader's own clock.** `isWithinTime` reads `Temporal.Now` on the server, so an early-bird or late-night window is judged in the server's time zone (UTC in production): a reader in Sydney posting at six in the morning misses the early-bird window, and earns it in the late afternoon. It needs the reader's IANA time zone where the trigger runs, sent with the triggering call the way `CompleteFollowUpInput` takes one, or stored on the user, then the window read in it.
- [ ] [Achievement rarity](/docs/proposals/achievement/achievement-rarity) — each card shows the share of users who have unlocked it, and the gallery sorts rarest first
