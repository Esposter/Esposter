# Spiral Abyss

The Spiral Abyss is the game's standing combat challenge: a domain at Musk Reef, reached through the wormhole off Cape Oath, of twelve floors with three chambers each, cleared against the clock for stars and Primogems. Its first eight floors, the Abyss Corridor, are cleared once; its last four, the Abyssal Moon Spire, change their enemies and reset every month. Its rules are built as the [Spiral Abyss page](../../specs/genshin/spiral-abyss/design.md) records, read from the game's own tower tables. What remains is how a chamber is fought and entered, and it is fought with the [character kits](../genshin-character-kits/design.md) and the [party](../genshin-party/design.md)'s teams, entered as a [domain](../genshin-domains/design.md) is, so this page waits on those too.

## Decisions

- **A chamber's waves are camps of its scene.** Each half's enemies are the table's list for that half, placed as the enemy camps of the chamber's own domain scene, and a half is defeated when its camps are. A two-team chamber with no second list, as the monolith chambers have none, takes its second half's enemies from its scene the same way.
- **The chamber's end is carried on.** Each character's health and energy at the moment a chamber is cleared are what they start the next chamber with, as the game records them. The party holds them between chambers, so nothing resets them.
- **A reward id is its reward row's items, written beside the floors' rewards.** The tower table's rewards name 232 reward ids, each resolved through the shared reward reader to its items (floor one's nine-star reward is 100 Primogems and 25,000 Mora), and the items go into the existing rewards slice rather than a new one. A claim gives each item as a pick up does, every wallet currency into the wallet and the rest into the bag, refused whole when the bag has no room for all of it, as an expedition's claim is.
- **The Moon Spire's blessing is a module over the kits' shared effects.** Each period names its blessing by a text hash and an icon, and its effect is written as a module once a source gives it.

## Scope and order

**Today:** the Abyss's floors, chambers, clock, halves, monolith, stars, unlocks, rewards and periods are built as pure rules, so the [as-built page](../../specs/genshin/spiral-abyss/design.md) holds them. Nothing enters a chamber, fights one, or shows the Abyss.

**This adds, in order:**

1. **The rewards' items.** `buildSpiralAbyss.ts` builds the `spiralAbyss/rewards` record as `{ floorRewards, rewardItems }`: the floor rewards as now, and every reward id they name resolved through `readRewardMap` and `toRewardItems` (`scripts/src/services/genshinAssets/rewards/`) to its items, each `{ count, itemId }`, keyed by reward id. `readAbyssFloorRewards.ts` parses the new shape. A new `services/spiralAbyss/claimAbyssRewards.ts` takes a clear's `givenRewardIds`, the items map, the bag, the wallet and the names, and gives every item through `pickUpDroppedItem`, returning undefined, with nothing changed, when any item overflows the bag. Tests: `claimAbyssRewards.test.ts` (a reward of Primogems and Mora lands both in the wallet and nothing in the bag, a material goes into the bag, and a bag with no room refuses the whole claim).
2. **The chambers' scenes and their enemy camps**, with each half's wave defeated by its camps, once the domain scene is derived ([scene derivation](../../specs/genshin/scene-derivation/design.md)).
3. **The screen and the chamber's loop**: entering a chamber with the party set, the clock run over real play, a half advanced on its last enemy defeated, and the health and energy carried into the next chamber.
4. **The blessings**: the Moon Spire's blessing of each period, and the Corridor's blessing choices, each written once its effect is read from a source.
5. **The wormhole at Cape Oath**, once Musk Reef's scene is derived.

## Data and measures

- **Read from the wiki:** what each period's blessing does, where its description leaves it open, and which blessings the Corridor's chambers offer. The wiki refused the read when the rules were built, so these wait on a source that answers.
- **Read from the game's tables:** each chamber's domain scene, and `TowerBuffExcelConfigData` for the Corridor's blessings, which the rules build does not yet read.
- **Measured:** the chamber's clock and the two-half carry, off recordings, as the [roadmap](../genshin-roadmap/tasks.md)'s References sought list states. The Abyss's opening rank is the wiki's, not yet measured.

## Key files

| File                                                            | Role after the change                                          |
| :-------------------------------------------------------------- | :------------------------------------------------------------- |
| `packages/genshin-world/src/components/World/Session/Index.vue` | Enters the Abyss's chambers and returns to the world           |
| `packages/genshin-world/src/models/enemy/EnemyCamp.ts`          | A chamber's waves, as camps of its scene                       |
| `packages/genshin-world/src/models/inventory/Wallet.ts`         | The Primogems the stars' rewards give, resolved from their ids |

## Sources

- [Spiral Abyss](https://genshin-impact.fandom.com/wiki/Spiral_Abyss), Genshin Impact Wiki: Musk Reef and its wormhole, the twelve floors of three chambers, the monolith, the two-team chambers, the reset on the 16th, and the enemies changing by version. Its blessings' wording is what the blessing modules wait on.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the tower tables the rules are read from, and the domain scenes the chambers' camps are placed in.

## Reference

- `spiral-abyss-chamber.mkv` — a floor one chamber of the Abyss Corridor cleared with its clock in view, the time left and the stars shown at the clear, three minutes at most; the clock's length is measured from it, and `ABYSS_SHORT_CLOCK_SECONDS` is settled by it, as the star marks are checked against the clock left. Partly found 2026-10-11: https://www.youtube.com/watch?v=Osaylns8nyk at 130–188 s (`captures/yt-Osaylns8nyk-spiral-abyss-chamber.mp4`); still sought: a legible clock at the clear, read at full size, so the clock length and the star marks against time left are not confirmed.
- `spiral-abyss-two-halves.mkv` — a floor five chamber of the Abyss Corridor, its first half cleared with the clock in view and its second half started, through to the clear, ten minutes at most; whether the second half keeps the first half's clock is read from it, which `checkIsAbyssChallengeFailed` and `stepAbyssChallenge` assume. On the wiki and YouTube, none found (searched 2026-10-11).
