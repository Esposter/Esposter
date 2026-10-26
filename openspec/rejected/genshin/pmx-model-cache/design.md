# Caching parsed PMX models

The reader parses a model each time it is drawn and keeps no parsed copy. Caching the parsed model would have saved the parse on a repeat draw.

**Why not:** the parse is cheap next to what a store would cost. `parsePmx.bench.md` reads a model of tens of megabytes in tens of milliseconds, and a structured clone of what it returns, the least an IndexedDB read of it would cost, takes about a third of that before any disk is read (at 500,000 vertices, 17.9 ms for the parse and 6.6 ms for the clone, `packages/genshin-engine/src/character/parsePmx.bench.md`). A cache would save a few milliseconds a character and add a store to keep.
