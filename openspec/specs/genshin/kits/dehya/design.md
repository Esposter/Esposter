# Dehya

Dehya's kit is its record and one behaviour module, `createDehyaKitBehaviour`, on avatar 10000079: four strikes, a charged attack, a collision and two plunges, and Molten Inferno's initial Pyro circle of radius 5, which lands at 20 frames. Her multipliers are read from proud skill groups 7931, 7932 and 7939; the skill's cooldown and the burst's cooldown and energy cost are read from the same groups. Her strikes are blunt, as gcsim gives them, and her plunges take gcsim's timings and poise.

Gcsim gives Dehya no charged attack, its attack file leaving it a TODO. The charged attack here takes the table's shape, as Dori's does: a spin at once and a final hit at the table's maximum duration, each a circle of radius 2 round the body, with the stamina per second the table gives. Its collision deals no poise, as gcsim gives none. Both are provisional until a recording settles them. Dehya is a claymore, so the shared no-action-file rule for a claymore's charged attack is the source its frames and hitmarks differ from, its values held in `scripts/src/services/genshinAssets/kits/constants.ts`; the overlay names those three values `DiffersFromSource`.

Not built yet: the Sanctum her skill leaves, its Molten Inferno DoT, which strikes an enemy each time it takes damage in the field, and Redmane's Blood, which takes a share of the damage her party takes in the field and gives it back to her as a DoT, as it waits on the wearer's HP; Ranging Flame's reposition; her burst's punches and Incineration Drive, which play no hits yet (the burst's animation is its first punch's 105 frames); her Ascension and Constellation passives. The field and its mitigation wait on a hook for an enemy's damage and the wearer's HP.

## Key files

| File                                                             | Role                                                                                                              |
| :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/dehyaKit.ts` | `createDehyaKitBehaviour`, Dehya's kit with her strikes, charged attack, plunges and Molten Inferno's initial hit |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/dehya), MIT: Dehya's strikes' hitmarks, cancel frames, reaches and poise, Molten Inferno's initial hit and its animation, the plunges' timings and poise, and the burst's first punch.
