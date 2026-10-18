## Purpose

Heizou's kit as built: his Anemo strikes, charged attack and plunges, Heartstopper Strike's press and full hold, and Fudou Style Vacuum Slugger with its Windmuster Iris, with his passives and constellations left unbuilt.

## Requirements

### Requirement: Anemo strikes, charged attack and plunges

Heizou's strikes, charged attack and plunges SHALL deal Anemo hits, with the plunge collision applying no gauge.

#### Scenario: Strike chain plays five strikes

- **GIVEN** Heizou is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his five strikes play in order
- **AND** the fourth strike deals three hits

#### Scenario: A strike applies one unit of Anemo gauge

- **GIVEN** Heizou is the character on the field
- **WHEN** one of his strikes lands
- **THEN** it applies 1 unit of Anemo gauge

#### Scenario: The plunge collision applies no gauge

- **GIVEN** Heizou is in the air
- **WHEN** the plunge collision lands
- **THEN** it applies no gauge

### Requirement: Heartstopper Strike press and full hold

Heartstopper Strike SHALL release as a press when tapped and as a full hold when held for three seconds.

#### Scenario: A tap releases the press

- **GIVEN** Heizou is the character on the field
- **WHEN** the player taps Heartstopper Strike
- **THEN** the press releases
- **AND** it applies 2 units of Anemo gauge

#### Scenario: A shorter hold reads as the press

- **GIVEN** Heizou is the character on the field
- **WHEN** the player holds Heartstopper Strike for less than three seconds
- **THEN** it releases as the press

#### Scenario: A full hold releases with four Declension stacks

- **GIVEN** Heizou is the character on the field
- **WHEN** the player holds Heartstopper Strike for three seconds
- **THEN** it releases with four Declension stacks and its Conviction bonus

### Requirement: Fudou Style Vacuum Slugger sets a Windmuster Iris

Fudou Style Vacuum Slugger SHALL strike a circle and set a Windmuster Iris on each of its first four enemies that holds Pyro, Hydro, Electro or Cryo.

#### Scenario: The aura is read before the Anemo hit

- **GIVEN** Heizou is the character on the field
- **WHEN** the player casts Fudou Style Vacuum Slugger
- **THEN** each enemy's aura is read just before its Anemo hit
- **AND** the check deals no damage, so the hit's Swirl does not take the aura first

#### Scenario: A matching enemy gets an Iris that explodes

- **GIVEN** one of the first four enemies struck holds Pyro, Hydro, Electro or Cryo
- **WHEN** the cast reaches that enemy
- **THEN** a Windmuster Iris is set on the enemy, choosing among them in the order Pyro, Hydro, Electro, Cryo
- **AND** 40 frames later it explodes in that element with 1 unit of gauge in a circle round the enemy

#### Scenario: No matching enemy gets no Iris

- **GIVEN** none of the first four enemies struck holds Pyro, Hydro, Electro or Cryo
- **WHEN** the cast ends
- **THEN** no Windmuster Iris is set

### Requirement: Heizou's hits deal no poise

Heizou's strikes, charged attack, plunges, skill and burst SHALL deal no poise.

#### Scenario: A hit deals no poise

- **GIVEN** Heizou is the character on the field
- **WHEN** any of his hits lands
- **THEN** it deals no poise
