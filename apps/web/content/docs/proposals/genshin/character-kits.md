---
title: Character kits
description: Proposal — every character's combat kit as the game plays it, on one framework. The normal attack's string, the charged attack, the plunge, the Elemental Skill and Burst, and the passives are one shape every character fills. The numbers the game's tables hold are read by a script, the gauge, internal cooldown and particles the community has measured are read from the wiki, and what each character uniquely does is a small module over shared effects, each hit priced by combat as built.
model: claude-opus-5-5
---

# Character kits

Combat's rules are built ([combat](/docs/genshin/combat)): auras, reactions in the game's priority, the damage formula, the internal cooldown, shields and energy. What lands a hit under those rules is a character's kit, the three combat talents and the passives every character carries. Nothing has a kit yet, so nothing in the world strikes. This page is the framework every kit is written on, and it comes first among the game's systems because talents, constellations, weapons' and artifacts' effects, and every challenge after them act through it. It builds on [character attributes](/docs/genshin/character-attributes), whose sums price a hit, and on the [character controller](/docs/genshin/character-controller), whose body a kit acts from.

## Decisions

- **A kit is data plus one module.** Every kit has the same shape: a normal attack's string of hits, a charged attack, a plunge, an Elemental Skill, an Elemental Burst and the passives. What a character alone does, such as Bennett's field that heals and raises ATK or a summon that strikes on a timer, is a small module per character over shared effects: a hit, a field, a summon, a buff, an infusion, a heal and a shield. A new character is a run of the reader and one module, never a change to the framework. The game keeps that behaviour in its ability configs (`BinOutput/Ability/Temp/AvatarAbilities` in the community's dump), but every key and type name in them is scrambled, so reading them would mean decompiling a scripting system rather than reading a table. Each module is written instead from the talent's own description and the wiki's notes on it.
- **The tables' numbers are read, never typed.** `genshin:assets stats` gains the kits. `AvatarSkillDepotExcelConfigData` gives which skills a character has: the normal attack, the skill, the burst, the passives each ascension phase opens and the constellations. `AvatarSkillExcelConfigData` gives each skill's cooldown, energy cost and charges. `ProudSkillExcelConfigData` gives each talent level's multipliers (`paramList`) with their labels by text id (`paramDescList`), so "1-Hit DMG" is the game's own words and its value the game's own number.
- **The measured numbers are the wiki's.** The client holds a hit's element gauge, its internal cooldown tag and group, its poise damage and a skill's particles only in the scrambled configs. The gauge, the tag and group and the particles are taken from the wiki's tables of them (Elemental Gauge Theory's character data, Internal Cooldown's data, and each skill page's particle note) and written beside the character's module, each value citing its page. No table read lists every attack's poise damage, so each is provisional until a source for it is found.
- **A hit goes through combat as built.** A kit's hit is priced by `getDamage` from the attacker's `computeCharacterAttributes` and the talent's multiplier at its level. Its element is counted by `applyInternalCooldown` and applied by `applyElement`, its damage and poise reach the enemy through `damageEnemy`, and its particles become the party's energy through `getEnergyGain`. No kit computes damage of its own.
- **Actions are a state machine on the fixed step.** Pressing the normal attack advances the string while the last hit's window is open, and the string starts again once it closes. Holding it is the charged attack, which costs the weapon's stamina as the wiki lists it: 20 for a sword, 25 for a polearm, 50 for a catalyst, 40 a second for a claymore, and none for a bow's aimed shot. Pressing it in the air, high enough above the ground, is a plunge: a low plunge when it lands from 2.4 metres or less, a high plunge from higher. `E` is the skill, pressed or held, on its cooldown and its charges. `Q` is the burst, at full energy, which it empties. The step reads the body's movement state, so no attack starts while climbing, swimming or gliding, and a dash or a jump cancels an action only once its cancel frame has passed.
- **An attack aims as the game's does.** It goes at the selected enemy, the nearest in front within reach, which the game marks with an arrow; with none selected, straight ahead. The bow's `R` aims instead, as the controls already bind it.
- **Catalysts and bows as the game deals them.** A catalyst's every attack deals its element, a bow's only its charged shot, and every other weapon physical damage unless an infusion changes it.

## How it works

```mermaid
flowchart TD
  PRESS["A frame's pressed and held actions"] --> GATE{"Allowed? Movement state, cooldown, charges, energy, stamina"}
  GATE -->|"no"| IDLE["Nothing starts"]
  GATE -->|"yes"| ACTION["The kit's action: string, charged, plunge, skill or burst"]
  ACTION -->|"each hitmark"| HIT["A hit: multiplier, element, gauge, tag, poise"]
  ACTION -->|"a field, summon, buff or infusion"| EFFECT["The character's module adds its effect"]
  EFFECT -->|"its own hits, on its timer"| HIT
  HIT --> ICD["applyInternalCooldown, then applyElement"]
  HIT --> DAMAGE["getDamage from computeCharacterAttributes"]
  DAMAGE --> ENEMY["damageEnemy"]
  HIT -->|"a skill's hit"| PARTICLES["Particles to the party: getEnergyGain"]
```

## Scope and order

**Today:** combat's rules price a hit on one target, the body moves through its states, enemies take damage and poise through `damageEnemy`, and the attack, skill, burst and aim bindings are read with nothing behind them.

**This adds, in order:**

1. **The action state machine and the shared effects**, with the Traveler's normal attack, charged attack and plunge as the first kit, since the Traveler is the one character in the tables today.
2. **The kits' run**, writing every character's skills, cooldowns, costs and talent multipliers beside the stats it already writes.
3. **The Traveler's skill and burst** for the element a statue gives them, then one module per character as the [characters](/docs/genshin/characters) page draws each.
4. **Passives**, each written with its character's module and opened by the phase its table names.

## Data and measures

- **Read from the game's tables:** `AvatarSkillDepotExcelConfigData`, `AvatarSkillExcelConfigData` and `ProudSkillExcelConfigData` from the dump the stats run already reads, and each talent's name, description and labels from the text map by their own ids.
- **Read from the wiki:** each hit's gauge, internal cooldown tag and group, and each skill's particles, per character.
- **Still to find:** a source for every attack's poise damage.
- **Measured:** when each hit lands in its action (its hitmark) and when the next action may cancel it, read off the character's own animation clips once `genshin:assets clips` decodes them, or off a recording at 60 frames a second where a clip marks no event, and the least height a plunge starts from, which the wiki does not give. Until then each is a provisional constant with its character's module.

## What this does not propose

- **Talent levels and constellations.** The kit reads its talent levels and constellations; raising them is the [talents](/docs/proposals/genshin/talents) and [constellations](/docs/proposals/genshin/constellations) pages'.
- **The effects drawn.** A slash's trail, a field's circle and a burst's animation are the character's motion and the world's effects, matched in the [recreation passes](/docs/proposals/genshin/recreation-passes).

## Key files

| File                                                                                   | Role after the change                                          |
| :------------------------------------------------------------------------------------- | :------------------------------------------------------------- |
| `packages/genshin-world/src/services/combat/damage/getDamage.ts`                       | Prices every hit a kit lands                                   |
| `packages/genshin-world/src/services/combat/internalCooldown/applyInternalCooldown.ts` | Counts each kit hit under its tag and group                    |
| `packages/genshin-world/src/services/combat/energy/getEnergyGain.ts`                   | The party's energy from a skill's particles                    |
| `packages/genshin-world/src/services/enemy/damageEnemy.ts`                             | Takes a kit's damage and poise                                 |
| `packages/genshin-world/src/models/character/CharacterData.ts`                         | Gains the character's skills, cooldowns, costs and multipliers |
| `scripts/src/services/genshinAssets/stats/writeStatTables.ts`                          | Writes the kits' tables beside the stats                       |
| `packages/genshin-engine/src/input/InputActionBindingMap.ts`                           | The attack, skill, burst and aim bindings the kits read        |
| `packages/genshin-world/src/components/World/Character/Index.vue`                      | Steps the character on the field's kit with its body           |

New files:

```text
packages/genshin-world/src/models/kit/
packages/genshin-world/src/services/kit/stepKit.ts
packages/genshin-world/src/services/kit/effects/
packages/genshin-world/src/services/kit/characters/
```

## Sources

- [Talent](https://genshin-impact.fandom.com/wiki/Talent), Genshin Impact Wiki: the three combat talents, the ascension and passive talents, their buttons, the selected enemy's arrow, and the talent level multipliers.
- [Normal Attack](https://genshin-impact.fandom.com/wiki/Normal_Attack), Genshin Impact Wiki: a string of strikes, the charged and plunging attacks under one talent, and which weapons deal their element.
- [Charged Attack](https://genshin-impact.fandom.com/wiki/Charged_Attack) and [Plunging Attack](https://genshin-impact.fandom.com/wiki/Plunging_Attack), Genshin Impact Wiki: the stamina each weapon's charged attack costs, and the low and high plunge either side of 2.4 metres.
- [Elemental Skill](https://genshin-impact.fandom.com/wiki/Elemental_Skill) and [Elemental Burst](https://genshin-impact.fandom.com/wiki/Elemental_Burst), Genshin Impact Wiki: the skill's cooldown, charges and press or hold, and the burst's energy cost and cooldown.
- [Elemental Gauge Theory: Character Data](https://genshin-impact.fandom.com/wiki/Elemental_Gauge_Theory/Character_Data) and [Internal Cooldown: Data](https://genshin-impact.fandom.com/wiki/Internal_Cooldown/Data), Genshin Impact Wiki: each ability's gauge, and each attack's tag and group.
- [Exploration](https://genshin-impact.fandom.com/wiki/Exploration), Genshin Impact Wiki: no combat while climbing, gliding or swimming.
- [AnimeGameData](https://gitlab.com/Dimbreath/AnimeGameData), the community's per-patch dump: the skill, skill depot and proud skill tables the run reads, and the ability configs whose scrambled names rule out reading behaviour from them.
