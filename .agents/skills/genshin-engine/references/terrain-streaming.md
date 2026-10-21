# Terrain streaming

Read when a region's ground streams from the terrain worker, or anything is placed in the world group.

The one-line rule is in `SKILL.md`; this page is its reasoning.

- **The ground streams; nothing places a heightfield by hand.** A region's heights and colours reach the ground only through the terrain worker (`packages/genshin-world/src/workers/terrainTile.worker.ts`), and everything placed in the world sits inside the floating origin's world group, so a shift moves it with the ground (`openspec/specs/genshin/terrain/design.md`).
