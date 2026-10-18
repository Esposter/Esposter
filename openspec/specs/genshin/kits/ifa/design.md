# Ifa

Ifa's kit is its record and one behaviour module, `createIfaKitBehaviour`, avatar 10000113: her three normal attacks, a charged attack, Compound Sedation Field's hit as her burst, and the low plunge with its collision, all played outside her Blessing. Her multipliers are read from proud skill groups 11331, 11332 and 11339. The charged attack costs 50 stamina, the burst 60 energy with a 15-second cooldown, and the skill cools for 7.5 seconds.

## Not yet built

Ifa's kit is built around the Nightsoul Blessing, so most of it waits on the Nightsoul hook: the blessing she enters with her skill, Tonic Shot in place of her strikes, her healing, her plunge's gate and the points the blessing runs on.

- **Tonic Shot and its healing wait on the Nightsoul hook.** Inside the blessing her normal attacks and charged attack are Tonic Shot, a circle of radius 3 on the target that heals on its tap and hold, and both hits exist only in the blessing, so none is built.
- **The skill's blessing waits on the Nightsoul hook.** The press enters her Nightsoul Blessing, which lasts 80 points at 8 a second, and its exit sets the 7.5-second cooldown. The kit's skill has no hit and only spends its cooldown, a placeholder until the hook lands.
- **Her plunge gate waits on the Nightsoul hook.** gcsim lets the low plunge and its collision begin only after the blessing ends, for 26 frames. The framework has no such gate, so the plunges are not held back until the hook lands.
- **The sedation marks wait on the sedation-mark hook.** Compound Sedation Field marks each enemy in its area, up to four marks, and each mark strikes the enemy with its aura. The framework holds an aura only on an enemy, and the mark's hit reads no aura of a kit's own, so the marks are not built. The burst's own hit is built.
- **Ifa's Ascension 1 and 4 and her Constellations 1, 2 and 6 wait on the Nightsoul hook, and Constellation 4's wind current waits on a restraining field the burst does not build.** Its first phase adds 0.015 Reaction DMG per point of the team's Nightsoul, capped at 150, to Swirl, Electro-Charged and Lunar reactions while the blessing holds, Ascension 4 adds 80 Elemental Mastery for 10 seconds after each Nightsoul burst, and the constellations read the blessing's points or Tonic Shot's hits, so none is built but Constellation 4's Elemental Mastery, which the burst's start adds from the constellation alone.

## Decisions

- **The strikes and charged attack give no poise.** Ifa's normal attacks, charged attack and plunges have no poise in gcsim, so each reads 0 by the framework's rule for poise gcsim leaves out.
- **Her plunges are gcsim's numbers, ungated.** The low plunge lands at 38 frames of a 71-frame animation, and its collision at 32 frames as a circle of radius 1.5. gcsim begins them only after the blessing, which the page's Not yet built names, so until the hook they can be played outside it.
- **Her high plunge borrows the shared reach.** gcsim has no high plunge for Ifa, though the table gives her one. The kit takes the shared high plunge reach, with a hit at frame 0 and the low plunge's 71-frame animation, the same borrowed timing the other kits without a gcsim high plunge use. The roadmap's manual verification has the question.
- **The skill's press is a placeholder with the table's cooldown.** gcsim starts the 7.5 seconds on the blessing's exit rather than its press, so the cooldown here is started on the press. Until the Nightsoul hook, the press plays nothing.
- **Compound Sedation Field's hit is built alone.** Its burst hit is a plain area hit on the primary target, and the marks it sets go on the sedation-mark hook.

## Key files

| File                                                           | Role                                                                                                                                                                              |
| :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/kit/characters/ifaKit.ts` | `createIfaKitBehaviour`, Ifa's three normal attacks, charged attack, Compound Sedation Field's hit, and her plunges outside her Nightsoul Blessing, with the blessing on its hook |

## Sources

- [gcsim](https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters/ifa), MIT, at v2.47.2: the strikes' and the charged attack's hitmarks, cancels and reaches, the plunge and its collision, the skill's blessing, Compound Sedation Field and its marks, and the passives and constellations the hook waits on.
