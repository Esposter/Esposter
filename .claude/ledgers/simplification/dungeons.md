# Dungeons

The game is a fifth of the app's source and no unit of it has been swept. `components/Dungeons` splits at its sub-directories, and each row pairs a component group with the store, composable and service files that only it uses.

| Unit                                                                                                | Swept      | Notes                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Dungeons/Battle`, `MonsterParty`, `MonsterDetails` + their `store/dungeons` slices                 | 2026-08-15 | the player/enemy position block became `useMonsterPositions`; the two battle menu panels one generic grid; `getMenuPosition` and `getAttackAnimationConfiguration` replaced their copies |
| `Dungeons/UI`, `Settings`, `Inventory` + the `UI`/`settings`/`inventory` slices of all three layers | —          |                                                                                                                                                                                          |
| `Dungeons/World`, `Title`, `MobileJoystick`, `Preloader`, `Scene.vue` + `store/dungeons` roots      | —          |                                                                                                                                                                                          |
| `services/dungeons/scene` + `composables/dungeons/scene`                                            | —          | 60 files — the scene layer is half the game's non-component code                                                                                                                         |
| `services/dungeons` less `scene` and `UI`                                                           | —          |                                                                                                                                                                                          |
| `composables/dungeons` less `scene` and `UI`, + `composables/phaser` + `services/phaser`            | —          |                                                                                                                                                                                          |

`shared/models/dungeons` was swept on 2026-08-12 (`shared.md`) — the game's shared models are not in scope here.
