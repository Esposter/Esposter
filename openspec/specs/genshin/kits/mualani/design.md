# Mualani

Mualani's kit is its record and one behaviour module, `createMualaniKitBehaviour`, on avatar 10000102: three strikes, a charged attack, a collision and two plunges, and Boomsharka-laka. Her multipliers are read from proud skill groups 10231, 10232 and 10239, and match gcsim's values to four decimal places. Boomsharka-laka's damage is her share of Max HP, read off her Max HP as the hit is priced, as Nilou's and Kokomi's are.

## Decisions

- **Her strikes and charged attack are her kit outside the Blessing.** Each strike is a circle of radius 0.7 on the target (`attack.go` lines 96 to 100), priced as the targeting reach plus its radius (the framework's rule, not checked here), and the charged attack is a circle of radius 3.5 one metre ahead of her (`charge.go` line 45, offset 1 on Y). Out of idle the charged attack carries gcsim's 13-frame windup (`charge.go` lines 28 to 32), so it hits at 84 frames of 113 (`charge.go` lines 14, 17 and 50). gcsim also gives the windup out of dash, jump, walk and swap; the kit's is idle-only, the same gap as Mizuki's charged attack.
- **Boomsharka-laka lands at 178 frames of its 180.** gcsim queues its one hit at 108 frames (`burst.go` line 12, adjusted to the swap frame), travelling 70 frames to its target (lines 27 to 29 and 59 to 61), and the hit lands on the world's clock past the action's cancel frame, as the framework lands every such hit (the framework's rule, not checked here). The circle is radius 5 round the target (`burst.go` line 43), and its damage is the burst's share of her Max HP, read as the hit is priced (`burst.go` lines 53 and 54).
- **The skill's press enters the blessing and has no hit.** The press enters the Nightsoul Blessing with 60 points (`skill.go` line 95), which drain ten a second as gcsim's do (one point every six frames, `skill.go` lines 76 and 79), and a press in it leaves it (lines 84 and 85). gcsim sets the six-second cooldown in `cancelNightsoul` (line 58), so at the blessing's end, where this kit starts it at the press; its hit waits on Sharky's Bite.
- **Her plunges borrow the framework's plunge reach, provisionally.** gcsim has no plunge for Mualani: her folder has none, and the template's high and low plunge handlers return "not implemented" (`internal/template/character/character.go` lines 157 to 163). So each plunge hits as its action starts with the framework's plunge reach (the framework's rule, not checked here), and takes the wiki's poise, 100 on the high and 50 on the low (`Category_Mualani_Talents.json`, rows 6 and 7). Their multipliers are the table's at 5, 6 and 7, which give 56.8%, 113.6% and 141.9% at level 1, the same triple Mona's and Lyney's groups carry (group 10231). On the roadmap's Manual verification list.

## Provisional constants

- **The burst's multiplier and Max HP scaling are `Unsourced` in the record.** `mualani.json` marks `burst.hits.0.multiplier` and `scalingAttribute` `Unsourced`, though gcsim's burst block, `{0} Max HP` (`zz_mualani.dm.go` line 161), is group 10239's index 0, 58.4% at level 1, and `burst.go` lines 53 and 54 scale it by Max HP. The causes should name gcsim.
- **The 178-frame hitmark and the 113-frame animation are `DiffersFromSource` in the record, with values that are gcsim's idle values.** 108 plus 70 and 100 plus 13 are gcsim's (`burst.go` lines 12 and 29; `charge.go` lines 17 and 32), and the record's `chargedAttack.hits.0.hitmarkFrames` 84 is `Unsourced` though gcsim gives it. The labels stay open until the record states the reason for a different value.
- **The plunge reach is the framework's and provisional.** gcsim has no plunge for her and `mualani.json` has no plunge keys (see Decisions).
- **The surfing field's ticking is the design's reading.** The design says the framework has no field ticking on the Blessing's movement. gcsim's `surfingTick` (`skill.go` line 144) is not compared here.

## Not built

- **Sharky's Bite and the blessing's strike replacement are not built.** In the blessing her strikes are replaced by Sharky's Bite, which forbids her charged attack, and a press ends it; the swap that also ends it is not built. The entry and the point drain are built.
- **Sharky's Bite, its momentum and its Surging Bite are not built.** They are the Blessing's normal attacks, and they wait on the Blessing above. Their marks on an enemy, which spread the Shark Missile to the marked enemies round the one struck, wait on it too.
- **Surfing and the momentum it gives are not built.** While surfing in the Blessing, a Surfing Hit strikes an enemy in her path and gives it a mark and momentum stacks. It waits on a field that ticks on the body's movement while the Blessing stands, which the framework has for fields but not for a Blessing's movement, and on the Blessing above.
- **Ascension 1 and 4 are not built.** Ascension 1, Heat-Resistant Freshwater Floater, gives 20 Nightsoul points for each of the first two Puffers she picks up in a blessing (`asc.go` lines 16, 26 and 29), and a Puffer is spawned by Sharky's Surging Bite, so it waits on the Bite above. Ascension 4, Natlan's Greatest Guide, stacks Wavechaser's Exploits on each Nightsoul Burst a nearby party member triggers and spends them on Boomsharka-laka's damage, so it waits on the Nightsoul hook, which the framework lacks. Her constellations, including the Puffer's momentum and points, are the [character kits proposal](../../../../changes/genshin-character-kits/design.md)'s passives and the [constellations](../../../../changes/genshin-constellations/design.md) page's.

## Key files

| File                                                               | Role                                                                                                     |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/mualaniKit.ts` | `createMualaniKitBehaviour`, Mualani's kit with her strikes, charged attack, plunges and Boomsharka-laka |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/mualani), MIT: the hitmarks, animations and reach of the kit, the charged attack's windup and Boomsharka-laka's travel, and the proud group indices behind each multiplier.
- [Hosted game data](../../hosted-game-data/design.md): the avatar's talent groups 10231, 10232 and 10239 and her skill depot, read from the talent and skill kit tables.
- [Cooling Treatment](https://genshin-impact.fandom.com/wiki/Cooling_Treatment) and [Boomsharka-laka](https://genshin-impact.fandom.com/wiki/Boomsharka-laka), Genshin Impact Wiki: the poise of her strikes, charged attack, collision, plunges and burst.
- The cached wiki, `~/Esposter/cache/genshin-wiki/Category_Mualani_Talents.json`: the poise rows 1 to 7 (9.6, 8.39 and 13.1 for the three strikes, 50 for the charged attack, 5 for the collision, and 50 and 100 for the low and high plunges).
- The game data, `~/Esposter/genshin-parity/text/ExcelBinOutput/`: groups 10231, 10232 and 10239 (skill rows 30000, 30002 and 30007), with the skill's six-second cooldown on row 30002 and the burst's 15 seconds and 60 energy on row 30007. Checked against gcsim's multiplier blocks: all 8 match their groups at every talent level.
