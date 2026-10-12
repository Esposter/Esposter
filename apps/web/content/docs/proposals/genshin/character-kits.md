---
title: Character kits
description: Proposal — the kit work still unbuilt: the Traveler's skill and burst taking the element its statue gives, the passives and constellations the modules leave out, the five swap watchers, Hu Tao's Spirit Soother heal, Nefer's kit and the world's entry back under its size ceiling, all on the framework the built kits run on.
model: claude-opus-5-5
needs: [game-exports]
touches: ["packages/genshin-world/src/services/kit/**"]
---

# Character kits

Every character on the [character kits](/docs/genshin/kits) index has a module of its own, and the framework those modules run on is built. What is left is the element a statue gives the Traveler, the passives and constellations the modules leave out, the five swap watchers older modules keep, Hu Tao's Spirit Soother heal under half HP with her Constellations 4 and 6, Nefer's kit, which gcsim has no folder for, and the world's entry back under its size ceiling. It comes before the rest of the game's systems that act through a kit, such as talents, constellations, weapons' and artifacts' effects, and every challenge after them. It builds on [character attributes](/docs/genshin/character-attributes), whose sums price a hit, and on the [character controller](/docs/genshin/character-controller), whose body a kit acts from.

## Decisions

- **The Traveler's skill and burst take the element its statue gives.** Once the Traveler resonates with a Statue of The Seven, its skill and burst deal that element at 1U, which the placeholders do not yet do. The table has one set per element form, so the statue's element picks the set and its cooldowns and energy cost; that picking waits for the [statues page](/docs/proposals/genshin/statues-of-the-seven), which holds the resonance. Until then the Traveler has no element, and its placeholders deal none. The skill's particles are the wiki's, not the table's, as the kits index records.
- **Passives are written with their character's module.** Each unbuilt passive is added to its character's module and opened by the ascension phase its table names, so a passive adds to its kit without a change to the framework.
- **A shared effect is built by the first module that needs it, never before.** The Traveler's kit uses a hit, and a heal and a hit's element sit with the party's damage.
- **Targeting's further coefficients wait.** The view, current-target and priority coefficients wait for a camera's frustum, a kept target and a boss.

## Scope and order

**Today:** a character without a module of its own fights with the Traveler's kit until one is written, as `readCharacterKit` falls back to the Traveler's record and `createTravelerKitBehaviour`.

**This adds, in order:**

1. **The Traveler's skill and burst** for the element a statue gives them, once the [statues page](/docs/proposals/genshin/statues-of-the-seven) holds the resonance, then one module for each playable character not yet on the [character kits](/docs/genshin/kits) index.
2. **Passives**, each written with its character's module and opened by the phase its table names.
3. **Hu Tao's Spirit Soother heal** under half HP, with her Constellations 4 and 6 and Blood Blossom, once a kit's actions can read party HP and an enemy's status at their start.
4. **The swap watchers onto the kit events.** Klee's Sparks 'n' Splash, Xiao's Bane of All Evil, Ningguang's Star Jades and Razor's Wolf Within each end through a field that ticks on every step to see whether their character still holds the field, built before the [kit events](/docs/genshin/kits); each moves onto `CharacterSwapped`. Xingqiu's Raincutter, set going as a normal attack starts, moves onto the same channel once the delay gcsim gives each character's attack before it is read.
5. **The rolls a hit's strike can now draw.** Klee's Explosive Spark at 50% and her Chained Reactions, and Yelan's Breakthrough Barb at 34% on each Lingering Lifeline hit, each roll from the world's random source as the hit strikes, which `KitContext.random` reaches.
6. **Nefer's kit and its overlay.** gcsim has no folder for her at v2.47.2, so her record is built from the tables' groups 12231, 12232 and 12239 and the wiki, its frames, hitmarks and areas provisional until a recording measures them.

## Data and measures

