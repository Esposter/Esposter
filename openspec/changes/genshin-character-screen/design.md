# Character screen

This page builds on the [character screen](../../specs/genshin/character-screen/design.md) as built, whose frame lists the player's characters and six tabs and whose Attributes, Weapons, Artifacts, Constellation and Talents panels are built beside it ([character attributes](../../specs/genshin/character-attributes/design.md) supplies their sums). It also builds on [characters](../genshin-characters/design.md), whose model stands in the screen's middle.

## Decisions

- **Measured like every screen.** The screen's references are recordings of the English client's character screen at 1080 high, published ones first; its frame's places, sizes and colours come from its rect tree and its passes, and every value marked provisional in its styles is replaced by a measured one.
- **The screen's block is found by its page's Animator.** The asset index holds `AvatarInfoDialogV2`, an Animator in `00/04803507.blk`, beside `AvatarInfoDescDialog`, the Details dialog, and `AvatarLevelUpDialog`; the screen's root is the page's GameObject of the same name, as `LoginMainPage` is the login's. A tree whose nodes name no tabs (the game's `Property`, `Weapon`, `Reliquary`, `Talent`, `Skill` or `Fetter`) is the wrong page, and the step goes back as a miss naming what it held.
- **Details is the game's `AvatarInfoDescDialog`**, laid out by its own tree from the same block. It adds the attributes the summary lacks: Incoming Healing Bonus, CD Reduction (`FIGHT_PROP_SKILL_CD_MINUS_RATIO`, which `Attribute` gains), Shield Strength and each element's RES, which `Attribute` already holds. It opens every attribute past the summary, in the game's three groups: Base Stats, Advanced Stats and Elemental Type. The RES rows sit under Elemental Type, as the game text gives the resistances no title of their own.
- **The element's nebula.** Each element's background is its tint at the centre and at the edge, held in `ElementNebulaMap`: Geo's sampled from `session-2.mp4` at 156 seconds, and the other six measured off a clip of each element with the clip id and second beside the value. The clips are tutorials, none a current-version PC character screen, so the six are provisional until a current recording measures them. The moving layers (lightning, bubbles, snow, ash, wind, leaves, rocks) are not built; the tint is the static nebula behind them.
- **The chosen character stands in the middle**, its official model in the game's character shader, over a background that moves with its element: lightning, water bubbles, snow, ash, wind, leaves or rocks.
- **The element's mark at the top left**, the Vision of the character's region and element as the game draws it, traced into a path of our own as the interface's glyphs are; the Traveler's is their alignment's. The path is `ElementMarkPathMap`, already traced off the wiki's render, drawn just left of the name at a provisional place and size (36 units square, 168 from the left, 29 from the top) until the parity pass measures them off the frame.
- **The Profile tab's voice-over list and namecard view** wait with the model's terms ([characters](../genshin-characters/design.md)); its stories are built ([character profile](../../specs/genshin/character-profile/design.md)).
- **Levelling up and ascending.** Level Up spends Character EXP materials; Ascend, at a phase's cap, spends its materials and Mora once the Adventure Rank allows it (15, 25, 30, 35, 40 and 50). Each phase's materials come from the game's promotion table, as its attributes do. Level Up raises one level a press from the wiki's Character EXP table, provisional until the game's table is published, taking the largest materials first and paying Mora at one for each five EXP.
- **Levels 95 and 100** are reached past level 90 with Masterless Stella Fortuna, the level rising at once to the next cap, with the curves the tables already carry to level 100. Their costs, one and then two Masterless Stella Fortuna, are the wiki's Character page's, provisional until the game's table is published.
- **The Traveler's own bonuses.** Resonating with a Statue of The Seven gives the Traveler that element. Once Welkin Moon's Homecoming is done, each element it holds adds a bonus: Anemo and Pyro from the start, the others from their resonance. The wiki names step 7 of that quest as the gate, which the published quest data cannot map to a step id, so the gate is the quest's completion (main quest 6017), one step later than the game; the values are the wiki's and stay provisional until the game's table is published. Quests add a few points of base ATK, HP and Elemental Mastery.

## Scope

**Today:** the frame, the six tabs in the game's words, the Attributes tab's level and grouped attributes, the Weapons, Artifacts, Constellation and Talents panels, the Profile tab's stories, and the Traveler alone with the Dull Blade.

**This adds, in order:**

```text
scripts/src/services/genshinAssets/fit/fitCharacterScreen.ts
packages/genshin-world/src/data/character/interfaceRects.json
```

