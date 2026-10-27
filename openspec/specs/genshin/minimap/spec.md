## Purpose

The HUD's corner map, the catalogue's one drawing cut to a circle round the character with north up, under the game's own marks.

## Requirements

### Requirement: North-up circle round the character

The minimap SHALL show the map's drawing moved so the character sits at its centre, cut to a circle, with north kept at the top of the rim and the N drawn there.

#### Scenario: Character turns

- **WHEN** the character turns or walks
- **THEN** the drawing keeps north at the top of the rim and moves under the centre

### Requirement: Fan shows the view and arrow shows the character

The view SHALL be a fan a quarter turn wide (see the open list) that turns with the camera's yaw, and the character's arrow SHALL point the way the character faces.

#### Scenario: Camera yaws

- **WHEN** the camera turns
- **THEN** the fan turns with it

#### Scenario: Character walks toward the camera

- **WHEN** the character walks toward the camera
- **THEN** the arrow points down the minimap

### Requirement: Redraws only when the view moves

The minimap SHALL take a new reading only when the character's place, the camera's yaw or the character's facing changes.

#### Scenario: Still player

- **WHEN** the player stands still
- **THEN** the minimap is not re-rendered

### Requirement: Pressing the minimap opens the map

Pressing the minimap SHALL open the map, as M does.

#### Scenario: Minimap pressed

- **WHEN** the player presses the minimap
- **THEN** the map opens

### Requirement: Minimap follows the map's landmarks

Any landmark or area the map gains SHALL appear on the minimap with no change of its own.

#### Scenario: Statue unlocked

- **WHEN** a statue is unlocked
- **THEN** its area and mark appear on the minimap

## Open

- [ ] **The marks the game's interface tree places** — no source yet: the group's fourth child and MarkSouth's inset, which neither held file names.
- [ ] **The fan a quarter turn wide** — no source yet: the sight fan's image width is not found in the exported tree (`{data-root}/genshin-parity/extracted/character/interface/json/GameObject/MarkSightFan.json` holds only its object and a 1.25 scale).
- [ ] **The minimap keeps north at the top of a circle round the character, with its N drawn there** — no source yet: a measured reading of the circle's cut and the N's place; the reference `{data-root}/genshin-parity/references/hud-world-keys.png` is on disk, but no parity row scores the minimap.
- [ ] **Pressing the minimap opens the map, as M does** — no source yet: the dump's table names hold no key-binding table, and the extracted SDK (`{data-root}/genshin-parity/extracted/sdk/MonoBehaviour/`) holds only two input-field MonoBehaviours, so the game's M binding is not in the held data.
