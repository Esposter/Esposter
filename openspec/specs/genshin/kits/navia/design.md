# Navia

Navia's kit is its record and one behaviour module, `createNaviaKitBehaviour`, on avatar 10000091: four strikes, a charged attack, a collision and two plunges, Rosula Shardshot with its press and hold and the Surging Blade each shot fires, and As the Sunlit Sky's Singing Salute with its blast and its cannon's ticks. Her multipliers are read from proud skill groups 9131, 9132 and 9139, and her skill's charges, cooldown, and the burst's cooldown and energy cost are read from the same groups. Crystal Shrapnel is gained from the cannon's hits, up to six, and spent by each shot. From Ascension 1, Undisclosed Distribution Channels puts a Geo infusion on her for four seconds as each shot fires, whose hits carry 40% DMG Bonus, so her normal attacks, charged attack and plunges deal Geo and more of it; an infusion cast on her earlier is still the one her attacks take, where the game lets no other infusion override hers. Constellation 4 is built, and Constellation 6 keeps the Shrapnel past three. The charged attack has no source in gcsim, so its hits, reach and length are provisional. The shot prices five pellets landing on the target, the count with no Crystal Shrapnel, and each cannon tick strikes every enemy within 13 metres of her, not one random enemy.

## Not yet built

- **Crystal Shrapnel from the party's Crystallize shards and Lunar-Crystallize.** Navia gains a Shrapnel when a party member obtains a shard or triggers Lunar-Crystallize. The framework has no kit event for a shard's creation or pickup, since `addCrystallizeShards` and `pickUpCrystallizeShards` write the team's effects without emitting one, and it has no event for a Lunar-Crystallize reaction. Waits on a kit event for shard creation and pickup, and on Lunar-Crystallize among the reactions a kit hears.
- **Pulling shards to her during a hold.** gcsim draws each shard within 12 metres into Navia while the hold charges. Waits on a pickup that moves the shards toward the body, as `pickUpCrystallizeShards` reads a fixed reach round the body.
- **The Shrapnel's DMG, extra pellets and CRIT past three stacks.** A shot's damage per stack past three, its pellets past three and its CRIT are not priced. Waits on a hit whose talent multiplier and DMG bonus read the team's effects as it prices, since a hit's `talentMultiplier` and `damageBonus` are static numbers and a variant exists only for a burst and a hold.
- **Constellation 1's energy and burst cooldown.** Each Shrapnel a shot spends gives her energy and shortens her burst's cooldown by a second. Waits on a kit step that grants its striker energy and sets a burst cooldown, since the framework has neither.
- **Constellation 2's CRIT Rate and the extra cannon shot at the struck enemy.** Waits on a per-hit CRIT Rate and on `onStrike` receiving the enemy it struck.
- **Constellation 6's CRIT DMG.** Waits on a per-hit CRIT DMG on a `KitHit`.
- **The shot's Geo particles.** A hit has no output of particles to the party. Waits on a hit that grants particles.
- **The Surging Blade's place.** gcsim drops it on the enemy in the shot's cone when one stands there, and 3.6 metres ahead of Navia otherwise. The kit has the blade 3.6 metres ahead always, as a step has no enemy's position to read. Waits on a summon placed on an enemy the shot struck.

## Decisions

- **Crystal Shrapnel is a status on Navia that her burst's hits gain and her shot spends.** The cannon's ticks are one summon with every shot placed at its tick, since the framework's field ticks on one fixed interval and gcsim's ticks alternate between 42 and 48 frames. Each shot consumes the Shrapnel at its start, as gcsim spends it at the shot's firing.
- **The Crystal Shrapnel lasts the 300 seconds the skill table gives**, and a gain restarts it.
- **Navia's charged attack is provisional.** gcsim gives her none, so `naviaKit.ts` takes Razor's charge timing: two hits at half a second and a second with the table's index 4 and 5, ending at 1.2 seconds, in a circle of 2.5 metres round her, her first strike's reach. A recording's hitmarks, length or reach would replace them.

- **Ascension 4 reads the deployed team's built combatants as the passive's third argument.** `getPassiveBonuses` receives the combatants of the deployed members, from `getDeployedCombatants`, and Navia counts the Pyro, Electro, Cryo and Hydro among them, two at most, at 20% ATK each. gcsim v2.47.2 counts them once at init and this counts them each time the attack is priced, which agree while the deployed team is fixed.

## Key files

| File                                                             | Role                                                                                                                                                                                                                   |
| :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/naviaKit.ts` | `createNaviaKitBehaviour`, Navia's kit with her strikes, charged attack and plunges, Rosula Shardshot's press and hold with Surging Blade, and As the Sunlit Sky's Singing Salute with its cannon and Crystal Shrapnel |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/navia), MIT: the kit's hitmarks, cancel frames and reaches, the plunges' frames, reaches and poise, Rosula Shardshot's frames, pellet reach, travel delay, press and hold firing, the Surging Blade's timing and ICD, As the Sunlit Sky's Singing Salute's frames, blast, cannon spacing and Crystal Shrapnel gain, and Constellation 4 and 6.
