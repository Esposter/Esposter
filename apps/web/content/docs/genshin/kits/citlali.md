---
title: Citlali
description: Citlali's kit as built: her three strikes, charged attack, Obsidian Tzitzimitl's hit, Ice Storm and her plunges. Itzpapa, the Opal Shield, the Spirit Vessel skulls and her passives wait on their hooks.
---

# Citlali

Citlali's kit is one module, `createCitlaliKit`, avatar 10000107: her three strikes, a charged attack, the hit of Obsidian Tzitzimitl, Ice Storm, and a collision, low and high plunge. Her multipliers are read from proud skill groups 10731, 10732 and 10739: the strikes, charged attack, stamina and plunges from the first, Obsidian Tzitzimitl and the skill's cooldown from the second, and Ice Storm, the burst's cooldown and its energy cost from the third. The charged attack costs 50 stamina, and Ice Storm costs 60 energy.

## Not yet built

- **Itzpapa and the Opal Shield wait on the Nightsoul hook.** Obsidian Tzitzimitl summons Itzpapa and gives the party's active character a shield that scales with Elemental Mastery, and the Opal Fire state those start is the Nightsoul state the framework does not hold. The skill's hit is built; the summon and the shield are not, so the skill has no shield in this kit.
- **The Spirit Vessel skulls wait on a timed hit.** Ice Storm summons a skull on each enemy within 7 of Citlali, and each lands at a random time between 87 and 117 frames after the burst's hit. The framework's hitmarks are fixed, so the skulls are not built, and the burst's hit is Ice Storm alone.
- **Ascension 1 and 4 and Constellations 1, 2, 4 and 6 wait on the Nightsoul hook.** Each reads the Nightsoul points, the Nightsoul burst, the Opal Fire state, Itzpapa or the Opal Shield, so none is built.

## Decisions

- **The strikes land 10 frames after their hitmarks.** gcsim queues each strike with a 10-frame travel, so each lands at its hitmark plus 10, as the bow kits and Ororon do.
- **Her strikes and charged attack give no poise.** gcsim gives them none, so they read 0, as Ororon's do. This is on the roadmap's manual verification list through Ororon's poise question.
- **Her plunges are the shared table's, with no gcsim plunge file to time them.** The collision, low and high plunge read the proud group's 5, 6 and 7, and they land as their action starts with a zero animation, as the Ororon kit does. The roadmap's manual verification list asks about them.

## Key files

| File                                                               | Role                                                                                                                                                                   |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/citlaliKit.ts` | `createCitlaliKit`, Citlali's strikes, charged attack, Obsidian Tzitzimitl, Ice Storm and plunges, with Itzpapa, the Opal Shield and the skulls waiting on their hooks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/main/internal/characters/citlali), MIT, at main: Citlali's strikes' hitmarks and cancels, the charged attack's and Ice Storm's frames and reaches, Obsidian Tzitzimitl's hit, and the Nightsoul passives and skulls the hooks wait on.
