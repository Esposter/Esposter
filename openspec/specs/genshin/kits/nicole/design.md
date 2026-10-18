# Nicole

Nicole's kit is its record and one behaviour module, `createNicoleKitBehaviour`, avatar 10000131: her three strikes, the charged attack, the collision, the two plunges, the skill's hit, shield and team buff, the burst's hit and its projections. Both her skill and her burst are Pyro.

Her cooldowns are 16 and 15 seconds, her energy cost 60 and her charged stamina 50, all read from the table, and her skill and burst take their talent multipliers from proud skill groups.

gcsim sources: Nicole's attack, charge, skill and burst files, with the table data in gcsim's Nicole data file.

## Decisions

- **The burst's hit is priced round the targeting zone.** Her burst is a circle of 6.5 metres on her primary target, which an area holds as the targeting zone's radius plus its own, 21.5 metres, as gcsim's target-centred area.
- **The skill's hit is a circle of 5 metres round her body**, recorded by hand, as its hitbox has no name in gcsim's press list, so it names no cause for it.
- **The skill's shield and team buff come on at frame 8, one frame before its hitmark.** gcsim queues both on her task at `skillHitmark-1`, so they land together, and a recast removes the buff it gave at cast, before its own snapshot, as gcsim deletes it there.
- **The shield is cast by Nicole and covers the team.** gcsim's shield targets the whole team, and a kit's shield carries its caster, which `castKitShield` takes as Nicole.
- **The buff reaches each deployed member, Nicole included.** gcsim applies it to every character in the party, so it goes to each member `getDeployedCharacterIds` returns.
- **The burst starts its status one frame after its hit.** gcsim's task at `burstHitmark+1` starts `burstKey` and clears the projections, so a hit before frame 109 projects nothing, and a recast removes the status it gave at cast.
- **A projection copies each hit the active character lands, at its own element and hitbox.** It is dealt as the projected character's own element, reaches the enemies inside the projected character's hitbox anchored on the enemy the hit struck, and lands 30 frames after the hit. The hitbox is gcsim's `projectionHitbox` table, with the default circle for a character the table does not name.
- **A projection reaches by its hitbox alone.** Its hit has no area of its own, since its target and its hitbox decide what it reaches.
- **The projections follow every hit of the active character, physical included.** gcsim's enemy-hit event fires for each hit on an enemy, and the kit raises its `EnemyHit` event for each one, carrying the element the hit was dealt as where it deals one. A physical hit projects too, dealt at the projected character's element.
- **The Hexerei bonus is priced at the projection's tick.** gcsim's `hexereiOnProjection` adds three times her attack when she and the projected character are Hexerei and two or more Hexerei are deployed. The set is the wiki's Hexerei Characters category (`countKitHexereiMembers.ts`), so the bonus follows it.
- **The ascension buff is an upgrade bounded by her skill's buff.** gcsim's `a1UpgradeBuff` (`asc.go`) gives the character the upgrade for as long as the skill's buff on it stands at most, and a repeat upgrade replaces the mod with the same key, so `upgradeAscensionBuff` removes the old buff before it adds the new one. Her skill's cast takes every upgrade off, as `a1OnSkillRemoveBuff` does at `skill.go`'s cast.
- **A swap's upgrade is a pending field, so a later swap cancels it.** gcsim's `a1Src` token makes a queued upgrade return when a newer swap has set it. The kit keeps the pending upgrade as a field with the id `nicole-a1-swap` and removes it before a swap schedules its own. A Hexerei swapped in gets a task with no delay, as gcsim's `delay = 0` for `char.IsHexerei` does.
- **A swap away takes the upgrade off the character it leaves before the sixth constellation.** gcsim's OnCharacterSwap subscriber deletes `a1Key` on the previous character unless `c6DeleteA1OnSwap` holds.
- **The fourth ascension reads the element of the active character's hit.** gcsim's `a4Init` (`asc.go`) upgrades her own buff on each elemental hit by the active character. A physical hit carries no element in the kit, so it is excluded.
- **The first constellation projects from each hit of the active character, on a cooldown of its own.** gcsim's `c1Init` (`cons.go`) takes any hit of the active character with no element filter, so a physical hit projects at the striker's element. Its six-second cooldown is Nicole's own (`nicole-c1-icd`), separate from the burst's three-second one, and it shares the burst's scheduling and Hexerei bonus, with multiplier six and a 4.5-metre circle about the enemy in place of the burst's own.

## Not built

- **Her second and later constellations wait.** The second's team buff and RES ticker are feasible with the kit's hooks. The fourth's flat damage sized by her attack and the sixth's defence ignore need hooks the kit does not have, and the sixth's self buff for the skill's remaining time waits with them.

## Key files

| File                                                              | Role                                                                                                                                                                                                                 |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/nicoleKit.ts` | `createNicoleKitBehaviour`, Nicole's module: her skill's shield and team buff, her burst's projections, and her first and fourth ascension buffs and first constellation's projection; her later constellations wait |
| `packages/genshin-world/src/data/kits/nicole.json`                | Nicole's overlay: her skill's shield and buff parameters (talent table group 13132) and her projection multiplier (group 13139)                                                                                      |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nicole), MIT: the timings of her strikes, her charged attack, skill, burst and elements, and her table data file.
