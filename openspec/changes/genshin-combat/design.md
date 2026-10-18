# Combat

This page builds on [combat](../../specs/genshin/combat/design.md) as built: auras, reactions by the game's priority, damage, internal cooldown, shields, energy, and the level multipliers, reach and limits the reactions carry. What is left is one family of reactions the game added later. Each is built the way the built rules were, as pure functions in `genshin-world`'s `services/combat`, held to a worked example from its source.

## Decisions

- **The Lunar and Stellar Glimmer reactions as their own formula.** Lunar-Charged, Lunar-Bloom and Lunar-Crystallize, with Stellar-Conduct and Stellar Swirl, are dealt directly by a talent or as a separate instance. Each contributor's damage is worked out alone with standard crit, then the four highest are weighted 0.6, 0.3, 0.05 and 0.05. Lunar-Charged replaces Electro-Charged while a Moonsign character is in the party, so the step that starts Electro-Charged reads the party.

## Scope and order

**Today:** auras, reactions and their damage on one target, the internal cooldown, shields and energy from particles and orbs, and the Traveler's kit's hits through them, as the [combat](../../specs/genshin/combat/design.md) page describes. The deployed team's Moonsign, Nascent and Ascendant Gleam, the Lunar formula for a direct Lunar hit, Lunar-Bloom with the party's Verdant Dew, Lunar-Charged with the party's cloud and its contributors' weighted hit, and Lunar-Crystallize with its Moondrifts and Moondrift Harmony are built, with Lauma's Benediction and Hymn of Eternal Rest the first to trigger and spend Lunar-Bloom and Ineffa's Benediction the first to trigger Lunar-Charged ([combat](../../specs/genshin/combat/design.md#lunar-reactions)).

**This adds:**

1. **The Stellar Glimmer reactions**, Stellar-Conduct and Stellar Swirl, with the first character whose kit triggers them. gcsim deals both (`pkg/reactable/stellarconduct.go`, `stellarswirl.go`), but each starts from a gadget a kit places, the Polestar field or the vortex, and only the Cryo Traveler's and Odette's kits place them. Neither is built, so this step waits on one of them.

## What this does not propose

- **Characters' kits.** Talent multipliers, each ability's gauge, internal cooldown tag and particles are a character's data, added with the [characters](../../specs/genshin/characters/README.md) that use them. The Lunar reactions leave these kit lines waiting on nothing but their kit's next pass: Flins's Lunar-Charged hits, Aino's Moonsign, Columbina's Benediction, the first to trigger Lunar-Crystallize, Ineffa's passives and constellations, and Lauma's Pale Hymn, Moon Song and passives, with each kit's Lunar flat-damage and elevation bonuses, High Voltage's particle on Lunar-Charged and Enduring Rock's clause for Moondrifts.
- **Anything drawn.** A reaction's text, an aura's icon over its target and a shield's bar belong to the HUD and the enemies.

## Key files

| File                                                                           | Role                                                          |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------ |
| `packages/genshin-world/src/services/combat/aura/applyElement.ts`              | Turns a Swirl Stellar where a kit's gadget stands             |
| `packages/genshin-world/src/services/combat/damage/getTransformativeDamage.ts` | Gains the Glimmer formula beside the transformative reactions |

## Sources

- [Damage](https://genshin-impact.fandom.com/wiki/Damage), Genshin Impact Wiki: the Lunar and Stellar Glimmer formulas, direct and indirect, and the four contributors' weights.

## Reference

- `world-skill-burst.mkv` — the Traveler on the field with the skill pressed and its cooldown counted down, then the burst energy filling until the burst glows, the skill and burst buttons on screen. On the wiki and YouTube, none found (searched 2026-10-11).
- `world-attacks.mkv` — the Traveler's normal attack string, a charged attack, a low and a high plunge, then E and then Q, each on a Hilichurl, 60 frames a second. Superseded by the animation clips: `genshin:assets timings` reads the hitmark seconds of each attack, plunge, skill and burst from the Traveler's clips, once the blocks are extracted. On the wiki and YouTube, none found (searched 2026-10-11).
