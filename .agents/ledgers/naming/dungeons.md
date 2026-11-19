# Dungeons

| Unit                                                | Swept | Notes                                                                                                                                              |
| --------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/store/dungeons`                                | —     | a store export whose leaf name collides takes its parent's word, as the import site cannot                                                         |
| `app/composables/dungeons`                          | —     |                                                                                                                                                    |
| `app/services/dungeons/scene`                       | —     | a comparator is a `check*` function, never a PascalCase noun                                                                                       |
| `app/services/dungeons` — the rest                  | —     | `UI`, `monster`, `tilemap`, `direction`, `sound`, `item`, `animation`, `attack`, the singles                                                       |
| `app/models/dungeons` — `state`, `loader`, `scene`  | —     |                                                                                                                                                    |
| `app/models/dungeons` — the rest                    | —     | `tilemap`, `keys`, `UI`, `npc`, `input`, `gridEngine`, `area`, the singles, the root files                                                         |
| `app/components/Dungeons` — `Battle`, `World`, `UI` | —     | a boolean model is `is*` like any other boolean, and the prop rename carries to every consumer                                                     |
| `app/components/Dungeons` — the rest                | —     | `Settings`, `Inventory`, `MonsterParty`, `Title`, `MobileJoystick`, `MonsterDetails`; a phaser geometry local is still a constant when it is fixed |
