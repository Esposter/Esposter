## Purpose

Furina's kit as built, with her four strikes and the Arkhe hits they open, the charged attack that turns her Arkhe, plunges, Salon Solitaire's Ousia members who drain the team or Pneuma's Singer who heals it, Let the People Rejoice with its Fanfare, Endless Waltz, her fourth ascension and three of her constellations, with the rest not built.

## Requirements

### Requirement: Strikes open Arkhe hits

Furina's four strikes SHALL each open an Arkhe hit of their own, at most once within each six-second cooldown.

#### Scenario: A strike opens the Arkhe hit

- **GIVEN** Furina is in Ousia and her Arkhe hit is off cooldown
- **WHEN** one of her four strikes lands
- **THEN** her Arkhe hit follows 30 frames later
- **AND** the hit is Spiritbreath Thorn in Ousia or Surging Blade in Pneuma, a Hydro hit that applies no elemental gauge

#### Scenario: A strike inside the cooldown opens no Arkhe hit

- **GIVEN** an Arkhe hit was opened less than six seconds ago
- **WHEN** another of her strikes lands
- **THEN** no Arkhe hit follows

### Requirement: Charged attack turns the Arkhe

Furina's charged attack SHALL strike a circle round her and turn her Arkhe.

#### Scenario: Charged attack strikes and turns the Arkhe

- **GIVEN** Furina is the character on the field
- **WHEN** the player plays her charged attack
- **THEN** its circle strikes 33 frames in
- **AND** her Arkhe turns between Ousia and Pneuma

### Requirement: Salon Solitaire brings out Ousia members or Pneuma's Singer

Salon Solitaire SHALL bring out Gentilhomme Usher, Surintendante Chevalmarin and Mademoiselle Crabaletta in Ousia, or the Singer of Many Waters in Pneuma, and its summons SHALL stand for about 28.9 seconds.

#### Scenario: Ousia members drain the team and strike

- **GIVEN** Furina is in Ousia and an enemy stands within a member's reach
- **WHEN** the player casts Salon Solitaire
- **THEN** each member drains every deployed member above half HP by a share of that member's Max HP
- **AND** each member strikes the enemy nearest it with a hit of a share of Furina's Max HP, a tenth harder for each member it drained

#### Scenario: A member with no enemy in reach does nothing

- **GIVEN** no enemy stands within a member's reach
- **WHEN** the member's turn comes
- **THEN** it neither drains the team nor strikes
- **AND** this reading stays provisional until a recording settles it

#### Scenario: The Singer heals in Pneuma

- **GIVEN** Furina is in Pneuma
- **WHEN** the player casts Salon Solitaire
- **THEN** the Singer of Many Waters appears 10 frames in
- **AND** every two seconds it heals the character on the field by a flat amount and a share of Furina's Max HP

#### Scenario: A new Salon Solitaire ends the one before

- **GIVEN** Salon Solitaire's summons stand
- **WHEN** the player casts Salon Solitaire again
- **THEN** the earlier summons end
- **AND** the new summons stand for about 28.9 seconds

### Requirement: Let the People Rejoice builds Fanfare from HP changes

Let the People Rejoice SHALL build Fanfare from changes to team members' HP, up to 300 points, and each point SHALL raise every deployed member's DMG Bonus and Incoming Healing Bonus while the Fanfare lasts.

#### Scenario: Casting Let the People Rejoice strikes and starts the Fanfare

- **GIVEN** Furina is the character on the field
- **WHEN** the player casts Let the People Rejoice
- **THEN** a circle round her strikes 98 frames in for a share of her Max HP
- **AND** the Fanfare starts 95 frames in and lasts 18.2 seconds

#### Scenario: A change to a member's HP builds points

- **GIVEN** the Fanfare stands
- **WHEN** a deployed member's HP changes by 5% of their HP
- **THEN** the Fanfare gains 5 points

#### Scenario: Points give every member DMG and healing bonuses

- **GIVEN** the Fanfare holds points
- **WHEN** a hit or a heal lands on the deployed team
- **THEN** each point gives every deployed member a 0.07% DMG Bonus to every element and Physical
- **AND** each point gives every deployed member a 0.01% Incoming Healing Bonus

#### Scenario: The Fanfare stops at its most

- **GIVEN** the Fanfare holds 300 points
- **WHEN** another change to a member's HP lands
- **THEN** no further points are gained

#### Scenario: Changes inside one window land together

- **GIVEN** a member's HP changes
- **WHEN** the first point lands 6 frames later
- **THEN** the window opens a frame after it and changes inside it land as it closes
- **AND** the window is an estimate of the game's debounce that stays provisional until a recording settles it

#### Scenario: A new Let the People Rejoice ends the Fanfare before it

- **GIVEN** a Fanfare stands
- **WHEN** the player casts Let the People Rejoice again
- **THEN** the earlier Fanfare ends
- **AND** the new Fanfare lasts 18.2 seconds

### Requirement: Endless Waltz from another character's overheal

From her first ascension, Endless Waltz SHALL regenerate 2% of each deployed member's own Max HP every two seconds for four seconds after another character's heal runs past full HP on the character on the field.

#### Scenario: An overheal on the character on the field starts Endless Waltz

- **GIVEN** Furina has her first ascension
- **WHEN** another character's heal runs past full HP on the character on the field
- **THEN** each deployed member regenerates 2% of their own Max HP every two seconds
- **AND** the regeneration continues for four seconds after the last such heal

#### Scenario: A heal that stays under full HP starts nothing

- **GIVEN** Furina has her first ascension
- **WHEN** another character's heal brings the character on the field to full HP without running past it
- **THEN** Endless Waltz does not start

### Requirement: Ascension 4 raises Salon members and speeds the Singer

From her fourth ascension, Salon Solitaire's members SHALL deal more DMG and the Singer SHALL heal more often, each capped.

#### Scenario: Members deal more DMG as Max HP grows

- **GIVEN** Furina has her fourth ascension
- **WHEN** a Salon member strikes
- **THEN** its DMG rises by 0.7% for each 1,000 of Furina's Max HP
- **AND** the rise stops at 28%

#### Scenario: The Singer heals more often as Max HP grows

- **GIVEN** Furina has her fourth ascension and is in Pneuma
- **WHEN** the Singer heals
- **THEN** its interval shortens by 0.4% for each 1,000 of Furina's Max HP
- **AND** the shortening stops at 16%

### Requirement: Constellations 1, 2 and 4 change the Fanfare and her energy

Furina's first, second and fourth constellations SHALL change her Fanfare and her energy as set out in their scenarios.

#### Scenario: The first constellation starts the Fanfare higher

- **GIVEN** Furina is at constellation 1
- **WHEN** the player casts Let the People Rejoice
- **THEN** the Fanfare starts at 150 points
- **AND** its most rises by 100

#### Scenario: The second constellation builds more Fanfare from each change

- **GIVEN** Furina is at constellation 2
- **WHEN** a deployed member's HP changes
- **THEN** each change gives 250% more Fanfare

#### Scenario: The fourth constellation gives energy once every five seconds

- **GIVEN** Furina is at constellation 4
- **WHEN** a Salon member's hit lands or the Singer heals
- **THEN** Furina gains 4 energy
- **AND** a second such event within five seconds gives no energy
