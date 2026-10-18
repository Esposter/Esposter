# Tighnari

Tighnari's kit is its record and one behaviour module, `createTighnariKitBehaviour`, on avatar 10000069: four strikes, a fully charged shot, a collision and two plunges, Vijnana-Phala Mine, and Tanglevine Shaft with its Secondary Tanglevine Shaft. His multipliers are read from proud skill groups 6931, 6932 and 6939; Vijnana-Phala Mine's cooldown and Tanglevine Shaft's cooldown and energy cost are read from the same groups.

Not yet built: Vijnana Suffusion's Wreath Arrow, which turns the fully charged shot into a shot of its own while the suffusion lasts, since the kit offers no charged variant yet; its Ascension 1 passive, and Constellations 2 and 6. Constellations 1 and 4 are built.

## Decisions

- **Each action ends at its gcsim cancel, and its arrows land on their own.** Tanglevine Shaft's six hits and its secondary's six land from 112 to 175 frames, past the 118-frame animation; the strikes' arrows land past their cancels, and the fully charged arrow at 96 frames, past its 94. Each is the action's own hit, queued past its end as gcsim queues it, so a later action or a swap does not stop it.
- **Vijnana-Phala Mine's area is a circle of radius 6 round the primary target,** priced as the skill's targeting reach plus the circle, as the Celestial Shower's field is.
- **Tighnari's arrows, Vijnana-Phala Mine and Tanglevine Shaft deal 0 poise.** gcsim gives them no poise, so its record reads each as 0.
- **Constellation 1's CRIT Rate reads the Charged Attack tag.** It raises every strike tagged Charged Attack by 15%, as the Ascension 4 damage bonus reads the same tag.
- **Constellation 4 buffs the team as the burst starts.** gcsim gives every character on the roster 60 Elemental Mastery for 8 seconds as the burst is cast, and the kit gives every deployed member the same. gcsim raises that to 120 when the burst triggers Burning, Bloom, Lunar-Bloom, Quicken or Spread, refreshing the 8 seconds. The kit reads the reaction event's attack tag (`ReactionTriggered` carries the triggering hit's `KitHit.attackTag`) and the burst's reactions, and raises each member's buff from the same source to 120 through `buffKitTeam`, as gcsim's Constellation 4 sets each member's mod to 120 under the same key.

## Key files

| File                                                                | Role                                                                                                                      |
| :------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/tighnariKit.ts` | `createTighnariKitBehaviour`, empty: his strikes, plunges, Vijnana-Phala Mine and Tanglevine Shaft are his record's alone |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/tighnari), MIT: Tighnari's strikes' hitmarks and cancels, the fully charged shot's frames, Vijnana-Phala Mine's hitmark and radius, and Tanglevine Shaft's hits and their timings.
