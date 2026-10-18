# Chiori

Chiori's kit is its record and one behaviour module, `createChioriKitBehaviour`, on avatar 10000094: four strikes with the third of two hits, a charged attack of two thrusts, a collision and two plunges, Fluttering Hasode's upward sweep with its Tamoto doll and its hold, and Hiyoku: Twin Blades. Her multipliers are read from proud skill groups 9431, 9432 and 9439, and match gcsim's values to four decimal places. Her damage that scales with Defense is each hit's additive base damage, read from its striker as it is priced, as Zhongli's Max HP share is.

## Decisions

- **Tamoto is a summon cast where Chiori stands.** Its five attacks land at 60, 276, 492, 708 and 924 frames, from its first attack's 36 frames of start delay and 5 of attack delay, then every 216 frames while it stands. Each strikes a circle of radius 1.2 on the target it finds within 12 metres, priced as the search's radius plus the circle's, so the reach is 13.2 metres from the body. gcsim places the doll 1.2 metres to Chiori's side, which is not built, so its reach is priced from her body.
- **The press and the hold differ by their sweep and their doll's cast.** The press's upward sweep lands at 21 frames and casts Tamoto at 19, lasting until 1069 frames; the hold's sweep lands at 37 frames and casts Tamoto at 34, lasting until 1084 frames. The sweep is a box from her body 3.5 metres ahead and 5.5 wide, priced to its far corner.
- **Upward Sweep and Tamoto price their Defense share as additive base damage.** The sweep is its ATK share plus 1.866 of her Defense, and Tamoto 0.8208 of ATK plus 1.026 of Defense per attack, each added as flat damage to the base damage.
- **The press's cooldown is the table's 16 seconds, and the burst's is 13.5 seconds on 50 energy.** Her burst strikes at 92 frames as a circle of radius 12 round her, 200 poise, its ATK share and 3.204 of Defense.
- **Tamoto stands for gcsim's 17.5 seconds, where the table's duration reads 17.** The doll's last attack landing within the 17.5 seconds of its cast would confirm it; a stand of 17 would move it.
- **Chiori's high plunge lands with the low plunge's 41 frames at 150 poise.** gcsim has no high plunge of its own, so `chioriKit.ts` takes the 150 poise gcsim gives Arlecchino's; provisional until a recording shows the frames and amount.

## Not built

- **Her ascension passives are not built.** They add to her Tamoto and to her sweep and burst, and the kit framework has no hook for them yet, so they are left out rather than approximated.
- **Her constellations are not built.** Their effects, including the Kinu her burst calls and the constructs her Geo passives depend on, have no hook in the kit framework yet, so none is approximated.
- **Hold's threshold is provisional.** The half second a press must be held is Zhongli's, as no source gives Chiori's, and it is on the roadmap's Manual verification list.

## Key files

| File                                                              | Role                                                                                                                                      |
| :---------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/chioriKit.ts` | `createChioriKitBehaviour`, Chiori's kit with her strikes, charged attack, plunges, Fluttering Hasode with Tamoto and Hiyoku: Twin Blades |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/chiori), MIT: the kit's hitmarks, animations, reach, Tamoto's ticker and its 12 metre search, the upward sweep's box, the burst's circle, and the proud group indices behind each multiplier.
