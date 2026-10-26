## Purpose

The HUD's corner map, as the game keeps one in play (`~/Esposter.noindex/genshin-parity/references/hud-world-keys.png`). The map's one drawing of the catalogue, cut to a circle round the character with north up, under the game's own marks placed by its interface tree (see the open list), the N at the top of the rim, the view's fan and the character's arrow. Pressing it opens the map, as M does (`packages/genshin-engine/src/input/InputActionBindingMap.ts`).

## Requirements

### Requirement: North-up circle round the character

The minimap SHALL show the map's drawing moved so the character sits at its centre, cut to a circle, with north kept at the top of the rim and the N drawn there (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`).

#### Scenario: Character turns

- **WHEN** the character turns or walks
- **THEN** the drawing keeps north at the top of the rim and moves under the centre (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`)

### Requirement: Fan shows the view and arrow shows the character

The view SHALL be a fan a quarter turn wide (see the open list) that turns with the camera's yaw, and the character's arrow SHALL point the way the character faces (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`).

#### Scenario: Camera yaws

- **WHEN** the camera turns
- **THEN** the fan turns with it (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`)

#### Scenario: Character walks toward the camera

- **WHEN** the character walks toward the camera
- **THEN** the arrow points down the minimap (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`)

### Requirement: Redraws only when the view moves

The minimap SHALL take a new reading only when the character's place, the camera's yaw or the character's facing changes (`packages/genshin-world/src/components/World/Session/Index.vue`).

#### Scenario: Still player

- **WHEN** the player stands still
- **THEN** the minimap is not re-rendered (`packages/genshin-world/src/components/World/Session/Index.vue`)

### Requirement: Pressing the minimap opens the map

Pressing the minimap SHALL open the map, as M does (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`, `packages/genshin-engine/src/input/InputActionBindingMap.ts`).

#### Scenario: Minimap pressed

- **WHEN** the player presses the minimap
- **THEN** the map opens (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`)

### Requirement: Minimap follows the map's landmarks

Any landmark or area the map gains SHALL appear on the minimap with no change of its own (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`).

#### Scenario: Statue unlocked

- **WHEN** a statue is unlocked
- **THEN** its area and mark appear on the minimap (`packages/genshin-world/src/components/Hud/Minimap/Index.vue`)

## Open

- [ ] **The marks the game's interface tree places, and their scales** — no source yet: the in-level HUD's interface tree export, which this machine does not hold (no `hud` folder under `~/Esposter.noindex/genshin-parity/extracted/`).
- [ ] **The fan a quarter turn wide** — no source yet: the game's sight-fan image width from the tree, which this machine does not hold; the `.fan` clip in `Hud/Minimap/Index.vue` cuts a wedge of about 72 degrees, not 90.
