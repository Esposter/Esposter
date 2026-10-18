# Wriothesley

Wriothesley's kit is its record and one behaviour module, `createWriothesleyKitBehaviour`, on avatar 10000086: five cryo strikes, a charged attack, a collision and two plunges, and Darkgold Wolfbite, five cryo strikes on the target from 99 frames. His multipliers are read from proud skill groups 8631, 8632 and 8639; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. Each of his strikes is a box on the target, which the kit prices as a circle of the box's length, and this is provisional.

Icefang Rush deals no damage of its own, so its action has no hits and the kit holds only its animation and cooldown. Not built: its enhanced normal attacks, which multiply each strike by the skill's enhancement while the wearer holds above half HP, their Chilling Penalty drain and their particles, because a kit's combatant carries no HP; Darkgold Wolfbite's Surging Blade, which hits at 160 frames, past the burst's animation; and his ascension and constellation passives.

## Key files

| File                                                                   | Role                                                                                                                                         |
| :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/wriothesleyKit.ts` | `createWriothesleyKitBehaviour`, Wriothesley's kit with his strikes, charged attack, plunges, Icefang Rush's animation and Darkgold Wolfbite |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/wriothesley), MIT: Wriothesley's strikes' hitmarks and cancel frames, the charged attack, the low and high plunges and their collision, Icefang Rush's animation, and Darkgold Wolfbite's hitmarks and animation.
