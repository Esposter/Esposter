## ADDED Requirements

### Requirement: Strongbox Record

The hosted game data SHALL hold one strongbox record per set the Mystic Offering offers, with the set, its display name's text id, the artifact rarity and count it takes, and the set's pieces it can hold.

#### Scenario: a strongbox takes its set and pieces from its display item and offer row

- **GIVEN** a reward preview whose first item is a strongbox display item naming a set, and an offer row whose link is that set
- **WHEN** the strongbox record is built
- **THEN** the record names that set, its display name's text id and the offer row's pieces

#### Scenario: a strongbox with no offer row is left out

- **GIVEN** a strongbox display item whose set has no offer row
- **WHEN** the strongbox record is built
- **THEN** no record is made for that set

#### Scenario: a strongbox record that does not match its shape is refused

- **GIVEN** a record in the hosted game data that lacks a piece's item id
- **WHEN** the record is read
- **THEN** the read is refused

### Requirement: Strongbox Roll

A strongbox SHALL hold one piece of its chosen set, rolled as an artifact of five stars through the artifact roll.

#### Scenario: a strongbox rolls a piece of its chosen set at five stars

- **GIVEN** a strongbox of a set whose pieces it lists
- **WHEN** the strongbox is rolled
- **THEN** the artifact is a piece of that set at five stars, with the starting minor affixes of its piece

### Requirement: Giving Up Three Artifacts

The Mystic Offering SHALL take three unlocked five-star artifacts of the bag, remove them, and take in the strongbox's artifact.

#### Scenario: three unlocked five-star artifacts become one strongbox artifact in the bag

- **GIVEN** three unlocked five-star artifacts in the bag
- **WHEN** the player offers them for a strongbox
- **THEN** the three are removed and one strongbox artifact is taken into the bag

#### Scenario: a locked artifact is not offered

- **GIVEN** an artifact whose lock is set
- **WHEN** the player offers it
- **THEN** the offering is refused and nothing is removed

#### Scenario: a choice of other than three artifacts is refused

- **GIVEN** two artifacts chosen for an offering
- **WHEN** the player offers them
- **THEN** the offering is refused and nothing is removed

### Requirement: Opening the Mystic Offering

The Mystic Offering SHALL open at Adventure Rank 45 and no lower.

#### Scenario: the panel lists only the offerable artifacts

- **GIVEN** a bag with a five-star unlocked artifact, a locked one and a four-star one
- **WHEN** the panel lists the artifacts it can offer
- **THEN** only the unlocked five-star artifact is listed

#### Scenario: the offering opens from adventure rank 45

- **GIVEN** a player at Adventure Rank 44
- **WHEN** the Crafting Bench's offerings are listed
- **THEN** the Mystic Offering is not open, and at Adventure Rank 45 it is

### Requirement: Words

The Mystic Offering's words SHALL come from the game's text by their text ids.

#### Scenario: the offering's tip fills its artifact counts

- **GIVEN** the English game text
- **WHEN** the offering's tip is filled with three artifacts of five stars
- **THEN** the tip names three artifacts and five stars
