# Lynette

Lynette's kit is its record and one behaviour module, `createLynetteKitBehaviour`, on avatar 10000083: four strikes, a charged attack of two slashes, a collision and two plunges, Enigmatic Feint's press, and Magic Trick: Astonishing Shift's initial hit with the Bogglecat Box beside it. Her strikes and plunges are physical, as her gcsim folder deals them, and her skill and burst are Anemo. Her multipliers are read from proud skill groups 8331, 8332 and 8339; the charged attack's stamina, the skill's cooldown, and the burst's cooldown and energy cost are read from the same groups. The Bogglecat Box ticks eleven times, first 122 frames after it is placed and then every 59 frames, each tick reaching every enemy within six metres of the box, which stands 1.8 metres ahead of the body where the burst starts.

Not built yet: Enigmatic Feint's hold, its Shadowsign and release strike, which need a hold whose hit lands at the held time; its aligned attack, the Surging Blade, which lands only off a ten-second cooldown; the Bogglecat Box's vivid shots, which absorb an enemy's Cryo, Pyro, Hydro or Electro and need an absorb check that a kit's field cannot make; the heal and HP drain on Enigmatic Feint, which read her own HP; her Ascension 4 and Constellation passives.

## Decisions

- **The Bogglecat Box's ticks are gcsim's, measured from its placing, and its poise is the wiki's 40.** gcsim gives the box 754 frames (`burst.go` line 13), its first tick at 136 frames from the cast and its interval of 59 (`burst.go` lines 17 and 18), and the box is placed 14 frames into the cast (`burst.go` line 16). The first tick is therefore 122 frames after the placing, and the ticks run every 59 frames from there to the box's end (`bogglecatbox.go` lines 67 and 68), eleven in all. The record marks the 122 and the 59 `Unsourced` (`frames.bogglecatFirstTick`, `frames.bogglecatTickInterval`), which is out of date; see Provisional constants. The tick's zero hitmark has no literal, as gcsim queues each tick at its own time (`bogglecatbox.go` line 68). Its multiplier is gcsim's, joined to proud skill group 8339 at index 1, and its poise is the wiki's 40 (`Category_Lynette_Talents.json`, Magic Trick).
- **Constellation 4's extra charge is a skill-charge bonus, and it applies while Enigmatic Feint's press and hold are not built.** It is a cooldown property of the skill, as Lan Yan's Constellation 6 is, so it applies through `getSkillChargeBonus`; gcsim gives the skill two charges from Constellation 4 (`cons.go` lines 23 to 26).

## Provisional constants

- **The record marks the Bogglecat Box's first tick and its interval `Unsourced`, though gcsim gives both.** `frames.bogglecatFirstTick` (122) and `frames.bogglecatTickInterval` (59) agree with `burst.go` lines 17 and 18 less the 14-frame placing (`burst.go` line 16); the record's causes should name gcsim. This pass does not change the record.

## Key files

| File                                                               | Role                                                                                                                                                                    |
| :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/lynetteKit.ts` | `createLynetteKitBehaviour`, Lynette's kit with her strikes, charged attack and plunges, Enigmatic Feint's press, and Magic Trick's initial hit and Bogglecat Box ticks |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/lynette), MIT: Lynette's strikes' hitmarks, cancel frames and boxes, the charged attack, the plunges and their collision, Enigmatic Feint's press, and Magic Trick: Astonishing Shift's initial hit and the Bogglecat Box's 754-frame duration, first tick and interval, and tick circle (`bogglecatbox.go`).
- The game data, `~/Esposter/genshin-parity/text/ExcelBinOutput/`: groups 8331, 8332 and 8339 are the normal attack, Enigmatic Feint and Magic Trick groups (skill rows 10831, 10832 and 10835), with the burst's 18-second cooldown and 70 energy cost on row 10835 and the skill's 12-second cooldown on row 10832.
- The cached wiki, `~/Esposter/cache/genshin-wiki/Category_Lynette_Talents.json`: the Magic Trick's poise of 40 and its 70 energy, and Enigmatic Feint's Anemo DMG.