- **Still to read:** each talent's name and description by their text ids. The multipliers are read from `ProudSkillExcelConfigData` already.
- **Still to choose:** the Traveler's set by the element a statue gives. The Anemo set is read by default (`TRAVELER_DEFAULT_ELEMENT`, not yet in the code), and choosing another waits on the [statues page](/docs/proposals/genshin/statues-of-the-seven).
- **Still to find:** a source for each strike's, the charged attack's and the plunge collision's poise damage. gcsim's Anemo attack file has none.
- **Measured:** the least height a plunge starts from is what the wiki does not give, so it waits on the References sought list's `world-attacks.mkv`. Until then it is a provisional constant with its character's module.
- **Wanderer's normal attack.** gcsim sets its hitmarks and frames in `init()` (`attackReleaseNormal`, `attackFramesNormal`), which the builder does not evaluate, so the strikes have no source for their hitmarks, frames or element.
- **Mualani's charged attack.** gcsim's hitmark is `shortChargeHitmark` plus a windup that depends on the state the charge starts from, which the builder does not read, so the charge has no hitmark source or element.
- **Klee's normal attacks.** Her record holds zero hits per strike, where gcsim's `attackHitmarks` gives three, so her normal attacks deal nothing until the overlay's count is read against them.
- **Lyney's Prop Arrow is not aimed.** The kit's charged attack lost its `isAimed` flag when the record replaced the hand-written kit: `lyney.json` holds no `chargedAttack.isAimed`, because the gcsim candidate that sets it (`addGcsimChargedAttackCandidates`) is emitted only when gcsim cites an aimed hitmark for Lyney, so the body turns to its target instead of the camera's aim while the aim is held. Restoring it is a decision on the data pipeline and its publish, which the record's lock makes an explicit act.
- **Venti's and Tighnari's charged shots are not aimed.** Like Lyney's, their hand-written kits set `isAimed` on the charged attack and the records that replaced them hold no `chargedAttack.isAimed` (`venti.json`, `tighnari.json`), so the body turns to its target instead of the camera's aim while the aim is held. Tartaglia's record holds the flag, so the fix is the same publish that restores Lyney's, not a per-kit code change.
- **Xinyan's shield DoT reads its multiplier by position.** Rave's DoT hit takes its talent multiplier from the Constellation 2 pulse at the index the Riff Revolution DoT hits end on, a lookup into a sibling list, so reordering or adding a Riff Revolution DoT hit silently changes which multiplier the shield uses. The record should hold the multiplier on `hitFields.shieldDot`, which needs the record generator to emit it and a publish, so the module reads it by name.
- **Amber's Fiery Rain arrows are radius 2, where her kit page prices them at 4.** The record holds each arrow's area at radius 2 and `Unsourced` (`cc8796d10b`), the base arrows and the Every Arrow Finds Its Target arrows alike, so Ascension 1's 30% widening no longer shows in `amber.json`. The [Amber kit](/docs/genshin/kits/amber) states an arrow is priced at 4 round the body and widened by 30%, which would be radius 4 and 5.2. Choosing between them is a design decision, and either one publishes the `hits.fieryRainArrows.*.area` and `hits.everyArrowFindsItsTargetFieryRainArrows.*.area` entries through the `kits` record, a republish that `kitOverlays.test.ts` holds the overlay to.
- **Periodic discharge schedules.** Seven modules (Ineffa, Xingqiu, Yae Miko, Gorou, Fischl, Diluc and Durin) each build their hits from a count and an interval inline, since the shared periodic-hits helper went with the records that now hold the lists. Ineffa's two discharge lists differ by the spawn each action gives Birgitta, so the choice is whether each record holds every spawn's list or a shared helper builds them again; that choice spans seven kits.
- **Go's float division.** The constant evaluator reads a number by its value alone, so a division of two whole-valued operands truncates, as `float64(3) / 2` and `3.0 / 2` do, where Go gives 1.5. Honouring it means a float flag carried through the parsed literals, the conversions and `GoValue`, which is a choice of value model for the kit reader, not a fix to one line.

## What this does not propose

