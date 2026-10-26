# Charlotte

Charlotte's kit is its record and one behaviour module, `createCharlotteKitBehaviour`, on avatar 10000088: three Cryo strikes, a charged attack that sets off Spiritbreath Thorn, a collision and two plunges, Framing's press and Still Photo. Her multipliers are read from proud skill groups 8831, 8832 and 8839. The charged attack's stamina, the press's cooldown, and the burst's cooldown and energy cost are read from the same groups.

Framing's press is a Cryo box 4 metres wide and 8 long from the body. Each enemy it strikes gets a Snappy Silhouette mark for 6.8 seconds, which ticks a single-target Cryo hit every 1.5 seconds, the hit landing at the tick itself, as gcsim queues it with no delay at `skill.go` line 220 (its reader's 90 frames are the tick's interval from the mark, which the mark's status gives), and a press marks no more than five enemies. Spiritbreath Thorn strikes 30 frames after the charged attack's hit, a circle of radius 2.5 round the point the target stood at when the charged attack started, as gcsim takes it at `charge.go` line 57, not where the target stands at the hit, and its six-second cooldown starts when it strikes. Still Photo strikes a circle of radius 6 4.5 metres ahead of the body at 53 frames, and its cast heals every member of the party by a flat amount and a share of Charlotte's ATK. Kamera strikes the same circle eight times, and each tick heals whoever is on the field by a flat amount plus a share of her ATK while it stands within 7 metres of the cast point.

Not built yet:

- **Framing's hold and Focused Impression.** Its hit falls a held duration after the press, and a skill's hold levels are fixed, so it waits on a hold whose hitmark follows the seconds held.
- **Ascension 1**, which cuts the press's cooldown when a marked enemy dies, waits on an enemy-death kit event.
- **Ascension 4's Healing Bonus and Cryo DMG Bonus by region are built.** Each other member from Fontaine adds 5% Healing Bonus to Charlotte, and each other member from outside it adds 5% Cryo DMG Bonus, from the deployed combatants and their `regionId`, as gcsim v2.47.2 (MIT) `charlotte/asc.go` gives them. The `regionId` is the catalogue region the character's association names.
- **Constellation 6**, the summation strike and heal on hold-marked enemies, waits on Focused Impression's mark.

Constellations 1, 2 and 4 are built on the events and hits the framework has. Constellation 1 starts on each `HealthChanged` event whose source is Charlotte, which `changeKitMemberHealth` records for each of her heals: the member it lands on gets a six-second status, one at a time through `startKitCooldown`, is healed at once for 80% of her ATK, and is healed again every two seconds from a `schedulePeriodicKitTask`, as gcsim's `c1Heal` does. Constellation 2 counts the press's hits on enemies, up to three, from the press's own start, and raises her ATK by 10% for each count as a buff under one source for 12 seconds, so each hit restarts it. Constellation 4 counts the burst's hits, Still Photo's and Kamera's, on an enemy the press marked: the count is the stacks of a status that starts with the first counted hit and runs 20 seconds, each counted hit gives 2 energy, and `getStrikeDamageBonus` raises those hits' DMG by 10% while fewer than five are counted. gcsim's Constellations 2 and 4 also read the hold's hits and Focused Impression mark, which are not built, so both read the press alone here.

Gcsim gives her strikes, charged attack and plunges no poise, so each takes the wiki's: 8.133 to 12.113 on the three strikes, 80 on the charged attack, 5 on the collision, and 50 and 100 on the low and high plunges. Her Snappy Silhouette mark's hit takes the wiki's 20, as gcsim gives it none too. The charged attack's stamina is the table's flat value at index 4, which gcsim does not give. Each is provisional until a recording settles it.

## Key files

| File                                                                 | Role                                                                                                                                                                                          |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/charlotteKit.ts` | `createCharlotteKitBehaviour`, Charlotte's kit with her strikes, charged attack and Spiritbreath Thorn, plunges, Framing's press and its marks, and Still Photo with its cast heal and Kamera |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/charlotte), MIT: her strikes' hitmarks, cancel frames and radii, the charged attack and Spiritbreath Thorn, the plunges' frames and radii, Framing's press and its marks, and Still Photo's hit, heals and Kamera's ticks, and Constellations 1, 2 and 4.
