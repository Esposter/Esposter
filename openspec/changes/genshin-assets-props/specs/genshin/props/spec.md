## ADDED Requirements

### Requirement: A prop kind draws its fitted shape once its record is published

The world SHALL draw each prop kind that has a published fitted record as that record's shape, and SHALL keep the stand-in for a kind that has none.

#### Scenario: A prop of a published kind stands as its fitted shape

- **GIVEN** a prop kind has a published fitted record
- **WHEN** the player comes near a placed prop of that kind
- **THEN** the prop stands as its fitted shape, not as the stand-in

#### Scenario: A prop of a kind with no record keeps its stand-in

- **GIVEN** no fitted record is published for a prop kind
- **WHEN** the player comes near a placed prop of that kind
- **THEN** the prop stands as the stand-in it stood as before

### Requirement: A published prop record holds fitted numbers and no game art

A published prop record SHALL hold only fitted numbers and colours, so a record that carries a mesh, texture or icon of the game is refused when it is published.

#### Scenario: A publish of a fitted prop writes numbers only

- **GIVEN** a prop kind's export has been fitted
- **WHEN** its record is published
- **THEN** the record holds its outline and colour, and no mesh, texture or icon

#### Scenario: A record carrying the game's mesh is refused at publish

- **GIVEN** a fit's output includes the vertices of the game's mesh
- **WHEN** the record is published
- **THEN** the publish stops and nothing is written to the hosted data

### Requirement: A prop fit gives the same counts on every rerun

The props fit SHALL print the same counts on every rerun over unchanged exports, and SHALL publish nothing when it runs as a dry run.

#### Scenario: A rerun over unchanged exports prints the same counts

- **GIVEN** a prop kind's exports are unchanged since a dry run
- **WHEN** the dry run is run again
- **THEN** it prints the same counts and publishes nothing

#### Scenario: A kind whose export is missing is named and skipped

- **GIVEN** a prop kind's export is not on disk
- **WHEN** its fit runs
- **THEN** the fit names the missing export and writes no record for that kind

### Requirement: Mora chests stand at the Mora markers of Mondstadt

The world SHALL show a Mora chest at each Mora chest marker of Mondstadt that the official map names, once the Mora chest rows are published for Mondstadt.

#### Scenario: A Mora chest stands at its marker in Mondstadt

- **GIVEN** the player is in Mondstadt and its Mora chest rows are published
- **WHEN** the player comes near a Mora chest marker
- **THEN** a Mora chest stands on its ground there

### Requirement: Every region's unopened chests are offered in the world

The world SHALL offer the unopened chests of each region's chest record, not only Mondstadt's.

#### Scenario: An unopened chest in another region is offered to open

- **GIVEN** the player is in a region whose chest record is published
- **WHEN** the player comes near one of its unopened chests
- **THEN** the chest is offered to open on F

#### Scenario: A region with no published chest record offers no chest

- **GIVEN** the player is in a region whose chest record is not published
- **WHEN** the player is in that region
- **THEN** no chest is offered there

### Requirement: A region's teleport waypoints stand in the world once its map fit passes

The world SHALL stand a region's teleport waypoints in the world only once that region's map fit has passed its bar and its waypoints are written.

#### Scenario: A region whose map fit passes has its waypoints in the world

- **GIVEN** a region's map fit is under its bar and its waypoints are written
- **WHEN** the player is in that region
- **THEN** its waypoints stand in the world as jump landmarks

#### Scenario: A region whose map fit is over its bar has no waypoints

- **GIVEN** a region's map fit is over its bar
- **WHEN** the player is in that region
- **THEN** no waypoint of that region stands in the world

### Requirement: The Windrise statue and oak placements are checked against their recording

The Windrise placement check SHALL report the Windrise statue and the oak each against the statue-resonance recording at its camera, with the score and its bar.

#### Scenario: The check reports each placed piece with its score

- **GIVEN** the statue-resonance recording and the Windrise camera
- **WHEN** the placement check runs
- **THEN** it reports one score for the statue and one for the oak, each with its bar

### Requirement: Each region's Statue of the Seven stands as its own fitted shape

The world SHALL draw each region's Statue of the Seven with that region's fitted shape once the region's statue record is published.

#### Scenario: A region's statue stands as its own fitted shape

- **GIVEN** a region's statue record is published
- **WHEN** the player stands at that region's statue
- **THEN** the statue stands as the fitted shape of its own region

### Requirement: Mondstadt's chests, gather points and puzzles stand at the game's own group placements

The world SHALL place Mondstadt's chests, gather points and puzzles at the placements that the game's own gadget groups give, in place of the public map's.

#### Scenario: A scene's gadget group is read from its block script

- **GIVEN** a scene's gadget group is held by its block script
- **WHEN** the scene's chests, gather points and puzzles are placed in the world
- **THEN** each one of the group stands at the placement the group gives
- **AND** no placement from the public map is used in its place

### Requirement: The Mondstadt gate is drawn from its fitted hull

The deployed build SHALL draw the Mondstadt gate and door part from its fitted hull, a part it does not draw today.

#### Scenario: A gate is drawn from its fitted hull in the deployed build

- **GIVEN** the Mondstadt gate's hull is fitted from the gate and door meshes its export holds
- **WHEN** the deployed build draws Mondstadt
- **THEN** the gate stands as its fitted hull

### Requirement: The Serenitea Pot realm is drawn from its fitted island

The world SHALL draw the Serenitea Pot realm from its fitted island, in place of the disc and two boxes the realm stands as until then.

#### Scenario: The realm is drawn from its fitted island

- **GIVEN** the realm's island outline is fitted from its export
- **WHEN** the player is in the realm
- **THEN** the realm stands as its fitted island
