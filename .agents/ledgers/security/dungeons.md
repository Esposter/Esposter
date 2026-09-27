# Dungeons

The game is a fifth of the app's source. `components/Dungeons` splits at its sub-directories, and each row pairs a component group with the store, composable and service files that only it uses.

| Unit                                                                                                | Swept | Notes |
| --------------------------------------------------------------------------------------------------- | ----- | ----- |
| `Dungeons/Battle`, `MonsterParty`, `MonsterDetails` + their `store/dungeons` slices                 | —     |       |
| `Dungeons/UI`, `Settings`, `Inventory` + the `UI`/`settings`/`inventory` slices of all three layers | —     |       |
| `Dungeons/World`, `Title`, `MobileJoystick`, `Preloader`, `Scene.vue` + `store/dungeons` roots      | —     |       |
| `services/dungeons/scene` + `composables/dungeons/scene`                                            | —     |       |
| `services/dungeons` less `scene` and `UI`                                                           | —     |       |
| `composables/dungeons` less `scene` and `UI`, + `composables/phaser` + `services/phaser`            | —     |       |
| `models/dungeons` — the grid layer every menu navigates through                                     | —     |       |

`shared/models/dungeons` belongs to `shared.md`; `app/models/dungeons` is in scope here, on its own row,
because a model every group shares belongs to none of their rows.
