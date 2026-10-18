# Combat

This page builds on [combat](../../specs/genshin/combat/design.md) as built: auras, reactions by the game's priority, damage, internal cooldown, shields, energy, and the level multipliers, reach and limits the reactions carry. What is left is one family of reactions the game added later. Each is built the way the built rules were, as pure functions in `genshin-world`'s `services/combat`, held to a worked example from its source.

## Decisions

- **A Stellar reaction is enabled by the party, not placed.** The wiki's Stellar Linchpin page says every Stellar Linchpin user's Stellar Jubilee passive enables the Stellar Glimmer reactions, and gcsim v2.47.2 sets both enable flags at Odette's init (`pkg/characters/odette/stellar.go`). The reaction the element already triggers becomes its Stellar form while the flag is set, and the reaction itself creates its Stellar Vortex or Polestar Field (`pkg/reactable/stellarswirl.go`, `stellarconduct.go`). No gadget a kit places is a gate, so the earlier gate is withdrawn. The enabler reaches `applyElement` as a `StellarReactionType` list, beside the Moonsign's Lunar types, and the party holds none until a kit enables one.
- **A Stellar reaction keeps its step's element and consumption.** Stellar Swirl keeps the Cryo element the Cryo Swirl step carries, and spreads no Cryo beside it: gcsim's `queueStellarSwirl` deals the Anemo hit and creates the vortex, with no spread call. Stellar-Conduct keeps the Superconduct step's element and its coefficient of 1 on each aura it consumes (gcsim's `TryStellarConduct` reduces each at 1), and it covers the Freeze Superconduct as well as the Cryo aura, since gcsim's frozen variant (`TryFrozenStellarConduct`) takes the same trigger. Neither carries damage of its own here; the Stellar Vortex's and the Polestar Field's effects wait with task 2.4.
- **The Lunar and Stellar Glimmer reactions as their own formula.** Lunar-Charged, Lunar-Bloom and Lunar-Crystallize, with Stellar-Conduct and Stellar Swirl, are dealt directly by a talent or as a separate instance. Each contributor's damage is worked out alone with standard crit, then the four highest are weighted 0.6, 0.3, 0.05 and 0.05. Lunar-Charged replaces Electro-Charged while a Moonsign character is in the party, so the step that starts Electro-Charged reads the party.
- **The Starlight Prism lasts 7 seconds, as the wiki gives it.** The wiki's Stellar-Conduct page says the prism lasts 7s and sustains a Polestar Field. gcsim v2.47.2 sets the field at 6 seconds (`sscFieldDur`), so the two disagree. The wiki's figure is taken, provisionally, and the seconds are `POLESTAR_FIELD_SECONDS`, cited in `services/kit/constants.ts`, not Odette's record (its Polestar keys left the record in the 2.5 placement commit). A recording would settle it.
- **The Stellar numbers are cited tables, and the effects wait for their hooks.** The coefficients, the Cryo and Electro DMG Bonus and the vortex's explosion coefficient are pure functions in `services/combat/damage`, each cited to the wiki. The hit recording, the Physical RES and the detonation need a field element hook and a Stellar damage path, which do not exist yet, so they are task 2.5 and are not guessed into the kit.

## Scope and order

**Today:** auras, reactions and their damage on one target, the internal cooldown, shields and energy from particles and orbs, and the Traveler's kit's hits through them, as the [combat](../../specs/genshin/combat/design.md) page describes. The deployed team's Moonsign, Nascent and Ascendant Gleam, the Lunar formula for a direct Lunar hit, Lunar-Bloom with the party's Verdant Dew, Lunar-Charged with the party's cloud and its contributors' weighted hit, and Lunar-Crystallize with its Moondrifts and Moondrift Harmony are built, with Lauma's Benediction and Hymn of Eternal Rest the first to trigger and spend Lunar-Bloom and Ineffa's Benediction the first to trigger Lunar-Charged ([combat](../../specs/genshin/combat/design.md#lunar-reactions)).

**This adds:**

1. **The Stellar Glimmer reactions**, Stellar-Conduct and Stellar Swirl, become their Stellar form where the party's enabler is held: a Cryo Swirl becomes Stellar Swirl and a Superconduct becomes Stellar-Conduct, as the Moonsign turns a Bloom Lunar. The reaction then places its Polestar Field (`addPolestarField`, on the reaction path, so any enabler's gets it) or its Stellar Vortex (Odette's kit). The enablers are the Stellar Jubilee passives of the Stellar Linchpin users (Odette, Sandrone, Vesna, Danica, Mitya and the Cryo Traveler), of which none is built, so the step waits on the first of them.

## What this does not propose

- **The Stellar fields and their effects.** The Starlight Prism's Stellar-Conduct coefficient buff (no direct Stellar-Conduct hit consumes it yet), the Stellar Vortex's stacks, lifetimes and detonation, the Stellar Swirl's Anemo instance, the Stellar Swirl and Stellar-Conduct damage (the Glimmer formula and the Starlight Prism's coefficient table, which are separate), and the enablers' kits.
- **The Starlight Prism's recording and DMG Bonus are provisional.** The count takes a Cryo or Electro applied inside the field as the element's internal cooldown lets it through, and the field's own 4-second schedule resets it one step after each tick. The buff reaches only the body, since the engine gives no other member a position. gcsim's 0.1-second stack cooldown per character is not built, so a second application inside it is recorded. A recording settles all three.
- **Characters' kits.** Talent multipliers, each ability's gauge, internal cooldown tag and particles are a character's data, added with the [characters](../../specs/genshin/characters/README.md) that use them. The Lunar reactions leave these kit lines waiting on nothing but their kit's next pass: Flins's Lunar-Charged hits, Aino's Moonsign, Columbina's Benediction, the first to trigger Lunar-Crystallize, Ineffa's passives and constellations, and Lauma's Pale Hymn, Moon Song and passives, with each kit's Lunar flat-damage and elevation bonuses, High Voltage's particle on Lunar-Charged and Enduring Rock's clause for Moondrifts.
- **Anything drawn.** A reaction's text, an aura's icon over its target and a shield's bar belong to the HUD and the enemies.

## Key files

| File                                                                           | Role                                                                       |
| :----------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/combat/aura/applyElement.ts`              | Turns a Cryo Swirl and a Superconduct Stellar while the party enables them |
| `packages/genshin-world/src/models/combat/ElementApplication.ts`               | Carries the Stellar reactions the party enables                            |
| `packages/genshin-world/src/services/combat/damage/getTransformativeDamage.ts` | Gains the Glimmer formula beside the transformative reactions              |

## Sources

- [Damage](https://genshin-impact.fandom.com/wiki/Damage), Genshin Impact Wiki: the Lunar and Stellar Glimmer formulas, direct and indirect, and the four contributors' weights.

## Reference

- `world-skill-burst.mkv` — the Traveler on the field with the skill pressed and its cooldown counted down, then the burst energy filling until the burst glows, the skill and burst buttons on screen. On the wiki and YouTube, none found (searched 2026-10-11).
- `world-attacks.mkv` — the Traveler's normal attack string, a charged attack, a low and a high plunge, then E and then Q, each on a Hilichurl, 60 frames a second. Superseded by the animation clips: `genshin:assets timings` reads the hitmark seconds of each attack, plunge, skill and burst from the Traveler's clips, once the blocks are extracted. On the wiki and YouTube, none found (searched 2026-10-11).
