# Genshin engine

The engine's generators, materials and frame, and the world package that builds the game's regions on it.

Greps over the scope, `packages/genshin-engine`, `packages/genshin-world` and `apps/web/app/components/Genshin`:

1. `\.[A-Za-z]+ = \{` over the scope, with `*.test.ts` and `*.bench.ts` excluded, then `grep -E "/step[A-Za-z]*\.ts:"` on its output. A step function that writes a fresh object into a field it already holds allocates on every call. The first write in an `else` branch, which creates the field, is not a hit.
2. `^[[:space:]]*stepActiveKit\(` listed with `git grep -l` over the scope, then `git grep -c -E "stepParty(Cooldowns|ElementalStates|Fall)\("` over those files. A statement that drives the active kit is the world frame or a fight loop, and the frame steps the party's three clocks before it. Each driver counts 3; a driver missing from the counts names none of them, and a count below 3 is a missing clock.
