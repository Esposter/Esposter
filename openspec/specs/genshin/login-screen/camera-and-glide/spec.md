## Purpose

Login camera and glide, as built: the login camera holds one pose, and the world glides toward it past the walkway, its towers and the cloud sea until the door comes to rest.

## Requirements

### Requirement: Camera pose

The login camera SHALL hold the game's pose, looking straight down the walkway's middle, pitched 5.69 degrees up, with its eye one metre over the walkway (`packages/genshin-world/src/services/login/scene/constants.ts`).

#### Scenario: Login scene opens

- **WHEN** the login scene is shown
- **THEN** the camera looks down the middle of the walkway, pitched 5.69 degrees up (`packages/genshin-world/src/services/login/scene/constants.ts`)

### Requirement: Field of view follows the screen width

The vertical field of view SHALL be 45 degrees on a screen 18.5:9 or wider, and on a narrower screen SHALL widen so the view across matches what 18.5:9 shows (`packages/genshin-world/src/services/login/scene/constants.ts`, `packages/genshin-world/src/services/login/scene/getLoginCameraFov.ts`).

#### Scenario: Wide screen

- **WHEN** the screen is 21.5:9
- **THEN** the field of view is the game's 45 degrees (`packages/genshin-world/src/services/login/scene/constants.ts`)

#### Scenario: Narrower screen

- **WHEN** the screen is 16:9
- **THEN** the vertical field of view is 51.2 degrees (`packages/genshin-world/src/services/login/scene/getLoginCameraFov.test.ts`)

### Requirement: Glide pace

The glide SHALL move at 3.5 metres a second while the title waits and at 4.5 metres a second once the game prepares, changing between the two over half a second (`packages/genshin-world/src/services/login/scene/constants.ts`).

#### Scenario: Title waits

- **WHEN** the title is waiting
- **THEN** the glide moves at 3.5 metres a second (`packages/genshin-world/src/services/login/scene/constants.ts`)

#### Scenario: Game prepares

- **WHEN** the game is preparing
- **THEN** the glide moves at 4.5 metres a second (`packages/genshin-world/src/services/login/scene/constants.ts`)

### Requirement: Rest at the door

The glide SHALL slow to rest on a whole copy of the walkway at the door, keeping on to the first copy that stands the door past the walkway's far end and can be stopped on at that rate (`packages/genshin-world/src/services/login/scene/advanceLoginGlide.ts`).

#### Scenario: Glide comes to rest

- **WHEN** the glide reaches the door
- **THEN** it slows evenly and rests on that copy of the walkway (`packages/genshin-world/src/services/login/scene/advanceLoginGlide.ts`, `packages/genshin-world/src/services/login/scene/advanceLoginGlide.test.ts`)

### Requirement: Scenery rows wrap by their own lengths

The scenery rows SHALL repeat by their own lengths, the walkway's copies 16 metres apart, the towers and bridges 200 metres apart, and the cloud sea's billows and low clouds 300 metres apart.

#### Scenario: Row passes its length

- **WHEN** the glide carries a row past its own length
- **THEN** the row repeats from its start (`packages/genshin-world/src/components/Login/Scene/Index.vue`)

### Requirement: Title opening point

The title SHALL open about 49 metres short of the door.

#### Scenario: Title opens

- **WHEN** the title opens
- **THEN** the camera is about 49 metres short of the door

### Requirement: Bridge passes under the walkway

The bridge whose deck crosses the glide's path SHALL pass under the walkway as the glide passes over it (`packages/genshin-world/src/services/login/scene/constants.ts`).

#### Scenario: Glide crosses the bridge

- **WHEN** the glide passes the bridge
- **THEN** the walkway is above the bridge's deck (`packages/genshin-world/src/services/login/scene/constants.ts`)

## Open

- [ ] **The rows wrap at 16, 200 and 300 metres** — no source yet: the `login/scroll` record is hosted, and its lengths are not kept in the repository or the parity folders.
- [ ] **The title opens about 49 metres short of the door** — no source yet: `computeLoginGlideTitleScrolled` takes its walkway copy length from the open 16 metres, and its result is not checked against 49 here.
