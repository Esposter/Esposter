---
title: Wish
description: Proposal — what the wish still lacks: the banners' pools, named in the reader's language, a course charted on the Epitomized Path, Character Event Wish-2 beside the first, the wish history, and the falling star measured off the game. Fates stay earned, never bought with money.
model: claude-opus-5-5
---

# Wish

This page builds on the [wish](/docs/genshin/wish), whose pull, rates, guarantees, returns and screen are built, and on [inventory](/docs/proposals/genshin/inventory), whose Fates bought with Primogems it offers. The rules draw from any banner handed to them; what is left is the banners themselves and the parts of the screen around them.

## Decisions

- **The pools are the game's, by id.** The standard wish's and the beginners' pools are permanent and published, and each event banner's promotional and featured items are its own. A banner's characters and weapons are listed by the game's ids, each named from the game's text in the reader's language once the [characters](/docs/genshin/characters) and the weapons can be named, and the world offers its banners then.
- **Charting a course is the screen's.** On the weapon wish the Epitomized Path panel lists the two promotional weapons, and choosing one sets `chartedWeaponId` with its Fate Points at none, as the game's Chart Course does; cancelling clears both.
- **Character Event Wish-2 is a second banner of the kind.** Two character event banners run side by side, sharing their kind's counters, so the screen's banners are keyed by banner rather than by kind.
- **The history.** The game keeps a year of wishes per kind; the world keeps every draw's kind, item and time, and the screen's History shows them in the game's columns.

## Scope and order

**Today:** the pull, the rates, the guarantees, Capturing Radiance, the Epitomized Path's rules, the returns and the screen on F3 are built; the world offers no banner.

**This adds, in order:**

1. **The standard and beginners' pools**, once the world names characters and weapons.
2. **Charting a course** on the weapon wish.
3. **Character Event Wish-2** and the event banners.
4. **The history.**

## What this does not propose

- **Chronicled Wish.** Its own page when its turn comes.
- **The wish animation.** The falling star, its colours and the reveal are measured and traced in the [recreation passes](/docs/proposals/genshin/recreation-passes).
- **Buying anything with money.** No Genesis Crystals are sold, and Fates cost earned Primogems only.

## Key files

| File                                                          | Role after the change                                       |
| :------------------------------------------------------------ | :---------------------------------------------------------- |
| `packages/genshin-world/src/components/Wish/Screen/Index.vue` | Gains the course, a second character banner and the history |
| `packages/genshin-world/src/models/wish/Banner.ts`            | Gains each banner's own id and name                         |

## Sources

- [Wish](https://genshin-impact.fandom.com/wiki/Wish), Genshin Impact Wiki: the banner kinds, Chronicled Wish, and the wish history kept for a year.
- [Weapon Event Wish](https://genshin-impact.fandom.com/wiki/Weapon_Event_Wish), Genshin Impact Wiki: charting and cancelling a course on the Epitomized Path.
