# Summon placement

A skill whose `afterDamage` only places its summon builds it with `createGcgSummonAfterDamage`, the convention in `openspec/specs/genshin/genius-invokation/decks/design.md`.

| Unit                                                                        | Swept                  | Notes |
| --------------------------------------------------------------------------- | ---------------------- | ----- |
| `packages/genshin-world/src/services/gcg/cards/blusteringBlade.ts`          | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/divineMaidensDeliverance.ts` | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/forbiddenCreation.ts`        | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/frostyAssault.ts`            | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/guobaAttack.ts`              | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/kamisatoArtSoumetsu.ts`      | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/koukouSendou.ts`             | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/lightningLockdown.ts`        | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/mirrorReflectionOfDoom.ts`   | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/nightrider.ts`               | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/ominousStar.ts`              | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/tenguStormcall.ts`           | 2026-10-19 · Haiku 5.5 |       |
| `packages/genshin-world/src/services/gcg/cards/trumpCardKitty.ts`           | 2026-10-19 · Haiku 5.5 |       |

**Find recipe.** Lists each skill module still in the inline shape, an `afterDamage` whose only statement places a summon on its side's field. Empty once the sweep has drained.

```sh
perl -0777 -ne 'print "$ARGV\n" if /afterDamage: \(\{ duel, sideIndex \}\) => \{\n\s+placeGcgZoneCard\(takeOne\(duel\.sides, sideIndex\)\.summons, \w+, \w+\);\n\s+\},/' packages/genshin-world/src/services/gcg/cards/*.ts
```

**Exclusions.** Every unit whose `afterDamage` places a summon, or that places one from another hook, but is not the factory's one statement, is named here with its reason, so a pass does not re-litigate it. `dandelionBreeze`, `kurageOath`, `masatsuZetsugi`, `signatureMix` and `yakanEvocation` do more than place their summon in `afterDamage` (a heal, an application, an attach or a counter). `juugaForwardUntoVictory` also places its General's War Banner. `oceanidMimicSummoning` and `theMyriadWilds` place Oceanic Mimics through `summonGcgOceanicMimics`, which places by the kind fewest on the field. `tenkoKenshin` places Tenko Thunderbolts only when Sesshou Sakura is on the field, after consuming it. `abyssalSummons` places from `play`, not `afterDamage`.
