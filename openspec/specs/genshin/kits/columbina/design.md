# Columbina

Columbina's kit is its record and one behaviour module, `createColumbinaKitBehaviour`, avatar 10000125: three strikes, a charged attack, a collision and two plunges, her skill's press with the DoT field it sets going, and the burst's hit. Her multipliers are read from proud skill groups 12531, 12532 and 12539, with the skill's duration among them. Every hit is Hydro and deals its gauge of one.

Her skill and burst deal their multiplier on her max HP, as gcsim's `UseHP` gives them, so their talent multiplier is zero and the share of max HP is each hit's flat damage. A press while the DoT runs restarts its duration rather than stacking a second field, as gcsim restarts its status and keeps its ticks.

gcsim sources: her attack, charge, skill and burst files, with the table data in gcsim's Columbina data file.

## Decisions

- **The skill's DoT reaches 4 metres, or 6 metres while the team is at Ascendant Gleam.** gcsim reaches 6 metres from Moonsign level 2 (`columbina/skill.go`), which the party's Moonsign level reads. She does not count toward that level herself until her Benediction is declared, so a team of her and one other Moonsign character reads Nascent Gleam where gcsim reads Ascendant.
- **Her strikes and plunges deal no poise.** gcsim gives none, and no source gives Columbina's yet, so each one's poise is zero.
- **The first strike's two-frame windup is not built.** gcsim adds it to a first strike that follows a strike or a charged attack. The kit keeps no record of the state the previous action left, so each strike lands on its gcsim hitmark without it.
- **The charged attack's stamina is the catalyst's 50.** gcsim's default for a catalyst's charged attack is 50, and her table reads the same. gcsim makes it free while Dew is held, which waits on the Dew hook.
- **The plunges borrow gcsim's Bennett plunge reach.** gcsim has no plunge file for Columbina, so the reach is the kit constants' borrowed one, and the 0.4 seconds are the wiki's standard, not measured.

## Not built

- **The Moondew Cleanse waits on the Lunar-Bloom hook.** Her charged attack's Lunar-Bloom follow-up is a reaction the kit cannot price yet, so the charged attack is its Hydro hit alone.
- **The burst's field waits on the Lunar reaction hook.** The field's buff gives each character inside it a Lunar reaction bonus, and no kit reads a Lunar reaction yet. The burst is its hit alone.
- **The skill's gravity waits on the Lunar reaction hook.** Her press clears the gravity that the Lunar reactions build, and each gravity tick deals the reaction's hit. Neither is built, so the press and the DoT are all the skill.
- **Her Moonsign Benediction waits on the kit record's republish.** It would turn her team's Bloom, Charged and Crystallize reactions Lunar and add Base DMG Bonus from her max HP (gcsim `columbina/asc.go`: 0.2% per 1000, at most 7%). A behaviour's Benediction is applied over the record's, which holds none yet, so declaring it now would fail her kit's build.
- **Her passives and constellations wait on the Lunar reactions, her Benediction and Dew.** Each reads one of them, so none is built.

## Key files

| File                                                                 | Role                                                                                                                             |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/columbinaKit.ts` | `createColumbinaKitBehaviour`, Columbina's three strikes, charged attack, plunges, skill press with its DoT field, and burst hit |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/columbina), MIT: her strikes' hitmarks and cancels, the charged attack's hit and animation, the skill's press and DoT and their timing, the burst's hit and animation, and her table data file.
