# Mualani

Mualani's kit is its record and one behaviour module, `createMualaniKitBehaviour`, on avatar 10000102: three strikes, a charged attack, a collision and two plunges, and Boomsharka-laka. Her multipliers are read from proud skill groups 10231, 10232 and 10239, and match gcsim's values to four decimal places. Boomsharka-laka's damage is her share of Max HP, read off her Max HP as the hit is priced, as Nilou's and Kokomi's are.

## Decisions

- **Her strikes and charged attack are her kit outside the Blessing.** Each strike is a circle of radius 0.7 on the target, priced as the targeting reach plus its radius, and the charged attack is a circle of radius 3.5 one metre ahead of her. Out of idle the charged attack carries gcsim's 13-frame windup, so it hits at 84 frames of 113.
- **Boomsharka-laka lands at 178 frames of its 180.** gcsim queues its one hit at 108 frames, travelling 70 frames to its target, and the hit lands on the world's clock past the action's cancel frame, as the framework lands every such hit. The circle is radius 5 round the target.
- **The skill's press enters the blessing and has no hit.** The press enters the Nightsoul Blessing with 60 points, which drain ten a second as gcsim's do, and a press in it leaves it. Its six-second cooldown runs from the press here, where gcsim runs it from the blessing's end, and its hit waits on Sharky's Bite.
- **Her plunges borrow the framework's plunge reach, provisionally.** gcsim has no plunge for Mualani, its plunge handlers returning "not implemented", so each plunge hits as its action starts with the reach a kit without a gcsim plunge borrows, and no poise. Their multipliers are the table's at 5, 6 and 7, each the standard share of the collision. On the roadmap's Manual verification list.

## Not built

- **Sharky's Bite and the blessing's strike replacement are not built.** In the blessing her strikes are replaced by Sharky's Bite, which forbids her charged attack, and a press ends it; the swap that also ends it is not built. The entry and the point drain are built.
- **Sharky's Bite, its momentum and its Surging Bite are not built.** They are the Blessing's normal attacks, and they wait on the Blessing above. Their marks on an enemy, which spread the Shark Missile to the marked enemies round the one struck, wait on it too.
- **Surfing and the momentum it gives are not built.** While surfing in the Blessing, a Surfing Hit strikes an enemy in her path and gives it a mark and momentum stacks. It waits on a field that ticks on the body's movement while the Blessing stands, which the framework has for fields but not for a Blessing's movement, and on the Blessing above.
- **Ascension passives and constellations are not built.** Her Ascension 4 burst bonus and her constellations, including the Puffer's momentum and points, are the [character kits proposal](../../../../changes/genshin-character-kits/design.md)'s passives and the [constellations](../../../../changes/genshin-constellations/design.md) page's.

## Key files

| File                                                               | Role                                                                                                     |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/mualaniKit.ts` | `createMualaniKitBehaviour`, Mualani's kit with her strikes, charged attack, plunges and Boomsharka-laka |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mualani), MIT: the hitmarks, animations and reach of the kit, the charged attack's windup and Boomsharka-laka's travel, and the proud group indices behind each multiplier.
- [Hosted game data](../../hosted-game-data/design.md): the avatar's talent groups 10231, 10232 and 10239 and her skill depot, read from the talent and skill kit tables.
