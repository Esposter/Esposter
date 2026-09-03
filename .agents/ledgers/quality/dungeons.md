# Dungeons

The game is a fifth of the app's source. `components/Dungeons` splits at its sub-directories, and each row pairs a component group with the store, composable and service files that only it uses.

| Unit                                                                                                | Swept      | Notes                                                            |
| --------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------- |
| `Dungeons/Battle`, `MonsterParty`, `MonsterDetails` + their `store/dungeons` slices                 | 2026-08-20 |                                                                  |
| `Dungeons/UI`, `Settings`, `Inventory` + the `UI`/`settings`/`inventory` slices of all three layers | 2026-08-20 |                                                                  |
| `Dungeons/World`, `Title`, `MobileJoystick`, `Preloader`, `Scene.vue` + `store/dungeons` roots      | 2026-08-20 |                                                                  |
| `services/dungeons/scene` + `composables/dungeons/scene`                                            | 2026-08-20 | 60 files — the scene layer is half the game's non-component code |
| `services/dungeons` less `scene` and `UI`                                                           | 2026-08-20 |                                                                  |
| `composables/dungeons` less `scene` and `UI`, + `composables/phaser` + `services/phaser`            | 2026-08-20 |                                                                  |
| `models/dungeons` — the grid layer every menu navigates through                                     | 2026-08-20 |                                                                  |

`shared/models/dungeons` belongs to `shared.md`; `app/models/dungeons` is in scope here, on its own row,
because a model every group shares belongs to none of their rows.
