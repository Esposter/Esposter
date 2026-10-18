## ADDED Requirements

### Requirement: Viewpoint Entry Opening

The Archive SHALL open a viewpoint's entry, with a picture of its place, when the player views that viewpoint at its place.

#### Scenario: a reached viewpoint opens its entry when viewed

- **GIVEN** a viewpoint with a known place whose entry is locked
- **WHEN** the player reaches that place and chooses to view it
- **THEN** the viewpoint's entry opens with a picture of the place

#### Scenario: a viewpoint is placed at the point its scene group record gives

- **GIVEN** a viewpoint whose scene group record gives a point
- **WHEN** the player is in the open world
- **THEN** the viewpoint's place is that point

#### Scenario: a viewpoint with no known place is not offered

- **GIVEN** a viewpoint whose place is not known
- **WHEN** the player is anywhere in the open world
- **THEN** the viewpoint is not offered for viewing

### Requirement: Living Beings Defeat Count

The Archive SHALL count each defeat of an enemy toward that enemy's Living Beings entry, and SHALL open the entry on the first defeat.

#### Scenario: the first defeat opens an enemy's entry with a count of one

- **GIVEN** an enemy whose Living Beings entry is locked
- **WHEN** the player defeats that enemy for the first time
- **THEN** the enemy's entry opens with a defeated count of one

#### Scenario: a later defeat raises an enemy's count

- **GIVEN** an enemy whose Living Beings entry is open with a count
- **WHEN** the player defeats that enemy again
- **THEN** the enemy's defeated count rises by one

### Requirement: Tutorial Entry Opening

The Archive SHALL open a tutorial's entry the first time the game shows that tutorial's tip.

#### Scenario: a tutorial's entry opens when its tip is first shown

- **GIVEN** a tutorial whose entry is locked
- **WHEN** the game shows that tutorial's tip for the first time
- **THEN** the tutorial's entry opens

#### Scenario: a tutorial's entry stays as it was when its tip is shown again

- **GIVEN** a tutorial whose entry is already open
- **WHEN** the game shows that tutorial's tip again
- **THEN** the tutorial's entry remains open and unchanged

### Requirement: Opened Entries Kept

The game SHALL keep each opened entry and each Living Beings defeat count with the player's progress across reloads.

#### Scenario: opened entries and counts survive a reload

- **GIVEN** a player with open entries and defeat counts
- **WHEN** the player reloads the game
- **THEN** the same entries are open and the same counts are shown
