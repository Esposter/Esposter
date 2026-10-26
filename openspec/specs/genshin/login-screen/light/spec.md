## Purpose

The light on the login scene, as built: the stone lit as the game's deferred pass lights it, the cloud sea's haze hiding the stone under the walkway, and shadows and screen-space occlusion where drawn, with each hour's light solved over the game's own exports.

## Requirements

### Requirement: Stone edge glow

The stone SHALL glow along its edges in its material's colour, with the door and the towers drawing an eighth of their material's glow strength, and the walkway and the bridges drawing no glow.

#### Scenario: Door and towers glow

- **WHEN** the door or a tower is shown
- **THEN** its edges glow at an eighth of the material's strength

#### Scenario: Walkway and bridges

- **WHEN** the walkway or a bridge is shown
- **THEN** no edge glow is drawn

### Requirement: Stone darkens with height

The stone SHALL darken with height at each hour's rate up to 20 metres, and the night SHALL darken at 0.14 per metre.

#### Scenario: Night stone

- **WHEN** the night is shown
- **THEN** the stone darkens by 0.14 per metre of height, up to 20 metres

### Requirement: No outline round the stone

The scene SHALL draw no outline round its stone.

#### Scenario: Stone is drawn

- **WHEN** the stone is drawn
- **THEN** no outline is drawn round it

### Requirement: Haze hides the stone under the walkway

The cloud sea's haze SHALL hide the stone under the walkway at dawn and at night, as a wall whose top stands about three metres under the walkway at night and six at dawn, turning the stone a few metres under the walkway wholly to the haze's colour.

#### Scenario: Night haze

- **WHEN** the night is shown
- **THEN** the stone beneath the walkway turns to the haze's colour

#### Scenario: Dusk haze

- **WHEN** the dusk is shown
- **THEN** the haze hides no more than about three quarters of the far towers

### Requirement: Screen-space occlusion by hour

The day, dusk and night frames SHALL darken creases and wall feet with screen-space occlusion reaching 8 metres, while the dawn frame and the phone client's frame draw none.

#### Scenario: Day occlusion

- **WHEN** the day is shown on the computer client
- **THEN** creases and wall feet are darkened within 8 metres

#### Scenario: Phone client

- **WHEN** the login screen is shown on the phone client
- **THEN** no occlusion is drawn

### Requirement: Shadows across the walkway

The sun and the moon SHALL cast shadows across the walkway, and the night's moon SHALL cast them at 0.8 strength, filtered over two texels.

#### Scenario: Night moon shadows

- **WHEN** the night is shown
- **THEN** the moon casts shadows across the walkway at 0.8 strength, softened over two texels

### Requirement: No god rays

The post chain SHALL draw no god rays.

#### Scenario: Any hour

- **WHEN** any hour is shown
- **THEN** no god rays are drawn

## Open

- [ ] **The walkway and the bridges draw no edge glow** — no source yet: their fitted strength is in the hosted login stone fit, which is not read here.
- [ ] **The night darkens at 0.14 per metre of height** — no source yet: the rate is in the hosted `login/stoneLight` record, which is not kept locally.
- [ ] **The haze hides the stone under the walkway, its wall's top about 3 metres under the walkway at night and 6 at dawn, and the dusk's haze hides no more than about three quarters of the far towers** — no source yet: the haze tops are not measured in any kept file.
- [ ] **The login is drawn at the medium tier on the phone client** — no source yet: the phone client's tier is set by the client and is not read here.
- [ ] **The post chain draws no god rays** — no source yet: the login scene's post chain was not read for a god-ray pass.
- [ ] **The door and the towers glow at an eighth of the material's strength** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **The stone darkens with height at each hour's rate up to 20 metres** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **The scene draws no outline round its stone** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **Occlusion reaches 8 metres in the day, dusk and night frames, and the dawn and phone frames draw none** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **The sun and the moon cast shadows across the walkway, the night's moon at 0.8 strength** — no source yet: game data or a snapshot that holds this behaviour
