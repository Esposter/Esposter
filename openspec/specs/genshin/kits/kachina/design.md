# Kachina

Kachina's kit is its record and one behaviour module, `createKachinaKitBehaviour`, avatar 10000100: four normal attacks of one, two, one and one hits, a charged attack, a collision and two plunges, and the burst's one Geo hit. Her strikes', charged attack's and plunges' multipliers are read from proud skill group 10031, and match the wiki's talent pages to their own precision. Her cooldowns and the costs of her burst and charged attack come from the same tables: 20 seconds, 18 seconds, 70 energy and 25 stamina. The burst's multiplier is the wiki's, as a share of DEF.

gcsim has no folder for Kachina at v2.47.2, so no value comes from gcsim. Her record is built from the tables, the wiki and her overlay, and most of its frames and areas are provisional.

## Decisions

- **Frames come from the clips' durations, as totals only.** The clips carry no events, so no event is read as a hit or a cancel. Each action's frames are its clip's length at 60 a second: the four normal attacks are `Attack_01` to `Attack_04` (160, 186, 198 and 206 frames), the charged attack "ExtraAttack_AS" (102), the low plunge "FallingAttack_Strike" (18), the high plunge "FallingAttack_Strike_As" (102), the skill "ElementalArt_Throw" (48) and the burst `ElementalBurst` (50). Which clip is which action is read from its name, not from a recording.
- **Hitmarks are Xiangling's, provisional.** The hit frames are taken from Xiangling's gcsim hitmarks, the same polearm body type, for a kit of the same strike count. Her strikes land at 12, 11 and 18, 5 and 21 frames; her charged attack at 24; her plunges at 45 and 46. These are not Kachina's, and a recording of her strikes settles them.
- **Areas are Xiangling's circles, provisional.** Each strike's area is one of Xiangling's measured reaches, and the burst's and plunges' radii are Xiangling's too.
- **The burst's hit is Geo, scaled by DEF.** The wiki gives her burst's Skill DMG as a share of her DEF, 380.57% at level 1, and the kit reads it as 3.8057 with the scaling attribute set to Defense. Its poise is none, as neither gcsim nor the wiki gives it, and its gauge is unset.
- **The burst's energy and cooldown are the table's.** Her burst is one hit at 18 frames of a 50-frame animation, and its field and its Turbo Twirly are not built.

## Not built

- **The skill's Turbo Twirly is waiting on its record.** Its press summons Turbo Twirly, and its mounted and independent hits scale with DEF. The tables do not name those rows, and the wiki gives their levels without a table, so the kit's skill plays its 48-frame animation and deals no hit, and her skill's hits are not built.
- **Her Nightsoul state is waiting on the Nightsoul hook.** Kachina's Nightsoul's Blessing and its points, and the Phlogiston she consumes once they run out, are not read by any kit yet.
- **Her passives wait on their hooks.** Mountain Echoes, The Weight of Stone and Heart of Unity each read the Nightsoul state, the party's Nightsoul Bursts or DEF, which no kit reads yet.

## Key files

| File                                                               | Role                                                                                         |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/kachinaKit.ts` | `createKachinaKitBehaviour`, Kachina's module, built on her record and with no behaviour yet |
| `packages/genshin-world/src/data/kits/kachina.json`                | Kachina's overlay: the frames, areas and hit counts her sources do not give                  |

## Sources

- [Cragbiter](https://genshin-impact.fandom.com/wiki/Kachina) and the other talent pages in [Category:Kachina Talents](https://genshin-impact.fandom.com/wiki/Category:Kachina_Talents), Genshin Impact Wiki, read through the wiki's [MediaWiki API](https://genshin-impact.fandom.com/api.php): her normal attacks' Skill DMG, charged attack and plunges, the burst's Skill DMG (%DEF) and cooldowns, and each hit's poise and internal cooldown tag.
- The animation clips, read with `genshin:assets timings` from the installed game: the durations of her `Ani_Avatar_Loli_Pole_Kachina_*` clips, and the timings of Xiangling's `Ani_Avatar_Girl_Pole_Xiangling_Attack_0*` clips, which carry no events.
- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/xiangling), MIT at v2.47.2: Xiangling's normal attack, charged attack and plunge hitmarks and areas, which Kachina's hits take provisionally.
