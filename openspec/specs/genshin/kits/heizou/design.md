# Heizou

Heizou's kit is its record and one behaviour module, `createHeizouKitBehaviour`, avatar 10000059: five strikes with the fourth's three hits, a charged attack, a collision and two plunges, Heartstopper Strike's press and its full hold with the Declension stacks and Conviction bonus, and Fudou Style Vacuum Slugger with its Windmuster Iris. His multipliers are read from proud skill groups 5931, 5932 and 5939; the charged attack's table index and stamina, the Iris's multiplier, the skill's and burst's cooldowns and the burst's energy cost are read from the same groups. Every hit of his is Anemo, at gcsim's Durability: 2U from Heartstopper Strike, none from the plunge collision and 1U from the rest. The hold is gcsim's full charge, which releases at three seconds with four stacks.

The burst lands an aura check just before its hit, with no damage, element or poise. Each of the first four enemies it strikes in a cast is tagged, and one holding Pyro, Hydro, Electro or Cryo, the first of them in gcsim's priority, has a Windmuster Iris cast where it stands, which explodes 40 frames on in that element, 1U, round it. His passives and constellations are not built.

## Decisions

- **Heizou's hold is gcsim's full charge.** gcsim's Heartstopper hold charges its four Declension stacks over 180 frames, so the kit's hold is one level at three seconds, and a shorter hold reads as the press. His strikes, charged attack, plunges, skill and burst give no poise, as gcsim gives none.
- **Windmuster Iris reads the aura from a hit of its own, ahead of the burst's Anemo.** gcsim queues a no-damage aura check on the burst's frame ahead of its Anemo hit, so the Swirl the hit triggers does not take the aura first. The kit's burst holds the same check as its first hit, and the kit reads the aura of each enemy it strikes as the damage it took reaches it. The Iris is a summon on the enemy as the check found it, where gcsim's circle follows the enemy over the 40 frames.

## Key files

| File                                                              | Role                                                                                                                                                                      |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/services/kit/characters/heizouKit.ts` | `createHeizouKitBehaviour`, Heizou's kit with Heartstopper Strike's press and full hold, Fudou Style Vacuum Slugger with its Windmuster Iris, and his strikes and plunges |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/heizou), MIT: the kit's hitmarks, cancel frames and areas, the charged attack's frames and box, the plunges' frames and circles, Heartstopper Strike's hit, box and frames, its full hold's 180 frames and Declension and Conviction bonuses, Fudou Style Vacuum Slugger's circle and hitmark, Windmuster Iris's aura check, its four tags, the order it takes an aura in, its 40-frame delay and its circle, and the Durability of every hit.
