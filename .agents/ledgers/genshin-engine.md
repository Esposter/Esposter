# Genshin engine

The engine's generators, materials and frame, and the world package that builds the game's regions on it.

Greps over the scope, `packages/genshin-engine`, `packages/genshin-world` and `apps/web/app/components/Genshin`:

1. `\.[A-Za-z]+ = \{` over the scope, with `*.test.ts` and `*.bench.ts` excluded, then `grep -E "/step[A-Za-z]*\.ts:"` on its output. A step function that writes a fresh object into a field it already holds allocates on every call. The first write in an `else` branch, which creates the field, is not a hit.
