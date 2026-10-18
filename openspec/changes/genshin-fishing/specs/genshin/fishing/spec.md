## ADDED Requirements

### Requirement: Fishing opens once the Serenitea Pot is owned

Fishing at a fishing point SHALL be offered only once the player owns the Serenitea Pot and has finished its quest.

#### Scenario: Fishing stays closed before the Serenitea Pot is owned

- **GIVEN** the player does not own the Serenitea Pot or has not finished its quest
- **WHEN** the player is at a fishing point
- **THEN** no fishing prompt is offered

#### Scenario: Fishing opens at a point once the Serenitea Pot is owned

- **GIVEN** the player owns the Serenitea Pot and has finished its quest
- **WHEN** the player is at a fishing point in reach
- **THEN** the fishing prompt is offered

### Requirement: A fish nibbles for a drawn time before it bites

A fish that turns to the lure SHALL nibble for a time drawn from its feeler range, and SHALL bite when that time has passed.

#### Scenario: A fish nibbles for a drawn time and then bites

- **GIVEN** a fish's nibble time is one second
- **WHEN** one second passes after the fish turns to the lure
- **THEN** the fish bites

### Requirement: A strike on a fish reels it or scares it off

A strike SHALL start the reel on a biting fish, SHALL scare off a fish that is only nibbling, and SHALL leave a bite that goes unstruck past its timeout to lapse.

#### Scenario: A strike while biting starts the reel

- **GIVEN** a fish is biting the lure
- **WHEN** the player strikes
- **THEN** the reel starts

#### Scenario: A strike while nibbling scares the fish off

- **GIVEN** a fish is only nibbling the lure
- **WHEN** the player strikes
- **THEN** the fish is scared off and the cast returns to aiming

#### Scenario: A bite left unstruck lapses

- **GIVEN** a fish is biting the lure
- **WHEN** the fish's bite timeout passes without a strike
- **THEN** the bite lapses and the cast returns to aiming

### Requirement: The reel breaks the line when it stays out of the zone too long

The reel SHALL break the line when the tension stays out of the zone for too long, and SHALL catch the fish when the fish's health is worn to none.

#### Scenario: The line breaks after too long out of the zone

- **GIVEN** the reel is under way
- **WHEN** the tension stays out of the zone for too long
- **THEN** the line breaks and the cast ends

#### Scenario: A catch puts the fish in the bag

- **GIVEN** the reel is under way
- **WHEN** the fish's health is worn to none
- **THEN** the items its reward row gives go into the bag, the fish's own item only where that row names it, and no proficiency is counted

### Requirement: A point draws fish from its region's pools

A fishing point SHALL draw its fish from every pool of its region, and a point in a region with no pool SHALL draw nothing.

#### Scenario: A point draws from its region's pools

- **GIVEN** a fishing point stands in a region with pools
- **WHEN** the player casts from the point
- **THEN** the fish drawn come from those pools

#### Scenario: A point in a region with no pool draws nothing

- **GIVEN** a fishing point stands in a region whose city is filed under no pool
- **WHEN** the player casts from the point
- **THEN** no fish is drawn

### Requirement: Each bait draws only its own fish

A fish SHALL be drawn only by its own bait, crafted from its recipe.

#### Scenario: A fish is drawn only by its own bait

- **GIVEN** the player casts with a bait
- **WHEN** a fish is drawn
- **THEN** the fish is one the bait names

#### Scenario: A cast with another bait draws none of a fish's kind

- **GIVEN** the player casts with a bait that does not name a fish
- **WHEN** the cast draws
- **THEN** that fish is not drawn

### Requirement: Proficiency is exchanged at the Fishing Association

Fishing proficiency SHALL be exchanged at the region's Fishing Association for the rewards its shop offers.

#### Scenario: Proficiency exchanges for a reward at the association

- **GIVEN** the player has fishing proficiency
- **WHEN** the player exchanges it at the region's Fishing Association
- **THEN** the reward is given and the proficiency is spent
