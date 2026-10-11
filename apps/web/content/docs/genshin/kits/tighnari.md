---
title: Tighnari
description: Tighnari's kit as built: his four strikes, a fully charged shot, a collision and two plunges, Vijnana-Phala Mine, and Tanglevine Shaft with its secondary, with Vijnana Suffusion's Wreath Arrow and his passives left unbuilt.
---

# Tighnari

Tighnari's kit is one module, `createTighnariKit`, avatar 10000069: four strikes, a fully charged shot, a collision and two plunges, Vijnana-Phala Mine, and Tanglevine Shaft with its Secondary Tanglevine Shaft. His multipliers are read from proud skill groups 6931, 6932 and 6939; Vijnana-Phala Mine's cooldown and Tanglevine Shaft's cooldown and energy cost come from the same groups. The particles are not built.

Not yet built: Vijnana Suffusion's Wreath Arrow, which turns the fully charged shot into a shot of its own while the suffusion lasts, since the kit offers no charged variant yet; and the passives and constellations, which wait on the passive hook.

## Decisions

- **Each action ends at its gcsim cancel, and its arrows land on their own.** Tanglevine Shaft's six hits and its secondary's six land from 112 to 175 frames, past the 118-frame animation; the strikes' arrows land past their cancels, and the fully charged arrow at 96 frames, past its 94. Each is the action's own hit, queued past its end as gcsim queues it, so a later action or a swap does not stop it.
- **Vijnana-Phala Mine's area is a circle of radius 6 round the primary target,** priced as the skill's targeting reach plus the circle, as the Celestial Shower's field is.
- **Tighnari's arrows, Vijnana-Phala Mine and Tanglevine Shaft deal 0 poise.** gcsim gives them no poise, so `tighnariKit.ts` reads each as 0.

## Key files

| File                                                                | Role                                                                                              |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/tighnariKit.ts` | `createTighnariKit`, Tighnari's kit with Vijnana-Phala Mine and Tanglevine Shaft, and its plunges |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/tighnari), MIT: Tighnari's strikes' hitmarks and cancels, the fully charged shot's frames, Vijnana-Phala Mine's hitmark and radius, and Tanglevine Shaft's hits and their timings.
