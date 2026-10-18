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

The glide SHALL move at 3.5 metres a second while the title waits and at 4.5 metres a second once the game prepares, changing between the two by 0.63 metres a second each second.

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
