---
title: Tighnari
description: Tighnari's kit as built: his four strikes, a fully charged shot, a collision and two plunges, Vijnana-Phala Mine, and Tanglevine Shaft with its secondary, with Vijnana Suffusion's Wreath Arrow and his passives left unbuilt.
---

# Tighnari

Tighnari's kit is one module, `createTighnariKit`, avatar 10000069: four strikes, a fully charged shot, a collision and two plunges, Vijnana-Phala Mine, and Tanglevine Shaft with its Secondary Tanglevine Shaft. His multipliers are read from proud skill groups 6931, 6932 and 6939; Vijnana-Phala Mine's cooldown and Tanglevine Shaft's cooldown and energy cost come from the same groups. The particles are not built.

Not yet built: Vijnana Suffusion's Wreath Arrow, which turns the fully charged shot into a shot of its own while the suffusion lasts, since the kit offers no charged variant yet; and the passives and constellations, which wait on the passive hook.

## Decisions

- **Tanglevine Shaft's twelve hits are cast with the burst.** Its six hits and its secondary's six land from 112 to 175 frames, past the 118-frame animation, so they are a summon cast at the body, as a hit past the animation would never land in the action.
- **The normal attacks run until their arrows land.** A strike's action is as long as its cancel or its arrow's landing, whichever is later, so the arrow lands within the action it was thrown in.
- **Vijnana-Phala Mine's area is a circle of radius 6 round the primary target,** priced as the skill's targeting reach plus the circle, as the Celestial Shower's field is.

## Key files

| File                                                                | Role                                                                                              |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/tighnariKit.ts` | `createTighnariKit`, Tighnari's kit with Vijnana-Phala Mine and Tanglevine Shaft, and its plunges |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/tighnari), MIT: Tighnari's strikes' hitmarks and cancels, the fully charged shot's frames, Vijnana-Phala Mine's hitmark and radius, and Tanglevine Shaft's hits and their timings.
