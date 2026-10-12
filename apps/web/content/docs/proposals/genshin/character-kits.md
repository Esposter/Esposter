---
title: Character kits
description: Proposal — the framework work still left for character kits: the Traveler's kit taking the element its statue gives, the passives and constellations the modules leave out, the swap watchers and Hu Tao's Spirit Soother heal, all on the framework the built kits run on.
model: claude-opus-5-5
needs: [game-exports]
touches: ["packages/genshin-world/src/services/kit/**"]
---

# Character kits

Every character on the [character kits](/docs/genshin/kits) index has a module of its own, each built on the framework this page proposes to finish. What is left is the element a statue gives the Traveler, the passives and constellations the modules leave out, the swap watchers older modules keep, and Hu Tao's Spirit Soother heal under half HP with her Constellations 4 and 6. It comes before the rest of the game's systems that act through a kit, such as talents, constellations, weapons' and artifacts' effects, and every challenge after them. It builds on [character attributes](/docs/genshin/character-attributes), whose sums price a hit, and on the [character controller](/docs/genshin/character-controller), whose body a kit acts from.

## Decisions

- **A kit is data plus one module.** Every kit has the same shape: a normal attack's string of hits, a charged attack, a plunge, an Elemental Skill, an Elemental Burst and the passives. What a character alone does, such as Bennett's field that heals and raises ATK or a summon that strikes on a timer, is a small module per character over shared effects: a hit, a field, a summon, a buff, an infusion, a heal and a shield. A new character is a run of the reader and one module, never a change to the framework. The game keeps that behaviour in its ability configs (`BinOutput/Ability/Temp/AvatarAbilities` in the community's dump), but every key and type name in them is scrambled, so reading them would mean decompiling a scripting system rather than reading a table. Each module is written instead from the talent's own description and the wiki's notes on it.
- **The tables' numbers are read, never typed.** The skill sets are read: `AvatarSkillDepotExcelConfigData` gives each character's sets, and `AvatarSkillExcelConfigData` each skill's cooldown, energy cost and charges, as [character kits](/docs/genshin/kits) records. `ProudSkillExcelConfigData`, which gives each talent level's multipliers (`paramList`) with their labels by text id (`paramDescList`), is read beside the dump from the repository's revision the dump matches, as [talents](/docs/genshin/talents) reads its costs, so the multipliers wait only on a kit reading them. The Traveler's kit reads them now, from the table the stats run writes, and each other module reads its own from the same table.
- **The measured numbers are the wiki's, gcsim's, or a recording's.** The client holds a hit's element gauge, its internal cooldown tag and group, its poise damage and a skill's particles only in the scrambled configs. The gauge, the tag and group and the particles are taken from the wiki's tables of them (Elemental Gauge Theory's character data, Internal Cooldown's data, and each skill page's particle note) and written beside the character's module, each value citing its page. Poise is gcsim v2.47.2's where gcsim gives it: the plunges' 100 low and 150 high, and no poise on the Traveler's Anemo skill or burst, which hit with none. Each strike's poise, the charged attack's and the plunge collision's are in no source yet, so each stays provisional until one is found.
- **The Traveler's skill and burst take the element its statue gives.** Once the Traveler resonates with a Statue of The Seven, its skill and burst deal that element at 1U, which the placeholders do not yet do. The table has one set per element form, so the statue's element picks the set and its cooldowns and energy cost; that picking waits for the [statues page](/docs/proposals/genshin/statues-of-the-seven), which holds the resonance. Until then the Traveler has no element, and its placeholders deal none. The skill's particles are the wiki's, not the table's, as above.
- **Catalysts and bows as the game deals them.** A catalyst's every attack deals its element, a bow's only its charged shot, and every other weapon physical damage unless an infusion changes it. A bow's `R` aims instead of targeting, as the controls already bind it.
- **Targeting's further coefficients wait.** The wiki's score is the distance, the angle and the altitude, as built. Its view, current-target and priority coefficients wait for a camera's frustum, a kept target and a boss.
- **Passives are one shape too.** Each passive is written with its character's module and opened by the ascension phase its table names, so a character's passives add to its kit without a change to the framework.
- **A shared effect is built by the first module that needs it, never before.** The Traveler's kit uses a hit, and a heal and a hit's element sit with the party's damage.

## How it works

```mermaid
flowchart TD
  TABLES["The kits run: multipliers from the game's tables, skill sets already read"] --> KIT["A kit: its data and one character's module"]
  MODULE["A character's module, written from its talent's description and the wiki's notes"] --> KIT
  KIT -->|"its actions' hits"| HITS["Hits priced by combat, as the Traveler's are"]
  KIT -->|"a field, summon, buff, infusion, heal or shield"| EFFECTS["The shared effects, each on the framework"]
  EFFECTS -->|"its own hits, on its timer"| HITS
  PASSIVE["A passive, opened by its ascension phase"] --> KIT
```

## Scope and order

**Today:** a character without a module of its own fights with the Traveler's kit until one is written.

**This adds, in order:**

1. **The Traveler's skill and burst** for the element a statue gives them, once the [statues page](/docs/proposals/genshin/statues-of-the-seven) holds the resonance, then one module for each playable character not yet on the [character kits](/docs/genshin/kits) index.
2. **Passives**, each written with its character's module and opened by the phase its table names.
3. **Hu Tao's Spirit Soother heal** under half HP, with her Constellations 4 and 6 and Blood Blossom, once a kit's actions can read party HP and an enemy's status at their start.
4. **The swap watchers onto the kit events.** Klee's Sparks 'n' Splash, Xiao's Bane of All Evil, Ningguang's Star Jades and Razor's Wolf Within each end through a field that ticks on every step to see whether their character still holds the field, built before the [kit events](/docs/genshin/kits); each moves onto `CharacterSwapped`. Xingqiu's Raincutter, set going as a normal attack starts, moves onto the same channel once the delay gcsim gives each character's attack before it is read.

## Data and measures

- **Read from the game's tables:** the skill sets and their skills, and each talent's multipliers with their labels' text ids from `ProudSkillExcelConfigData`. Still to read: each talent's name and description by their text ids.
- **Still to choose:** the Traveler's set by the element a statue gives. The Anemo set is read by default (`TRAVELER_DEFAULT_ELEMENT`), and choosing another waits on the [statues page](/docs/proposals/genshin/statues-of-the-seven).
- **Read from the wiki:** each hit's gauge, internal cooldown tag and group, and each skill's particles, per character, each citing its page.
- **Still to find:** a source for each strike's, the charged attack's and the plunge collision's poise damage. gcsim's Anemo attack file has none.
- **Measured:** when each hit lands in its action (its hitmark) and when the next action may cancel it. The extracted Traveler attack clips carry no events, so the hitmarks come off the References sought list's `world-attacks.mkv` and `world-skill-burst.mkv`. The least height a plunge starts from is what the wiki does not give, so it waits on `world-attacks.mkv` too. Until then each is a provisional constant with its character's module.

## What this does not propose

- **Talent levels and constellations.** The kit reads its talent levels and constellations; raising them is the [talents](/docs/proposals/genshin/talents) and [constellations](/docs/proposals/genshin/constellations) pages'.
- **The effects drawn.** A slash's trail, a field's circle and a burst's animation are the character's motion and the world's effects, matched in the [recreation passes](/docs/proposals/genshin/recreation-passes).

## Key files

| File                                                         | Role after the change                         |
| :----------------------------------------------------------- | :-------------------------------------------- |
| `packages/genshin-engine/src/input/InputActionBindingMap.ts` | The aim binding a bow's kit reads             |
| `packages/genshin-world/src/services/kit/travelerKit.ts`     | `createTravelerKit`, the Traveler's Anemo kit |

New files, as the modules come:

```text
packages/genshin-world/src/services/kit/characters/
```

## Sources

- [Talent](https://genshin-impact.fandom.com/wiki/Talent), Genshin Impact Wiki: the three combat talents, the ascension and passive talents, their buttons, the selected enemy's arrow, and the talent level multipliers.
- [Normal Attack](https://genshin-impact.fandom.com/wiki/Normal_Attack), Genshin Impact Wiki: which weapons deal their element, and a catalyst's and a bow's attacks.
- [Elemental Skill](https://genshin-impact.fandom.com/wiki/Elemental_Skill) and [Elemental Burst](https://genshin-impact.fandom.com/wiki/Elemental_Burst), Genshin Impact Wiki: the skill's cooldown, charges and press or hold, and the burst's energy cost and cooldown.
- [Elemental Gauge Theory: Character Data](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory/Character_Data), Genshin Impact Wiki: each ability's gauge, and each attack's tag and group.
- [Hu Tao](https://genshin-impact.fandom.com/wiki/Hu_Tao), Genshin Impact Wiki: Spirit Soother's heal under half HP, Blood Blossom, and her Constellations 4 and 6.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the skill and skill depot tables the sets are read from, the proud skill table the multipliers are read from, and the ability configs whose scrambled names rule out reading behaviour from them.
