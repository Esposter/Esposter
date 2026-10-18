## Purpose

The HUD's corner map, as the game keeps one in play. The map's one drawing of the catalogue, cut to a circle round the character with north up, under the game's own marks placed by its interface tree, the N at the top of the rim, the view's fan and the character's arrow. Pressing it opens the map, as M does.

## Requirements

### Requirement: North-up circle round the character

The minimap SHALL show the map's drawing moved so the character sits at its centre, cut to a circle, with north kept at the top of the rim and the N drawn there.

#### Scenario: Character turns

- **WHEN** the character turns or walks
- **THEN** the drawing keeps north at the top of the rim and moves under the centre

### Requirement: Fan shows the view and arrow shows the character

The view SHALL be a fan a quarter turn wide that turns with the camera's yaw, and the character's arrow SHALL point the way the character faces.

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
