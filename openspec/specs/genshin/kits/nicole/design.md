# Nicole

Nicole's kit is its record and one behaviour module, `createNicoleKitBehaviour`, avatar 10000131: her three strikes, the charged attack, the collision, the two plunges, the skill's hit and the burst's hit. Both her skill and her burst are Pyro.

Her cooldowns are 16 and 15 seconds, her energy cost 60 and her charged stamina 50, all read from the table, and her skill and burst take their talent multipliers from proud skill groups.

gcsim sources: Nicole's attack, charge, skill and burst files, with the table data in gcsim's Nicole data file.

## Decisions

- **The burst's hit is priced round the targeting zone.** Her burst is a circle of 6.5 metres on her primary target, which an area holds as the targeting zone's radius plus its own, 21.5 metres, as gcsim's target-centred area.
- **The skill's hit is a circle of 5 metres round her body**, recorded by hand, as its hitbox has no name in gcsim's press list, and Nicole's overlay is empty, so it names no cause for it.

## Not built

- **The burst's projections wait on the projection hook.** Each projection is a copy of a character's skill that Nicole's burst asks of that character, which a kit cannot read yet. The record holds her burst's own hit alone.
- **Her passives wait on their hooks.** Each one reads her projections or the party's Elemental Resonance, so none is built.

## Key files

| File                                                              | Role                                                                                       |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/nicoleKit.ts` | `createNicoleKitBehaviour`, Nicole's module; it reads her record and adds no behaviour yet |
| `packages/genshin-world/src/data/kits/nicole.json`                | Nicole's overlay: empty, so her hitboxes name no cause                                     |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/nicole), MIT: the timings of her strikes, her charged attack, skill, burst and elements, and her table data file.
