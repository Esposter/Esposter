# Summon placement

A skill whose `afterDamage` only places its summon builds it with `createGcgSummonAfterDamage`, the convention in `openspec/specs/genshin/genius-invokation/decks/design.md`.

| Unit                                                                        | Swept | Notes |
| --------------------------------------------------------------------------- | ----- | ----- |
| `packages/genshin-world/src/services/gcg/cards/blusteringBlade.ts`          | —     |       |
| `packages/genshin-world/src/services/gcg/cards/divineMaidensDeliverance.ts` | —     |       |
| `packages/genshin-world/src/services/gcg/cards/forbiddenCreation.ts`        | —     |       |
| `packages/genshin-world/src/services/gcg/cards/frostyAssault.ts`            | —     |       |
| `packages/genshin-world/src/services/gcg/cards/guobaAttack.ts`              | —     |       |
| `packages/genshin-world/src/services/gcg/cards/kamisatoArtSoumetsu.ts`      | —     |       |
| `packages/genshin-world/src/services/gcg/cards/koukouSendou.ts`             | —     |       |
| `packages/genshin-world/src/services/gcg/cards/lightningLockdown.ts`        | —     |       |
| `packages/genshin-world/src/services/gcg/cards/mirrorReflectionOfDoom.ts`   | —     |       |
| `packages/genshin-world/src/services/gcg/cards/nightrider.ts`               | —     |       |
| `packages/genshin-world/src/services/gcg/cards/ominousStar.ts`              | —     |       |
| `packages/genshin-world/src/services/gcg/cards/tenguStormcall.ts`           | —     |       |
| `packages/genshin-world/src/services/gcg/cards/trumpCardKitty.ts`           | —     |       |

**Find recipe.** Lists each skill module still in the inline shape, an `afterDamage` whose only statement places a summon on its side's field. Empty once the sweep has drained.

```sh
perl -0777 -ne 'print "$ARGV\n" if /afterDamage: \(\{ duel, sideIndex \}\) => \{\n\s+placeGcgZoneCard\(takeOne\(duel\.sides, sideIndex\)\.summons, \w+, \w+\);\n\s+\},/' packages/genshin-world/src/services/gcg/cards/*.ts
```

**Exclusions.** `dandelionBreeze`, `kurageOath`, `masatsuZetsugi`, `signatureMix` and `yakanEvocation` do more than place their summon in `afterDamage` (a heal, an application, an attach or a counter), so the factory does not fit them. `abyssalSummons` places from `play`, not `afterDamage`.
