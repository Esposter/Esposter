## Purpose

Login camera and glide, as built: the login camera holds one pose, and the world glides toward it past the walkway, its towers and the cloud sea until the door comes to rest.

## Requirements

### Requirement: Camera pose

The login camera SHALL hold the game's pose, looking straight down the walkway's middle, pitched 5.69 degrees up, with its eye one metre over the walkway.

#### Scenario: Login scene opens

- **WHEN** the login scene is shown
- **THEN** the camera looks down the middle of the walkway, pitched 5.69 degrees up

### Requirement: Field of view follows the screen width

The vertical field of view SHALL be 45 degrees on a screen 18.5:9 or wider, and on a narrower screen SHALL widen so the view across matches what 18.5:9 shows.

#### Scenario: Wide screen

- **WHEN** the screen is 21.5:9
- **THEN** the field of view is the game's 45 degrees

#### Scenario: Narrower screen

- **WHEN** the screen is 16:9
- **THEN** the vertical field of view is 51.2 degrees

### Requirement: Glide pace

The glide SHALL move at 3.5 metres a second while the title waits and at 4.5 metres a second once the game prepares, changing between the two over half a second.

#### Scenario: Title waits

- **WHEN** the title is waiting
- **THEN** the glide moves at 3.5 metres a second

#### Scenario: Game prepares

- **WHEN** the game is preparing
- **THEN** the glide moves at 4.5 metres a second

### Requirement: Rest at the door

The glide SHALL slow to rest on a whole copy of the walkway at the door, keeping on to the first copy that stands the door past the walkway's far end and can be stopped on at that rate.

#### Scenario: Glide comes to rest

- **WHEN** the glide reaches the door
- **THEN** it slows evenly and rests on that copy of the walkway

### Requirement: Scenery rows wrap by their own lengths

The scenery rows SHALL repeat by their own lengths, the walkway's copies 16 metres apart, the towers and bridges 200 metres apart, and the cloud sea's billows and low clouds 300 metres apart.

#### Scenario: Row passes its length

- **WHEN** the glide carries a row past its own length
- **THEN** the row repeats from its start

### Requirement: Title opening point

The title SHALL open about 49 metres short of the door.

#### Scenario: Title opens

- **WHEN** the title opens
- **THEN** the camera is about 49 metres short of the door

### Requirement: Bridge passes under the walkway

The bridge whose deck crosses the glide's path SHALL pass under the walkway as the glide passes over it.

#### Scenario: Glide crosses the bridge

- **WHEN** the glide passes the bridge
- **THEN** the walkway is above the bridge's deck

## Open

- [ ] **The rows wrap at 16, 200 and 300 metres** — no source yet: the `login/scroll` record is hosted, and its lengths are not kept in the repository or the parity folders.
- [ ] **The title opens about 49 metres short of the door** — no source yet: a file that sets the 49 metres; `packages/genshin-world/src/services/login/scene/computeLoginGlideTitleScrolled.ts` holds no 49-metre value.
- [ ] **The login camera holds the game's pose: straight down the walkway's middle, pitched 5.69 degrees up, its eye one metre over the walkway** — no source yet: the game's `ModelCamera` export, `~/Esposter/genshin-parity/extracted/login-layout/11790361/GameObject/ModelCamera.json`, which design.md cites for the tilt, is not yet checked for the eye's height over the risen walkway.
- [ ] **The vertical field of view is 45 degrees at 18.5:9 or wider, and widens on a narrower screen to match 18.5:9's view across** — no source yet: the game's login camera export in `~/Esposter/genshin-parity/extracted/login-camera/`, not yet read for its field of view or for the widening on a narrower screen.
- [ ] **The glide moves at 3.5 metres a second while the title waits and 4.5 once the game prepares, changing over half a second** — no source yet: the `genshin:parity glide` report that times the pace is not kept in `~/Esposter/genshin-parity/`, and the MonoLoginScene export holds no speed or curve.
- [ ] **The bridge across the glide's path passes under the walkway as the glide passes over it** — no source yet: the login layout export `~/Esposter/genshin-parity/extracted/login-layout/export.log`, not yet read for the bridge's deck against the glide's path.
