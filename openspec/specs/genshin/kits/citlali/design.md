# Citlali

Citlali's kit is its record and one behaviour module, `createCitlaliKitBehaviour`, avatar 10000107: her three strikes, a charged attack, the hit of Obsidian Tzitzimitl, Ice Storm, and a collision, low and high plunge. Her multipliers are read from proud skill groups 10731, 10732 and 10739: the strikes, charged attack, stamina and plunges from the first, Obsidian Tzitzimitl and the skill's cooldown from the second, and Ice Storm, the burst's cooldown and its energy cost from the third. The charged attack costs 50 stamina, and Ice Storm costs 60 energy.

## Not yet built

- **Itzpapa and the Opal Shield wait on the Nightsoul hook.** Obsidian Tzitzimitl summons Itzpapa and gives the party's active character a shield that scales with Elemental Mastery, and the Opal Fire state those start is the Nightsoul state the framework does not hold. The skill's hit is built; the summon and the shield are not, so the skill has no shield in this kit.
- **The Spirit Vessel skulls are not built.** Ice Storm summons a skull on each of the first three enemies within 7 of Citlali as it is cast, and each lands at a random time between 87 and 117 frames after the burst's hit. The start is given the world's context, so it can read the enemies and draw those times from its random source, but no skull is written yet, and the burst's hit is Ice Storm alone.
- **Citlali's Ascension 1 and 4 and Constellations 1, 2, 4 and 6 wait on the Nightsoul hook.** Each reads the Nightsoul points, the Nightsoul burst, the Opal Fire state, Itzpapa or the Opal Shield, so none is built.

## Decisions

- **The strikes land 10 frames after their hitmarks.** gcsim queues each strike with a 10-frame travel, so each lands at its hitmark plus 10, as the bow kits and Ororon do.
- **Her strikes and charged attack give no poise.** gcsim gives them none, so `citlaliKit.ts` stands them at 0, as Ororon's do. A recording of the game's poise on them would settle it.
- **Her plunges are the proud group's 5, 6 and 7.** With no gcsim plunge file to time them, the collision, low and high plunge land at the start of their action with a zero animation, as the Ororon kit's do. A recording of her plunges landing at once would settle it; a later landing would need its frames.

## Key files

| File                                                               | Role                                                                                                                                                                            |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/citlaliKit.ts` | `createCitlaliKitBehaviour`, Citlali's strikes, charged attack, Obsidian Tzitzimitl, Ice Storm and plunges, with Itzpapa, the Opal Shield and the skulls waiting on their hooks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/citlali), MIT, at v2.47.2: Citlali's strikes' hitmarks and cancels, the charged attack's and Ice Storm's frames and reaches, Obsidian Tzitzimitl's hit, and the Nightsoul passives and skulls the hooks wait on.
