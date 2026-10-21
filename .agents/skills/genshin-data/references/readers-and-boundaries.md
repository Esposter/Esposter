# Readers and boundaries

Read when a record is awaited at a boundary, or a worker is posted the records it needs.

The one-line rules are in `SKILL.md`; this page is their reasoning.

Nothing reads at module scope, and a worker is posted the records it needs before its first request (`TerrainWorkerGround`).
