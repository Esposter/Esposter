---
title: Wish
description: Proposal — what the wish still lacks: a course charted on the Epitomized Path, Character Event Wish-2 beside the first and the event banners, the wish history, and the falling star measured off the game. Fates stay earned, never bought with money.
model: claude-opus-5-5
touches:
  [
    "packages/genshin-world/src/services/wish/**",
    "packages/genshin-world/src/generated/wishSchedule/**",
    "scripts/src/services/genshinAssets/wish/**",
  ]
---

# Wish

This page builds on the [wish](/docs/genshin/wish), whose pull, rates, guarantees, returns and screen are built, and on [inventory](/docs/proposals/genshin/inventory), whose Fates bought with Primogems it offers. The rules draw from any banner handed to them; what is left is the banners themselves and the parts of the screen around them.

## Decisions

- **The pools are the game's, by id.** The standard wish's and the beginners' pools are permanent and published, and each event banner's promotional and featured items are its own. A banner's characters and weapons are listed by the game's ids in `services/wish/constants.ts` as the wiki's pool tables list them, each item's rarity read from the stat tables and its name from the world's names; `createBanners` builds the beginners' and the standard banners from them. The [wish](/docs/genshin/wish) page says which members wait on a later dump.
- **The beginners' wish is the wiki's.** Its five-stars and four-stars are its own list, its weapons the standard wish's three-stars alone, and Noelle its featured four-star, drawn on its eighth wish and never otherwise.
- **Names are the world's, by text id.** The stat tables carry each character's and weapon's `nameTextId`, and `genshin:text names` writes every name they cite into the world's own chunk per language, as the quests' words are, never a `GameTextKey` each. `NameTextLoaderMap` imports one language's chunk on demand, so the host hands the world screen the reader's `language`, and the world screen loads its chunk beside the stat tables.
- **The results in the game's order.** A set's results are one card each, in the order the [wish](/docs/genshin/wish) page gives (`sortWishResults`); each card shows its name, its stars and what it returned.
- **The pool on the banner.** The open banner lists what it can draw by rarity, each rarity under its stars and its featured items first, as the game's details group them.
- **A new character joins the roster.** A character drawn for the first time is made by `createCharacter` and added to the player's characters in the order drawn; a duplicate only counts a copy and returns its Starglitter.
- **Event banners come from the wiki's banner pages.** Every banner is a page in the wiki's `Category:Wish` (about three hundred), each opening with a `{{Wish}}` template whose `type` (`Character Event`, `Weapon Event`, `Standard`, `Beginners' Wish`, `Chronicled`), `time_start`, `time_start_offset` and `time_end` give its kind and window, and whose Summary names its promotional five-stars in the `{{Wish Item|a; b}}` of its first line and its featured four-stars in every `{{Wish Item}}` of its second. Only the two event kinds are read, Chronicled staying out as below. The names are joined to ids through the English names chunk and the stat tables' `nameTextId`, and a name that joins none fails the run rather than dropping the item. The windows are read at the page's own offset, the Asia server's GMT+8, against the world's server clock (`serverClockOffsetMs`).
- **The schedule is one small file, not a chunk per language.** It holds ids and times only, so it is written once, loaded by one dynamic import beside the stat tables, and moves to the static-data host once its pending design lands.
- **Charting a course is the screen's.** On the weapon wish the Epitomized Path panel lists the two promotional weapons, and choosing one sets `chartedWeaponId` with its Fate Points at none, as the game's Chart Course does; cancelling clears both.
- **Character Event Wish-2 is a second banner of the kind.** Two character event banners run side by side, sharing their kind's counters, so the screen's banners are keyed by banner rather than by kind.
- **The history.** The game keeps a year of wishes per kind; the world keeps every draw's kind, item and time, and the screen's History shows them in the game's columns.

## Scope and order

**Today:** the pull, the rates, the guarantees, Capturing Radiance, the Epitomized Path's rules, the returns and the screen on F3 are built, with the pool by rarity and the results in the game's order; the standard and the beginners' pools, `createBanners`, the stat tables' `nameTextId` and the names chunks are built.

**This adds, in order:**

```text
scripts/src/services/genshinAssets/wish/parseWishPage.ts
packages/genshin-world/src/generated/wishSchedule/eventBanners.json
packages/genshin-world/src/services/wish/getOpenEventBanners.ts
```

1. **The event banners and Character Event Wish-2, from the wiki's schedule.**
   - **The reader.** A new `parseWishPage.ts` turns one banner page's wikitext into `{ kind, startTime, endTime, fiveStarNames, fourStarNames }`, and `writeWishSchedule.ts` beside it lists `Category:Wish` through the wiki API (`list=categorymembers&cmtitle=Category:Wish&cmlimit=500`) with the persona's `readWikiJson` (`genshin-persona/src/services/readWikiJson.ts`, as `fetchReferences` imports the persona's readers), reads each event banner's page with `readWikiPageText`, joins its names to ids and writes `eventBanners.json`. A `wish-schedule` subcommand of `genshin:assets` runs it. `parseWishPage.test.ts` asserts the `Epitome Invocation/2026-09-23` page's opening (cut to its template and Summary) reads as a weapon event from 2026-09-23 11:00:00 to 2026-10-13 17:59:59 at GMT+8, featuring Beyond the Chrysalis and Hymn of the Maelstrom over five four-stars.
   - **The banners.** A new `getOpenEventBanners.ts` takes the schedule and the server's time and returns the event banners whose window holds it, built as `createBanners` builds its two, and `Banner` gains its `id`, the wiki page's title, so two character event banners alongside are keyed apart as Wish and Wish-2. `getOpenEventBanners.test.ts` asserts a time inside a window returns its banners, two character banners alongside each other both, and a time between windows none. The world screen offers them beside the beginners' and the standard banners.
2. **Charting a course** on the weapon wish, now that the open weapon event banner names its two promotional weapons.
3. **The history.**

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
