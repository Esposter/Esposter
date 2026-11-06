## ADDED Requirements

### Requirement: The family is drawn from shapes of ours and never from the game's bytes

The recreation SHALL draw every fish, rod, float, splash, animal, critter, pet and prop of this family from shapes of its own, serving none of the game's meshes, textures, clips or icons for them.

#### Scenario: The published family holds no game asset

- **GIVEN** the recreation is built and deployed
- **WHEN** its published data and its served files are listed
- **THEN** no mesh, texture, clip or icon of a fish, rod, float, animal, critter, pet or prop of the game is among them

#### Scenario: A family asset without fitted parameters is drawn as its stand-in

- **GIVEN** a fish or an animal has no fitted parameters yet
- **WHEN** the scene draws it
- **THEN** its generated stand-in is drawn instead

### Requirement: A hooked fish is drawn at the lure

While a fish is hooked, the scene SHALL draw one fish body at the lure's point, taken from the fish's own record.

#### Scenario: A hooked fish is drawn at the lure

- **GIVEN** a fish is hooked on the reel
- **WHEN** the reel's scene is shown
- **THEN** one fish body stands at the lure's point

#### Scenario: A fish with no codex model is drawn as its category's stand-in

- **GIVEN** a fish's record names a codex row that has no model
- **WHEN** the fish is hooked
- **THEN** the stand-in fish of its category stands at the lure instead

#### Scenario: A fish record keeps its monster id and category

- **GIVEN** a fish is in the fishing dataset
- **WHEN** its record is read
- **THEN** the record names the fish's monster id and its category

### Requirement: A cast shows a rod and a float until the line is reeled in

While a line is out, the scene SHALL show a rod in the character's hand and a float on the water at the lure's point, until the line is reeled in or lost.

#### Scenario: A cast shows the rod and the float

- **GIVEN** a line is out at a fishing point
- **WHEN** the cast is shown
- **THEN** the character holds a rod
- **AND** the float rests at the lure's point

#### Scenario: Reeling in clears the rod and the float

- **GIVEN** a line is out
- **WHEN** the line is reeled in
- **THEN** the rod and the float leave the scene

### Requirement: A strike that catches the bite throws a splash

A strike that catches the bite SHALL throw a splash and rings out from the lure on the water.

#### Scenario: A struck bite shows a splash

- **GIVEN** a fish is biting
- **WHEN** the player strikes
- **THEN** a splash and rings appear at the lure

#### Scenario: A strike with no bite shows no splash

- **GIVEN** no fish is biting
- **WHEN** the player strikes
- **THEN** no splash appears

### Requirement: A fishing point shows its ripple ring only while its region has fish

A fishing point SHALL show a ripple ring at its place only while a stock of its region still has fish.

#### Scenario: A point with fish left shows its ring

- **GIVEN** a region's stock still has fish at the hour
- **WHEN** the point is in reach
- **THEN** its ripple ring shows at the point

#### Scenario: A point whose stock is empty shows no ring

- **GIVEN** every fish of the region's stock is caught
- **WHEN** the point is in reach
- **THEN** no ripple ring shows at the point

### Requirement: A fleeing kind is drawn as its own silhouette

A bird or beast that flees or charges SHALL be drawn as one silhouette of its kind instead of a capsule, once a silhouette of that kind exists.

#### Scenario: A fleeing animal is drawn as its kind

- **GIVEN** a Crimson Fox is in the character's reach
- **WHEN** the fox runs
- **THEN** it is drawn as a fox silhouette, not a capsule

#### Scenario: A kind with no silhouette stays a capsule

- **GIVEN** a kind has no silhouette yet
- **WHEN** it is drawn
- **THEN** it is drawn as a capsule

### Requirement: A fleeing animal runs at the speed its run clip gives

A fleeing animal SHALL run at the speed and for the time its own run clip gives, unless a recording of its flight is found and taken instead.

#### Scenario: A startled animal runs at its clip's speed

- **GIVEN** a White Pigeon is startled
- **WHEN** it runs
- **THEN** it covers ground at the speed its run clip gives, for the time the clip gives

#### Scenario: A clip without root motion keeps the provisional speed

- **GIVEN** a run clip carries no root motion
- **WHEN** its numbers are read
- **THEN** the provisional speed stays
- **AND** the reading names no speed

### Requirement: A critter of a gather row stands at each of its points

A critter of a gather row SHALL stand at each of its map points as one stand-in shape per species group.

#### Scenario: A critter stands at each of its points

- **GIVEN** a crab's points are in the region
- **WHEN** the region's points are drawn
- **THEN** a crab stand-in stands at each of them

#### Scenario: A butterfly stands at no point

- **GIVEN** butterflies have no gather row
- **WHEN** the region's points are drawn
- **THEN** no butterfly stands at any point

### Requirement: A picked critter gives its item and vanishes

A critter of a material group SHALL give its gather item when the player picks it up, and then vanish from the scene.

#### Scenario: A picked critter gives its item and vanishes

- **GIVEN** a critter of a material group stands at a point in reach
- **WHEN** the player picks it up
- **THEN** its gather item goes into the bag
- **AND** the critter leaves the scene

### Requirement: A fishing-area prop stands where its region's layout places it

A fishing-area prop SHALL stand at the place its region's layout gives, drawn as one of our stand-ins.

#### Scenario: A prop stands at its layout's place

- **GIVEN** a region's layout places a fishing prop
- **WHEN** the region loads
- **THEN** the prop stands at that place

#### Scenario: A prop without a layout place is not drawn

- **GIVEN** a fishing prop has no place in any layout
- **WHEN** the region loads
- **THEN** no stand-in is drawn for it

### Requirement: An icon is a traced glyph of ours or a disc, never the game's image

A fish, bait, rod or animal icon SHALL be drawn as a glyph traced into a path of ours or as a disc, and never as the game's own image file.

#### Scenario: A traced icon replaces a disc

- **GIVEN** a fish's icon has been traced
- **WHEN** the fish shows in the bag
- **THEN** the traced glyph shows where the disc was

#### Scenario: An untraced icon stays a disc

- **GIVEN** an animal's icon has not been traced yet
- **WHEN** its codex entry shows
- **THEN** a disc shows in the icon's place

### Requirement: The reel's challenge panel shows its words from the game's text

The reel's challenge panel SHALL show its words from the game's text by key, in the reader's game language.

#### Scenario: The challenge panel shows the game's words in the reader's language

- **GIVEN** the reader's game language is set
- **WHEN** the reel's challenge is shown
- **THEN** the panel's words come from the game's text of that language, by key
