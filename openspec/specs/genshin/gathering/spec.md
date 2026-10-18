## Purpose

The plants and specialties the official map marks, placed by the fit into each region as gathering points, picked with F and kept gone until their respawn. A local specialty comes back 46 hours after it is picked, and a cooking ingredient at the game's midnight that follows, as the wiki gives each. The gather table's refresh ids name no policy in the dump, so the category settles it.

## Requirements

### Requirement: Gathering points stand where the official map marks their item

Gathering points SHALL stand in each region where the official map marks their item, and an item the game excludes SHALL NOT be a gathering point.

#### Scenario: Plant stands at its official map mark

- **GIVEN** the official map marks a plant in a region
- **WHEN** the region is loaded
- **THEN** a gathering point for the plant stands at that mark

#### Scenario: Mining item is not a gathering point

- **GIVEN** an item is drawn by a mining outcrop instead
- **WHEN** the gathering points are built
- **THEN** no gathering point is made for that item

### Requirement: F picks a gathering point into the bag

Pressing F on a gathering point SHALL pick its item into the bag, and the point SHALL stay standing when the bag has no room for it.

#### Scenario: Pick puts the item in the bag

- **GIVEN** a gathering point is standing in reach and the bag has room
- **WHEN** the player presses F on it
- **THEN** the item goes into the bag and the point is gone

#### Scenario: Full bag leaves the point standing

- **GIVEN** a gathering point is standing in reach and the bag is full
- **WHEN** the player presses F on it
- **THEN** the point stays standing

### Requirement: A picked local specialty stands again after 46 hours

A picked local specialty SHALL stand again 46 hours after it was picked.

#### Scenario: Specialty is back after 46 hours

- **GIVEN** a local specialty was picked
- **WHEN** 46 hours have passed
- **THEN** the specialty stands again

#### Scenario: Specialty is still gone before 46 hours

- **GIVEN** a local specialty was picked
- **WHEN** less than 46 hours have passed
- **THEN** the specialty stays gone

### Requirement: A picked cooking ingredient stands again at the next midnight

A picked cooking ingredient SHALL stand again at the game's next midnight after the pick, on the game's clock.

#### Scenario: Ingredient picked before midnight is back at midnight

- **GIVEN** a cooking ingredient was picked before the game's midnight
- **WHEN** the game's midnight comes
- **THEN** the ingredient stands again

### Requirement: An ore is struck and broken rather than picked

An ore SHALL NOT be picked with F, and SHALL be broken by the hits that land on it.

#### Scenario: F does not pick an ore

- **GIVEN** an ore is standing in reach
- **WHEN** the player presses F on it
- **THEN** nothing is picked

### Requirement: An ore breaks once its hits reach its poise requirement

An ore SHALL break once the poise its landed hits deal reaches its requirement for the kind of hit, blunt or melee.

#### Scenario: Burst breaks a crystal chunk in one hit

- **GIVEN** a burst's blunt hit lands on a crystal chunk
- **WHEN** the hit is dealt
- **THEN** the crystal chunk breaks

#### Scenario: Hit that is neither blunt nor melee adds nothing

- **GIVEN** a hit is neither blunt nor melee
- **WHEN** it lands on an ore
- **THEN** the ore takes no poise from it

#### Scenario: Claymore attacks, plunges and Geo damage strike blunt

- **GIVEN** a claymore's normal attack, a sword's or polearm's plunge, or a hit that deals Geo damage lands on an ore
- **WHEN** the hit is dealt
- **THEN** the ore takes its poise as a blunt hit, against the blunt requirement

#### Scenario: A Geo character's physical normal attack and a listed exception do not strike blunt

- **GIVEN** a Geo character's normal attack, which deals no element, lands on an ore, or Ningguang's plunge lands on it
- **WHEN** the hit is dealt
- **THEN** the ore takes its poise as a melee hit or none, and Ningguang's plunge is not blunt, as the wiki's table excepts it

#### Scenario: A Geo Traveler's skill strikes blunt, as the element it deals is Geo

- **GIVEN** a Geo Traveler's skill, which takes her wielder's element, lands on an ore
- **WHEN** the hit is dealt
- **THEN** the ore takes its poise as a blunt hit

#### Scenario: Converted poise from an infusion does not reach an ore

- **GIVEN** a hit's damage has been converted by an infusion
- **WHEN** it lands on an ore
- **THEN** the converted poise does not count toward breaking the ore

#### Scenario: Overloaded explosion strikes ores nearby

- **GIVEN** an Overloaded reaction lands on an enemy
- **WHEN** the explosion resolves
- **THEN** ores within three metres of that enemy take a blunt hit of ninety poise

### Requirement: A broken ore drops its pieces where it lay

A broken ore SHALL drop its certain piece where it lay, and one more for each of two draws that comes under ten per cent.

#### Scenario: Broken ore drops its certain piece

- **GIVEN** an ore breaks
- **WHEN** it breaks
- **THEN** its certain piece drops where it lay

#### Scenario: Extra piece drops on a successful draw

- **GIVEN** an ore breaks
- **WHEN** each of its two draws comes under ten per cent
- **THEN** one extra piece drops for each draw that succeeds

### Requirement: An ore stands again on its own respawn

A broken ore SHALL stand again on its own respawn: an iron chunk at the game's midnight, a white iron chunk or starsilver two days after it breaks, and a crystal chunk, amethyst lump or condessence crystal three days after it breaks.

#### Scenario: White iron chunk is back two days after breaking

- **GIVEN** a white iron chunk breaks
- **WHEN** two days have passed
- **THEN** it stands again

#### Scenario: Crystal chunk is back three days after breaking

- **GIVEN** a crystal chunk breaks
- **WHEN** three days have passed
- **THEN** it stands again
