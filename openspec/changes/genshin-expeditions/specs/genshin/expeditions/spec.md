## ADDED Requirements

### Requirement: Katheryne's talk opens the expedition screen

Talking to Katheryne SHALL open the expedition screen, and a send SHALL be refused when the expedition rules refuse it.

#### Scenario: Talking to Katheryne opens the expedition screen

- **GIVEN** the player is at a branch of the Adventurers' Guild
- **WHEN** the player talks with Katheryne
- **THEN** the expedition screen opens with its places and the characters free to go

#### Scenario: A send the rules refuse is refused

- **GIVEN** the expedition screen is open
- **WHEN** the player sends a character the rules refuse
- **THEN** the send is refused and the character stays at home

### Requirement: A character on expedition stays usable in the party

Every character except the Traveler SHALL stay usable in the party while on expedition.

#### Scenario: A character on expedition stays in the party

- **GIVEN** a character is away on an expedition
- **WHEN** the player sets the party
- **THEN** the character can be chosen for the party

### Requirement: A place opens once its statue is resonated

An expedition place SHALL be open only once its named statue has been resonated.

#### Scenario: A place opens when its statue is resonated

- **GIVEN** a place's named statue has not been resonated
- **WHEN** the player resonates that statue
- **THEN** the place is open for expeditions

#### Scenario: A place whose statue is not resonated stays closed

- **GIVEN** a place's named statue has not been resonated
- **WHEN** the player looks at the expedition screen
- **THEN** the place is not open for expeditions

### Requirement: The expedition bonus chance follows the sent character's level

The chance of an expedition bonus SHALL rise with the level of the character sent, as the game's bonus table gives it.

#### Scenario: A level 1 character has a 20 percent bonus chance

- **GIVEN** a character at level 1 is sent on an expedition
- **WHEN** the expedition is set
- **THEN** its bonus chance is 20 percent

#### Scenario: A level 21 character has a 40 percent bonus chance

- **GIVEN** a character at level 21 is sent on an expedition
- **WHEN** the expedition is set
- **THEN** its bonus chance is 40 percent

#### Scenario: A level 81 character has a 90 percent bonus chance

- **GIVEN** a character at level 81 is sent on an expedition
- **WHEN** the expedition is set
- **THEN** its bonus chance is 90 percent

### Requirement: An expedition talent applies to the expedition its character is sent on

A character's expedition talent SHALL apply to the expedition on which that character is sent.

#### Scenario: A talent that shortens expeditions shortens the one it is sent on

- **GIVEN** a character with a talent that shortens expeditions is sent out
- **WHEN** the expedition is set
- **THEN** its duration is shorter than the place's usual duration

#### Scenario: A talent that adds to a reward adds to the one it is sent on

- **GIVEN** a character with a talent that adds to expedition rewards is sent out
- **WHEN** the expedition is claimed
- **THEN** its reward is larger than the place's usual reward
