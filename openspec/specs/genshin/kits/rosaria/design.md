# Rosaria

Rosaria's kit is its record and one behaviour module, `createRosariaKitBehaviour`, on avatar 10000045: a seven-hit string over five normal attacks, a charged attack, then a collision and two plunges, Ravaging Confession with its two hits and cooldown, and Rites of Termination with its slash, lance and field of ticks. Her multipliers are read from proud skill groups 4531, 4532 and 4539; the charged attack's stamina, the skill's cooldown, and the burst's seconds, cooldown and energy cost are read from the same groups. The field ticks every two seconds from the cast's body, each tick a circle that sits three metres ahead of the body, and Constellation 2 adds four seconds to it. Ravaging Confession's reach prices from the body, as Rosaria's teleport behind the target is not built, and her passives and her other constellations are not built, as no kit event reaches them. The strikes' and the charged attack's poise, the plunges' frames, and the charged attack's stamina's meaning, read by its place in the table, are provisional.

## Key files

| File                                                               | Role                                                                                                                                                 |
| :----------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/rosariaKit.ts` | `createRosariaKitBehaviour`, Rosaria's kit with her seven-hit string, Ravaging Confession and Rites of Termination's slash, lance and field of ticks |
