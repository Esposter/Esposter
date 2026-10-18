# Traveler

The Traveler's kit is her record alone, with `createTravelerKitBehaviour` adding nothing to it, and it is the first kit, at talent level 1. Its hitmarks and seconds are gcsim v2.47.2's frames, and the plunges' poise is gcsim's pyro plunge's. gcsim sets no poise on the Anemo skill or burst, so both hit with none. Its strikes' poise is not in that file, so each is provisional, as are the charged attack's and the plunge collision's. Its multipliers are read from the Anemo form's proud skill groups, 731 for the attacks, 732 for Palm Vortex and 739 for Gust Surge. Those agree with the wiki's values to two decimal places. The normal attacks match gcsim's to four decimal places, gcsim's own rounding of the last place aside, and the charged attack's and Palm Vortex's exactly, while Gust Surge's 739 matches none of gcsim's values, gcsim's Gust Surge multiplier being 0.376 at level 1 against 739's 0.808. The charged attack's second hit is 731's 0.7224, where the male form's group 730 gives 0.60716, so the kit reads 731 for it. A hit can name its own element, which strikes the enemy as that element whatever the character's own is. The Traveler's hits name none, so they deal the element of the Traveler's form, which is none until a statue gives one.

## Decisions

- **The Traveler's Anemo set** holds a skill of 5 seconds, one charge, and a burst of 15 seconds for 60 energy, which her record holds beside its hits.

## Key files

| File                                                     | Role                                                                           |
| :------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/travelerKit.ts` | `createTravelerKitBehaviour`, the Traveler's behaviour, none beyond her record |

## Sources

- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/traveler/anemo/lumine), MIT: the Anemo form's config and talent file.
- [gcsim v2.47.2](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/traveler/common/anemo), MIT: the Traveler's anemo attack, skill and burst frames, and the multipliers of its [stats file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/anemo/stats.go).
- [gcsim v2.47.2 pyro plunge file](https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/traveler/common/pyro/plunge.go), MIT: the plunges' poise, 100 for the low plunge and 150 for the high.