1. **The screen's tree, exported and fitted.** `DerivedAssetComponent` gains `Character = "character"`, and `DerivedAssetComponentMap` its entry: `{ interface: { anchorPattern: "^AvatarInfoDialogV2$", root: "AvatarInfoDialogV2" }, roots: [], screen: "CharacterScreen" }`. `pnpm -C scripts genshin:assets interface character` exports the tree into `~/Esposter/genshin-parity/extracted/character/interface/interface.json` and prints it; the builder checks the tabs' nodes in it. A new `fitCharacterScreen.ts`, keyed in `DerivedAssetFitMap`, returns the `character/interfaceRects` record through `fitInterfaceRects`, as `fitLoginScene`'s `interfaceRects` does, under a `GameDataset` member of its own, and `pnpm -C scripts genshin:assets fit character --only interfaceRects` publishes it. `fitInterfaceRects` is already tested, so no new test is owed; the published record, holding the tabs' and the panel's paths, is the proof.
2. **The look, placed by the fitted rects.** `Character/Screen` hands `CharacterMenu` its rects, which nests a `GameRect` per piece in the tree's order, and every value marked provisional gives way to the tree's. `pnpm -C scripts genshin:parity compare character-attributes` and the four other tabs' references must not rise from the scores the [character screen](../../specs/genshin/character-screen/design.md) page holds, and the comparison is queued for the user's eyes.
3. **The character in the middle and the element's mark.**
4. **Details**, from `AvatarInfoDescDialog`'s tree, over the [character attributes](../../specs/genshin/character-attributes/design.md)' tables.
5. **Level Up and Ascend**, on the [inventory](../archive/2026-10-18-genshin-inventory/design.md)'s materials.
6. **The Profile tab's voice-over list and namecard view**, then levels 95 and 100 and the Traveler's bonuses.

## Key files

| File                                                                      | Role                                                       |
| :------------------------------------------------------------------------ | :--------------------------------------------------------- |
| `packages/genshin-interface/src/components/CharacterMenu/Index.vue`       | The frame, measured                                        |
| `packages/genshin-world/src/components/Character/Screen/Index.vue`        | The screen, with the character in the middle and every tab |
| `packages/genshin-world/src/components/Character/AttributeList/Index.vue` | The summary, with Details beside it                        |
| `packages/genshin-text/src/models/GameTextKey.ts`                         | Gains every label of the panels                            |
| `scripts/src/services/genshinAssets/stats/buildStatTables.ts`             | Gains the promotion materials and the levels' EXP          |

## Sources

- [Character Menu](https://genshin-impact.fandom.com/wiki/Character/Menu), Genshin Impact Wiki: the list, the element's mark and background, Details, Level Up and Ascend.
- [Character](https://genshin-impact.fandom.com/wiki/Character), Genshin Impact Wiki: the ascension phases, their caps and Adventure Ranks, and levels 95 and 100 with Masterless Stella Fortuna.
- [Traveler](https://genshin-impact.fandom.com/wiki/Traveler), Genshin Impact Wiki: the Traveler's quest bonuses and their bonus per element resonated with.

## Reference

- `menu-character.mkv` — 30 seconds at most, the character screen at 60 frames a second: the character strip scrolled past its first portrait, a portrait pressed, a tab hovered and pressed, and the way back. Its five tabs in turn, Attributes to Talents, are already in `session-2.mp4` from about 154 seconds (the open tab's pill sliding at 157 to 159 seconds), so the clip does not repeat them; Profile is not in that recording, and `character-profile.png` below holds it. `menu-character.mkv` searched 2026-10-11 on the wiki and YouTube, none found; `character-profile.png` searched 2026-10-11 on the wiki and YouTube, none found.
- `character-profile.png` — the Profile tab on the English PC client at 21:9, the frame the Attributes reference is cut from (`session-2.mp4` at 154 seconds), its tab column and panel in view and the red alert on Profile if it is lit, a still of the settled tab.
- `character-details.mkv` — Xilonen's Attributes tab with Details pressed, the advanced and elemental lists in view, then Details pressed again, 20 seconds at most at 60 frames a second, on the 21:9 frame's client. Its open motion and the list's layout are owed; nothing published shows it. On the wiki and YouTube, none found (searched 2026-10-11).
- `character-attributes-1080.png` — the Attributes tab on the English PC client at 1080 high, the chosen character's panel and the portraits in view, to check the panel's place at 16:9 against the 21:9 frame it is measured from. On the wiki and YouTube, none found (searched 2026-10-11).
