# Kirara

Kirara's kit is its record and one behaviour module, `createKiraraKitBehaviour`, on avatar 10000061: four strikes, a charged attack of three hits, a collision and two plunges, Tail-Flicking Flying Kick with its shield and Dendro self-infusion, its short hold and its holds of one to ten seconds with Urgent Neko Parcel's cat ticks and Flipclaw Strike's kick, and Secret Art: Surprise Dispatch's box with six Cat Grass Cardamoms, two detonating at 180 frames and four at expiry. Her multipliers are read from proud skill groups 6131, 6132 and 6139; the press's cooldown, the holds' cooldowns, the longest hold, the charged attack's stamina, and the burst's mines come from the same groups. Her passives and constellations sit outside the kit, and the short hold's 8.2-second cooldown and the mines' six count are gcsim's own values. The poise, the plunges' seconds and reaches, and the short hold's minimum is provisional.

## Decisions

- **Kirara's strikes, charged attack, skill and burst are priced at 0 poise.** Provisional: `kiraraKit.ts` sets each at 0, gcsim giving none; her plunges' reaches and 0.4 seconds are the other kits' stand-ins.

## Key files

| File                                                              | Role                                                                                                                                                                                   |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kiraraKit.ts` | `createKiraraKitBehaviour`, Kirara's kit with Tail-Flicking Flying Kick's shield, her short hold and holds, Urgent Neko Parcel and Secret Art: Surprise Dispatch's Cat Grass Cardamoms |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/kirara), MIT: the kit's hitmarks, cancel frames and areas, reaches, the charged attack's three circles, Tail-Flicking Flying Kick's fan, the short hold's and the holds' cat ticks and kicks, the shield's duration, and Secret Art: Surprise Dispatch's box, mines and expiry.
