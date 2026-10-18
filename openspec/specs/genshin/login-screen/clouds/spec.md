## Purpose

Login clouds, as built: the clouds over the login's cloud sea and above its towers, in three bands and the sky's cloud layer, with each hour drawing its own share of each band.

## Requirements

### Requirement: Cloud bands from the game's clouds

The login clouds SHALL be three bands drawn from the game's painted clouds, shown as billboards in the sky's cloud colours, so each hour recolours them without repainting them.

#### Scenario: Hour changes the cloud colours

- **WHEN** the time of day changes
- **THEN** the clouds take that hour's cloud colours without being repainted

#### Scenario: Nearer cloud blends over farther

- **WHEN** a band scrolls past the camera
- **THEN** the nearer cloud is drawn over the farther one

### Requirement: Cloud colour and edge

Each cloud SHALL brighten toward the sun, fade over its soft edge and fade below the horizon.

#### Scenario: Cloud toward the sun

- **WHEN** a cloud lies toward the sun
- **THEN** it is brighter than a cloud away from it

#### Scenario: Cloud below the horizon

- **WHEN** a cloud sinks below the horizon
- **THEN** it fades out

### Requirement: Cloud sea clears the walkway

The cloud sea SHALL scroll past the glide, so that no billow stands over the walkway where the glide passes.

#### Scenario: Glide passes over the sea

- **WHEN** the glide passes a point of the cloud sea
- **THEN** no billow stands over the walkway at that point

### Requirement: Each hour's share of each band

Each hour SHALL draw its own share of each band's clouds, and a thinner sky SHALL leave the rest of the clouds undrawn.

#### Scenario: Thinner sky

- **WHEN** an hour's share of a band is smaller
- **THEN** the clouds beyond that share are not drawn

### Requirement: Unsolved day and night cover

The day's and the night's cloud cover SHALL keep its current share until their clouds match the recordings' kind.

#### Scenario: Day cover

- **WHEN** the day is shown
- **THEN** its cloud cover is the current share, not yet solved against the recording

### Requirement: Cloud layer over the bands

The sky's cloud layer SHALL be drawn over the bands by the game's own layer program, with its textures written in an idle moment after the scene mounts.

#### Scenario: Scene mounts

- **WHEN** the scene mounts
- **THEN** the layer's textures are written in an idle moment, so the mount does not wait for them

### Requirement: Layer draws nothing until its settings are solved

The cloud layer SHALL draw no settings for an hour until that hour's solve beats drawing none.

#### Scenario: Hour without solved settings

- **WHEN** an hour has no solved layer settings
- **THEN** the layer is drawn with none
