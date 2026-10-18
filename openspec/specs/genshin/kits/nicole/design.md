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
- **A projection copies the active character's elemental hit at her element and her hitbox.** It is dealt as the projected character's own element, reaches the enemies inside the projected character's hitbox anchored on the enemy the hit struck, and lands 30 frames after the hit. The hitbox is gcsim's `projectionHitbox` table, with the default circle for a character the table does not name.
- **A projection reaches by its hitbox alone.** Its hit has no area of its own, since its target and its hitbox decide what it reaches.
- **The projections follow the kit's elemental hit event, not every hit.** gcsim's enemy-hit event fires for each hit on an enemy, but the kit raises its `ElementalHit` event only for a hit with an element, so a physical hit by the active character projects nothing here. This is a gap against gcsim, left for the hook's owner to settle.
- **The Hexerei bonus is priced at the projection's tick.** gcsim's `hexereiOnProjection` adds three times her attack when she and the projected character are Hexerei and two or more Hexerei are deployed. The set is provisional (`countKitHexereiMembers.ts`), so the bonus is too.

## Not built

- **Her passives wait on their hooks.** Each one reads her projections or the party's Elemental Resonance, so none is built.

## Key files

| File                                                              | Role                                                                                                                            |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/nicoleKit.ts` | `createNicoleKitBehaviour`, Nicole's module: her skill's shield and team buff and her burst's projections; her passives wait    |
| `packages/genshin-world/src/data/kits/nicole.json`                | Nicole's overlay: her skill's shield and buff parameters (talent table group 13132) and her projection multiplier (group 13139) |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nicole), MIT: the timings of her strikes, her charged attack, skill, burst and elements, and her table data file.
