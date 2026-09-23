# Dungeons

The game.

| Unit                                                | Swept               | Notes                                                                                                                                              |
| --------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/store/dungeons`                                | 2026-09-22 · Opus 5 | a store export whose leaf name collides takes its parent's word, as the import site cannot                                                         |
| `app/composables/dungeons`                          | 2026-09-22 · Opus 5 |                                                                                                                                                    |
| `app/services/dungeons/scene`                       | 2026-09-22 · Opus 5 | a comparator is a `check*` function, never a PascalCase noun                                                                                       |
| `app/services/dungeons` — the rest                  | 2026-09-22 · Opus 5 | `UI`, `monster`, `tilemap`, `direction`, `sound`, `item`, `animation`, `attack`, the singles                                                       |
| `app/models/dungeons` — `state`, `loader`, `scene`  | 2026-09-22 · Opus 5 |                                                                                                                                                    |
| `app/models/dungeons` — the rest                    | 2026-09-22 · Opus 5 | `tilemap`, `keys`, `UI`, `npc`, `input`, `gridEngine`, `area`, the singles, the root files                                                         |
| `app/components/Dungeons` — `Battle`, `World`, `UI` | 2026-09-22 · Opus 5 | a boolean model is `is*` like any other boolean, and the prop rename carries to every consumer                                                     |
| `app/components/Dungeons` — the rest                | 2026-09-22 · Opus 5 | `Settings`, `Inventory`, `MonsterParty`, `Title`, `MobileJoystick`, `MonsterDetails`; a phaser geometry local is still a constant when it is fixed |
