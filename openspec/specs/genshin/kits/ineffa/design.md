# Ineffa

Ineffa's kit is its record and one behaviour module, `createIneffaKitBehaviour`, avatar 10000116: her four strikes, a charged attack, Cleaning Mode as her skill, Cyclonic Exterminator as her burst, a low, high and collision plunge, and her Moonsign Benediction. Her multipliers are read from proud skill groups 11631, 11632 and 11639, with the skill's damage, shield, Birgitta's damage and durations among them. The charged attack takes 25 stamina, the skill has a 16-second cooldown, and the burst has 60 energy and 15 seconds.

## Not yet built

- **Her Ascension 4 passive, Panoramic Permutation Protocol, is built as the burst's Elemental Mastery. Her Ascension 1 passive and Constellations 1 and 6 are not built.** Constellation 4's Energy is built, see the Decisions. Ascension 1 and Constellations 1 and 6 read Lunar-Charged: a bonus Lunar-Charged attack on Birgitta's discharge while Lunar-Charged holds, and a bonus attack. Lunar-Charged and the direct Lunar hit are built ([combat](../../combat/design.md#lunar-reactions)), so they wait only on her kit's next pass. Constellation 2 is not built either: it places a shield 37 frames after the burst, which the passives' step adds once the shield's amount is set against the framework.
- **Birgitta's Electro particles wait on the particle hook.** gcsim gives her particles an internal cooldown, and the framework produces none yet, so her energy goes ungenerated.

## Decisions

- **Her Moonsign Benediction.** It turns the party's Electro-Charged into Lunar-Charged and gives the party's Lunar-Charged 0.7% Base DMG Bonus for each 100 of her ATK, at most 14%, as gcsim's `asc.go` has it.
- **The skill's shield is a task's.** gcsim places Cleaning Mode's shield 4 frames in, so the skill sets a task that runs then, and the shield reads her ATK as it stands as the task runs: the table's share of ATK plus its flat HP. It is Electro and lasts the 20 seconds the table gives it, from its placement.
- **Birgitta is summoned on her cast's own timing, not its first frame.** Cleaning Mode summons her 42 frames after its hit, at 68 frames, and Cyclonic Exterminator summons her at its hit, at 111 frames. Each summon sets the one on the field to end, as gcsim restarts her discharges, so Birgitta is never on the field twice.
- **Birgitta's discharges.** Each lands 42 frames after her spawn and every 119 frames after, ten in all, on a circle the framework centres on the targeted enemy with a radius of 4 metres. She stands for 1,200 frames from her spawn.
- **The plunges are borrowed.** There is no gcsim plunge file for Ineffa; her plunges take the standard reach, timing and poise of [how a kit is read](../README.md#how-a-kit-is-read), the manual verification list holding the question.
- **Her strikes, charged attack and burst have no poise.** gcsim gives them none, so each reads 0.
- **Constellation 4's energy goes to Ineffa herself, on her party's reactions.** gcsim's `cons.go` gives her 5 Energy on any Lunar-Charged reaction on an enemy, with a 4 second internal cooldown, and her own reactions count. The hook reads the reactions of any party member, her own included, and holds the cooldown as a status.

## Key files

| File                                                              | Role                                                                                                                                                                  |
| :---------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/ineffaKit.ts` | `createIneffaKitBehaviour`, Ineffa's four strikes, charged attack, Cleaning Mode and its shield, Birgitta and Cyclonic Exterminator, plunges and Moonsign Benediction |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/ineffa), MIT, at v2.47.2: the strikes and the charged attack as the index gives them, Cleaning Mode and its shield and Birgitta, Cyclonic Exterminator, the Moonsign Benediction, and her Ascension 1 passive and constellations not yet built.
- [Hosted game data](../../hosted-game-data/design.md): proud skill groups 11631, 11632 and 11639, with the skill-kit record behind her cooldowns and energy cost.
