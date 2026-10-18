# Xianyun

Xianyun's kit is its record and one behaviour module, `createXianyunKitBehaviour`, on avatar 10000093: four strikes, a charged attack, a collision and two plunges, Skyladder's first press, and Stars Gather at Dusk's hit. Her multipliers are read from proud skill groups 9331, 9332 and 9339; its cooldowns and the burst's energy cost are the same groups' too. Driftcloud Wave, the plunges that replace hers while Skyladder's state stands, is not built, and neither are Starwicker, her burst's heals, the airborne buff the burst gives the party, her passives, or Constellations 4 and 6. Constellation 2's ATK buff is built, below. The poise is provisional at 0, as gcsim gives none.

## Not built

- **Driftcloud Wave** — while Skyladder's state stands, a plunge plays Driftcloud Wave's leap at 4, 5 or 6.5 metres in place of the standard plunge, and the state's two further presses play their own Skyladder. A kit's plunges have no variant, as its burst and its skill holds do, so the plunge waits on a plunge variant: a `KitVariant` on `highPlunge` and `lowPlunge`, checked on the step the plunge lands. Skyladder's once-per-enemy-per-state limit waits on a hit that strikes each enemy once per state.
- **Starwicker** — the burst's plunge hook. While the burst's airborne buff stands on the active character, a plunge of any party member deals Starwicker at 4.8 metres, up to 8 times, and heals the party on its own timer. It waits on a reaction to a party member's plunge landing, which `KitEventKind` does not yet carry.
- **The burst's heals** — the instant heal at the burst's hitmark, and the continuous heals every 2.5 seconds for 16 seconds. `KitPartyHeal` rides a hit only as the hit strikes an enemy, so a heal with no enemy struck waits on a party heal the kit's own timer can give.
- **The airborne buff** — the higher jumps it gives the party. It waits on a party buff the controller's jump reads.
- **Passives and Constellations 4 and 6** — not built.
- **Constellation 1's extra charge is a skill charge.** White Clouds at Dawn's second charge before its cooldown is a charge count, so Constellation 1 adds one through `getSkillChargeBonus`, as Ganyu's Constellation 2 does.

## Constellation 2

From Constellation 2, each White Clouds at Dawn press gives Xianyun 20% ATK for 15 seconds, as gcsim's `c2buff` does from its skill function ([gcsim `cons.go`](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/xianyun/cons.go), MIT). The buff is a `buffKitMember` on her own `AttackPercent`, keyed by attribute and source, so a press restarts the 15 seconds rather than stacking a second buff, as gcsim's `AddStatMod` under its one key does.

## Key files

| File                                                               | Role                                                                                                                                              |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/xianyunKit.ts` | `createXianyunKitBehaviour`, Xianyun's kit with her four strikes, charged attack, plunges, Skyladder's first press and Stars Gather at Dusk's hit |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xianyun), MIT: the strikes' hitmarks, cancel frames and circles, the charged attack's frames and circle, the plunges' frames and circles, Skyladder's press and Stars Gather at Dusk's hit, and the travel each strike takes.
- The game's proud skill groups 9331, 9332 and 9339, read through the hosted talent multipliers: each multiplier and cooldown matches gcsim's table at talent level 1.
