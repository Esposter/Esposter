## Purpose

How a 3D scene is re-derived from the game's own assets, inside the recreation passes that order its unknowns. Each piece of information is sorted as exact, fieldless or on screen only and answered by the most exact query the data allows, never by a search over the frame. The witness render draws the exports through our own engine, so each stand-in is measured against the game's own data, and each is closed by the least representation that closes it: an exact value, a fitted generator or a richer kit. An open-world region is first laid out with every object at its exact place as a stand-in, then rebuilt one object at a time, each fitted against its own export.

## Requirements

### Requirement: Each piece of scene information is classed before it is derived

Each piece of a scene's information SHALL be classed as exact, fieldless or on screen only before it is derived, and SHALL be derived by the most exact query the data allows.

#### Scenario: A value held in the export is written exactly

- **GIVEN** the game's export holds a value as a number or a pixel
- **WHEN** the scene's information is classed
- **THEN** the value is classed as exact
- **AND** it is written into the scene's data as read

#### Scenario: A setting no shape in the data names is measured off captures

- **GIVEN** a setting is held by the game but named by nothing in the export
- **WHEN** the scene's information is classed
- **THEN** the setting is classed as fieldless
- **AND** it is measured off the captures over what is exact

### Requirement: No unknown is settled by a search over the frame

A scene's unknowns SHALL NOT be settled by searching over the score of a frame, and a camera pose SHALL be solved from landmarks in closed form and refined on edges.

#### Scenario: A camera pose is solved from landmarks

- **GIVEN** a reference frame has camera landmarks visible
- **WHEN** the camera is needed
- **THEN** the pose is solved from the landmarks rather than found by a grid of poses
- **AND** it is refined on the stone's silhouette edges

### Requirement: A scene is inventoried before anything is built

A scene SHALL be inventoried, listing every object, material, texture and script spawn it draws, before any stand-in is built for it.

#### Scenario: The inventory lists everything the game draws

- **GIVEN** a scene is to be re-derived
- **WHEN** the inventory is taken
- **THEN** every renderer, material, texture slot and script spawn the scene uses is listed
- **AND** no stand-in is built until the inventory is complete

### Requirement: Each loss is priced in its pass and the largest is closed first

Each loss inside a pass SHALL be priced by the frame error it could recover, and the largest SHALL be closed first, while an earlier pass SHALL be frozen before a later one begins.

#### Scenario: The largest loss in a pass is worked first

- **GIVEN** a pass has several losses
- **WHEN** the next loss is chosen
- **THEN** the loss that recovers the most frame error is chosen

#### Scenario: A later pass waits for the earlier pass to freeze

- **GIVEN** an earlier pass has not yet met its measure
- **WHEN** work is chosen
- **THEN** no later pass begins

### Requirement: A loss is closed by the least representation that closes it

A loss SHALL be closed by the least representation that closes it: an exact value first, then a fitted generator, and a richer kit only when neither reaches the reference's noise.

#### Scenario: An exact value closes a loss when one suffices

- **GIVEN** a loss can be closed by a value the export holds
- **WHEN** the representation is chosen
- **THEN** the exact value is used

#### Scenario: A richer kit is added only when no generator reaches the noise

- **GIVEN** no fitted generator reaches the reference's noise
- **WHEN** the representation is chosen
- **THEN** the kit grows the parameters that close the loss

### Requirement: A representation is judged at the reference cameras

A representation SHALL be judged by its pass's measure at the reference cameras, never by how it looks in isolation.

#### Scenario: A texture that looks different close up costs nothing at distance

- **GIVEN** a stone texture differs visibly up close
- **WHEN** the pass's measure is taken at the reference camera's distance
- **THEN** the texture is accepted if its cost at that distance is within the noise

### Requirement: Each layer of a reference is scored on its own

Each layer of a reference SHALL be scored on its own, so that a change is judged where it lands.

#### Scenario: A change is judged on the layer it changes

- **GIVEN** a change alters one layer of a scene
- **WHEN** the scene is scored
- **THEN** that layer's own shape, tone and detail scores show the change
- **AND** the other layers' scores are unchanged

### Requirement: An open-world region is laid out first and each object rebuilt once

An open-world region SHALL be laid out with every object at its exact place, and then each object SHALL be rebuilt one at a time against its own export until its gap is within the reference's noise.

#### Scenario: Objects are rebuilt one at a time

- **GIVEN** a region is laid out with every object as a stand-in
- **WHEN** the largest object gap is worked
- **THEN** that object is rebuilt and fitted against its own export

#### Scenario: Light and sky are calibrated only after every object is within noise

- **GIVEN** some object's gap is still beyond the reference's noise
- **WHEN** the frame is calibrated
- **THEN** the light, haze and sky are not yet calibrated

### Requirement: Nothing of the game's files ships in the product

The product SHALL NOT commit, build, upload or deploy any file, format or data of the game, and SHALL ship only its own shaders, geometry and fitted data.

#### Scenario: A deployed product holds no game data

- **GIVEN** the product is built and deployed
- **WHEN** its contents are inspected
- **THEN** it holds only the product's own shaders, generated geometry and fitted data
- **AND** it holds no file or data taken from the game

#### Scenario: The witness render does not ship

- **GIVEN** the product is built
- **WHEN** its contents are inspected
- **THEN** the witness render page is not among them

### Requirement: A region's ground is published only once it holds its gate

A region's ground SHALL be published only when its fit holds the bar set for it at its centre and its landmarks stand within the gate.

#### Scenario: A ground missing its gate is not published

- **GIVEN** a region's fitted ground exceeds the bar at its centre
- **WHEN** the fit is published
- **THEN** the ground is not published

#### Scenario: A landmark moving more than the gate fails the fit

- **GIVEN** a landmark's ground would move by more than five centimetres
- **WHEN** the fit is checked
- **THEN** the fit fails and the ground is not published