- **Talent levels and constellations.** The kit reads its talent levels and constellations; raising them is the [talents](/docs/proposals/genshin/talents) and [constellations](/docs/proposals/genshin/constellations) pages'.
- **The effects drawn.** A slash's trail, a field's circle and a burst's animation are the character's motion and the world's effects, matched in the [recreation passes](/docs/proposals/genshin/recreation-passes).

## Key files

| File                                                     | Role                                                                                                   |
| :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/travelerKit.ts` | `createTravelerKitBehaviour`, the Traveler's behaviour and the fallback for a character with no module |

New files, as the modules come:

```text
packages/genshin-world/src/services/kit/characters/
```

## Sources

- [Talent](https://genshin-impact.fandom.com/wiki/Talent), Genshin Impact Wiki: the ascension and passive talents, and the talent level multipliers.
- [Elemental Skill](https://genshin-impact.fandom.com/wiki/Elemental_Skill) and [Elemental Burst](https://genshin-impact.fandom.com/wiki/Elemental_Burst), Genshin Impact Wiki: the skill's cooldown, charges and press or hold, and the burst's energy cost and cooldown.
- [Hu Tao](https://genshin-impact.fandom.com/wiki/Hu_Tao), Genshin Impact Wiki: Spirit Soother's heal under half HP, Blood Blossom, and her Constellations 4 and 6.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump, the table the talent names and descriptions still to read come from.

## Reference

- `bennett-charge-levels.mkv` — Bennett's Passion Overload held from the press through each Charge Level and released, 15 seconds at most; the seconds held that reach Charge Level 1 and Charge Level 2, the 0.5 and 1 seconds the kit does not hold yet (`packages/genshin-world/src/services/kit/characters/bennettKit.ts`), are measured from it. Replaced by the animation clips: `genshin:assets timings` prints the second each animation of the skill's holds starts at, and `genshin:assets clips` samples its curves, once the character's animation blocks are extracted ([derived assets](/docs/genshin/derived-assets)). On the wiki and YouTube, none found (searched 2026-10-11).
- `lisa-violet-arc-hold.mkv` — Lisa's Violet Arc held from the press until it is released, 8 seconds at most; the seconds the hold takes to charge in full, the 1.9 seconds the kit does not hold yet (`packages/genshin-world/src/services/kit/characters/lisaKit.ts`), are measured from it. Replaced by the animation clips: `genshin:assets timings` prints the second each animation of the skill's holds starts at, and `genshin:assets clips` samples its curves, once the character's animation blocks are extracted ([derived assets](/docs/genshin/derived-assets)). On the wiki and YouTube, none found (searched 2026-10-11).
- `razor-claw-and-thunder.mkv` — Razor's Claw and Thunder held from the press until its hold plays, then his charged attack held through a spin and its final slash, 15 seconds at most; the seconds held that reach the hold, the 0.5 seconds the kit does not hold yet, and the charged attack's hitmarks and length, which the kit reads from its data and holds no length for yet (`packages/genshin-world/src/services/kit/characters/razorKit.ts`), are measured from it. Replaced by the animation clips: `genshin:assets timings` prints the second each animation of the skill's hold and the charged attack starts at, and `genshin:assets clips` samples its curves, once the character's animation blocks are extracted ([derived assets](/docs/genshin/derived-assets)). Partly found 2026-10-11: https://www.youtube.com/watch?v=9MzwdBrvdHc at 15–28 s (`captures/yt-9MzwdBrvdHc-razor-claw-and-thunder.mp4`); still sought: the release of the hold and the charged attack spin with its final slash (its length and hitmarks); the sheet covers only the hold start.
- `venti-skyward-sonnet.mkv` — Venti's Skyward Sonnet held from the press until its hold plays, 10 seconds at most; the seconds held that reach the hold, the 0.5 seconds the kit does not hold yet (`packages/genshin-world/src/services/kit/characters/ventiKit.ts`), are measured from it. Replaced by the animation clips: `genshin:assets timings` prints the second each animation of the skill's hold starts at, and `genshin:assets clips` samples its curves, once the character's animation blocks are extracted ([derived assets](/docs/genshin/derived-assets)). On the wiki and YouTube, none found (searched 2026-10-11).
