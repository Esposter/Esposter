---
title: Achievements
description: The cross-product achievement system — data-driven definitions, a tRPC-path unlock plugin, and live unlock notifications.
---

# Achievements

Achievements reward activity across every Esposter product — posts, likes, messages, rooms, emails, surveys, tables, flowcharts, webpages, and the games — from one system: definitions are data, unlocking is a single tRPC plugin, and unlocks toast in real time. The gallery at `/achievements` shows every achievement by category with progress.

## Key concepts

- **Definitions are constant maps** — one `<Category>AchievementDefinitionMap` per product under `shared/services/achievement/definitions/`, merged into `AchievementDefinitionMap`. A definition is `{ triggerPath, amount, incrementAmount, condition?, isHidden?, category, icon, points, description }`, where `triggerPath` is a **typed** tRPC path (`TRPCPaths`), so a renamed procedure breaks the definition at compile time.
- **Progress is a counter** — `userAchievements(userId, achievementId, amount, unlockedAt)`; each matching trigger adds `incrementAmount` until `amount` is reached, which stamps `unlockedAt`. One-shot achievements are just `amount: 1`.
- **Conditions** — an optional predicate tree evaluated against the mutation's raw input: `Property` (dot-path + binary operators / regex / palindrome / custom `Operation` callback), `Time` windows, composed with `And`/`Or`. This is what powers input-dependent achievements ("50 comments under 50 characters") and save-payload milestones ([clicker](/docs/proposals/clicker/milestone-achievements), [dungeons](/docs/proposals/dungeons/milestone-achievements) proposals).
- **Hidden achievements** — `isHidden` definitions read as `???` until the viewer unlocks them.

See [unlock pipeline](/docs/achievements/unlock-pipeline) for how a mutation becomes a toast.

Open work: [roadmap](/docs/achievements/roadmap). Decided ideas: [rejected](/docs/achievements/rejected).
