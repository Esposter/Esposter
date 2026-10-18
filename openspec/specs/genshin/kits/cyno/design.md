# Cyno

Cyno's kit is its record and one behaviour module, `createCynoKitBehaviour`, on avatar 10000071: the Invoker's Spear with its four strikes, charged attack, plunges and collision; Secret Rite: Chasmic Soulfarer; and Sacred Rite: Wolf's Swiftness, which sets Pactsworn Pathclearer on the team as a stance with its own five strikes, charged attack and skill, Mortuary Rite. His multipliers come from proud skill groups 7131, 7132 and 7139, read at level 1. The skill's cooldown is 7.5 seconds, the burst's cooldown 20 seconds and its cost 80 energy, and the charged attack's stamina 25.

## Decisions

- **Pactsworn Pathclearer is a stance of the burst.** The burst sets a stance for its 10 seconds from the table plus the 112 frames gcsim adds to them, as gcsim's status is 712 frames, and its normal attacks, charged attack and skill are Pactsworn's in place of the kit's. Each Mortuary Rite extends the stance by four seconds, two times at most a burst, as gcsim extends its status. Leaving the field ends the stance and its Elemental Mastery.
- **Mortuary Rite is the stance's skill, and its cooldown is the factor of Secret Rite's.** While the stance holds, a skill press costs three seconds of cooldown rather than seven and a half, through `getSkillCooldownMultiplier`. gcsim sets both cooldowns on each Mortuary Rite press, so after the stance Secret Rite waits on the seven and a half seconds there. The kit holds one cooldown per character, so after the stance Secret Rite can be pressed sooner than in gcsim.
- **The burst's Elemental Mastery is a buff of 100 for the stance's seconds**, read from the table, and the Ascension 4 flat DMG reads it as the striker is priced.
- **Judication is a field that gives Endseer.** At Ascension 1 the burst adds a field round the body, which ticks at 328 frames and every 234 frames after, giving Endseer for 84 frames while the stance holds. A Mortuary Rite cast under Endseer fires three Duststalker Bolts at its hitmark, each 1.0 times the table's talent multiplier, and raises Day of the Jackal by four stacks.
- **Judication's 35% is set by Mortuary Rite's press and read by its hit.** A press under Endseer sets a one-second status, as gcsim's `a1Buff` sets its 60-frame modifier, and `getStrikeDamageBonus` adds 35% to the hit that press lands, that hit alone: the Duststalker Bolts and Secret Rite take none. gcsim's comment on `asc.go` names Secret Rite, but its code gates the buff on skill B, Mortuary Rite, which the kit follows.
- **Ascension 4 adds flat DMG from Elemental Mastery.** Pactsworn's normal attacks take 150% of it, and each Duststalker Bolt takes 250%, as gcsim's Ascension 4 passage reads the stat for a normal attack and for a bolt.
- **Constellation 2 is an Electro DMG buff built from the strikes.** Each normal attack that strikes an enemy adds a stack, up to five, and the buff is 10% a stack for four seconds. A 0.1-second internal cooldown lets one stack in a hit's step, as gcsim's does.
- **Constellation 4 restores energy from reactions Cyno's own strikes trigger, while the stance holds.** Each such reaction gives every other member of the deployed team 3 energy, five times a burst. gcsim's code does not check the stance, though its comment places the effect in Pactsworn Pathclearer; the kit follows the comment (see the roadmap).
- **Constellation 6 is Day of the Jackal.** The burst and each Judication give stacks, up to eight, lasting eight seconds. While the stance holds, each normal attack that strikes an enemy spends one to fire a Duststalker Bolt, once every 0.4 seconds.
- **Provisional: each Duststalker Bolt is priced at 1.0 times the talent multiplier.** gcsim's code gives the bolts 1.0, but its comment on Judication says the bolts deal 50% of Cyno's ATK. The kit ships gcsim's code value, and the roadmap asks which one the game uses.
- **Provisional: the charged attack's stamina is the table's slot 6.** gcsim does not read that slot, so its identity is a best estimate, as Ayato's group holds the stamina there too. The roadmap does not ask about it, as the value comes from the table.

## Not built

- **Constellation 1's Normal Attack SPD of 20% is built from the burst.** It is a status for ten seconds read by the own-kit attack-speed hook, so it lifts only Cyno's own normal attacks. Its refresh when Judication is triggered during Chasmic Soulfarer is not built, as the kit does not read that trigger on the stance.
- **Pactsworn Pathclearer's plunges are not built.** Its low, high and collision plunges are gcsim's Electro plunges with a wider reach, and a stance's actions carry no plunges, so its kit keeps the Invoker's plunges during the stance. The hook is plunges on `KitStanceActions`.
- **The stance's slide is not built.** gcsim extends the burst so a hit that lands after its end still counts (its burst-slide check). The stance ends on its seconds alone, so a late hit of the stance is cut.
- **Mortuary Rite's cooldown after the stance is approximate**, as the Decisions say. The kit has one cooldown per character, so the stance's skill cannot set a second one for Secret Rite.

## Key files

| File                                                            | Role                                                                                                                                 |
| :-------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/cynoKit.ts` | `createCynoKitBehaviour`, Cyno's kit with the Invoker's Spear, Secret Rite, Sacred Rite and Pactsworn Pathclearer with Mortuary Rite |

## Sources

- [gcsim (MIT)](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/cyno): the strikes' hitmarks, cancel frames and reaches, the charged attack, the plunges' hitmarks, animations and radii, Secret Rite and Mortuary Rite's frames and reaches, the stance's 712 frames, the extensions, Judication, the Ascension 1 and 4 values, and the constellations.
- The proud skill groups 7131, 7132 and 7139 in the hosted game data: each multiplier's index and the cooldowns, the stance's Elemental Mastery, its duration in seconds, and the burst's cooldown and cost in energy, all at talent level 1.
