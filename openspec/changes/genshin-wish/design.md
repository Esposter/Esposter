# Wish

This page builds on the [wish](../../specs/genshin/wish/design.md), whose pull, rates, guarantees, returns and screen are built, and on [inventory](../genshin-inventory/design.md), whose Fates bought with Primogems it offers. The rules draw from any banner handed to them; what is left is the banners themselves and the parts of the screen around them.

## Decisions

- **The pools are the game's, by id.** The standard wish's and the beginners' pools are permanent and published, listed by the game's ids in `services/wish/constants.ts` as the wiki's pool tables list them, each item's rarity read from the stat tables and its name from the world's names; `createBanners` builds the beginners' and the standard banners from them. An event banner's non-featured pool is the standard wish's, derived once and shared by every event banner, and only its promotional five-stars and featured four-stars are its own, read from the schedule. The [wish](../../specs/genshin/wish/design.md) page says which members wait on a later dump.
- **The beginners' wish is the wiki's.** Its five-stars and four-stars are its own list, its weapons the standard wish's three-stars alone, and Noelle its featured four-star, drawn on its eighth wish and never otherwise.
- **Names are the world's, by text id.** The stat tables carry each character's and weapon's `nameTextId`, and The names are published as the [game text](../../specs/genshin/game-text/design.md) page's one hosted record per language, never a `GameTextKey` each. `NameTextLoaderMap` reads one language's record on demand, so the host hands the world screen the reader's `language`, and the world screen reads its record beside the stat tables.
- **A new character joins the roster.** A character drawn for the first time is made by `createCharacter` and added to the player's characters in the order drawn; a duplicate only counts a copy and returns its Starglitter.
- **Event banners come from the wiki's banner pages.** Every banner is a page in the wiki's `Category:Wish` (about three hundred), each opening with a `{{Wish}}` template whose `type` (`Character Event`, `Weapon Event`, `Standard`, `Beginners' Wish`, `Chronicled`), `time_start`, `time_start_offset` and `time_end` give its kind and window, and whose Summary names its promotional five-stars in the `{{Wish Item|a; b}}` of its first line and its featured four-stars in every `{{Wish Item}}` of its second. Only the two event kinds are read, Chronicled staying out as below. The names are joined to ids through the English names chunk and the stat tables' `nameTextId`, and a name that joins none fails the run rather than dropping the item, and a name joining several records keeps the one its kit names (the playable character, the duplicate copies carrying the same name). The windows are read at the page's own offset, the Asia server's GMT+8, against the world's server clock (`serverClockOffsetMs`).
- **The schedule is one small file, not a chunk per language.** It holds ids and times only, so it is one record of the hosted game data, `wishSchedule/eventBanners` under a dataset of its own, fetched by key beside the stat tables.
- **Character Event Wish-2 is a second banner of the kind.** Two character event banners run side by side, sharing their kind's counters, so the screen's banners are keyed by banner rather than by kind. The wiki marks the second on its page with `type2`, but a page names one banner's items, so the second character banner of a window is its own page, read as the second of its kind by the banner's `kindNumber` (a page carrying `type2` is 2, else 1).
- **The history.** The game's Wish History page shows a year of wishes, lengthened from six months (the wiki's Wish/Change History), so the world keeps every draw's kind, item and time for a year, pruned at write, in the save's `wishHistory` slice, and the screen's History shows them in the game's columns.

## Scope and order

**Today:** the pull, the rates, the guarantees, Capturing Radiance, the Epitomized Path's rules, the returns and the screen on F3 are built, with the pool by rarity and the results in the game's order; the standard and the beginners' pools, `createBanners`, the stat tables' `nameTextId` and the names chunks are built.

**This adds, in order:**

```text
scripts/src/services/genshinAssets/wish/parseWishPage.ts
scripts/src/services/genshinAssets/wish/buildWishSchedule.ts
packages/genshin-world/src/services/wish/getOpenEventBanners.ts
```

1. **The event banners and Character Event Wish-2, from the wiki's schedule.**
   - **The reader.** A new `parseWishPage.ts` turns one banner page's wikitext into `{ kind, startTime, endTime, fiveStarNames, fourStarNames }`, and `buildWishSchedule.ts` beside it lists `Category:Wish` through the wiki API (`list=categorymembers&cmtitle=Category:Wish&cmlimit=500`) with the persona's `readWikiJson` (`genshin-persona/src/services/readWikiJson.ts`, as `fetchReferences` imports the persona's readers), reads each event banner's page with `readWikiPageText`, joins its names to ids and returns the `wishSchedule/eventBanners` record, which a `wish-schedule` subcommand of `genshin:assets` publishes, with `--dry-run`, as every builder does. `parseWishPage.test.ts` asserts the `Epitome Invocation/2026-09-23` page's opening (cut to its template and Summary) reads as a weapon event from 2026-09-23 11:00:00 to 2026-10-13 17:59:59 at GMT+8, featuring Beyond the Chrysalis and Hymn of the Maelstrom over five four-stars.
   - **The banners.** A new `getOpenEventBanners.ts` takes the schedule and the server's time and returns the event banners whose window holds it, and `createBanners` builds each of them beside its two permanent banners, its pool the standard wish's and its featured items from the schedule. `Banner` gains its `id`, the permanent banners' kind and an event banner's wiki page title, so two character event banners alongside are keyed apart as Wish and Wish-2. `getOpenEventBanners.test.ts` asserts a time inside a window returns its banners, two character banners alongside each other both, and a time between windows none. The world screen offers them beside the beginners' and the standard banners.
2. **The history.** Each draw is appended to the world's wish record as it is made, with its kind, item and time, and is pruned at write to the year's window, so a draw past it drops off. The save's ceiling counts a full history at `MAX_WISH_HISTORY_COUNT`. Backfill owed: every stored save gains `wishHistory: []` before the schema deploys, by a throwaway backfill per the backfills skill (not run here). The screen's History lists them in the game's columns, as the decision above says; the History panel itself is not built yet.

## What this does not propose

- **Chronicled Wish.** Its own page when its turn comes.
- **The wish animation.** The falling star, its colours and the reveal are measured and traced in the [recreation passes](../genshin-recreation-passes/design.md).
- **Buying anything with money.** No Genesis Crystals are sold, and Fates cost earned Primogems only.

## Key files

| File                                                          | Role after the change                           |
| :------------------------------------------------------------ | :---------------------------------------------- |
| `packages/genshin-world/src/components/Wish/Screen/Index.vue` | Gains a second character banner and the history |
| `packages/genshin-world/src/models/wish/Banner.ts`            | Gains each banner's own id and name             |

## Sources

- [Wish](https://genshin-impact.fandom.com/wiki/Wish), Genshin Impact Wiki: the banner kinds, Chronicled Wish, and the wish history kept for a year.

## Reference

- `wish-standard.png` — the Standard Wish banner screen at 1080 high, English PC client, no pull under way; the published stills are the banner art and the details popups, not the screen itself. On the wiki and YouTube, none found (searched 2026-10-11).
