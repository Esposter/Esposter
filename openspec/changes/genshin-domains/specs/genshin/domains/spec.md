## ADDED Requirements

### Requirement: An unlocked domain entrance is a jump target

An unlocked domain entrance SHALL be listed as a jump target on the map, the minimap and the jump list.

#### Scenario: An unlocked entrance joins the jumps

- **GIVEN** the player has unlocked a domain entrance
- **WHEN** the player opens the map
- **THEN** the entrance is listed as a jump target

#### Scenario: A locked entrance is not a jump target

- **GIVEN** the player has not unlocked a domain entrance
- **WHEN** the player opens the map
- **THEN** the entrance is not listed as a jump target

### Requirement: The domain screen opens only the levels the player may enter

The domain screen SHALL list each level with its recommended level and enemies' level, and entering a level SHALL be refused unless the player's Adventure Rank has opened it and the domain is open today.

#### Scenario: A level at or below the player's Adventure Rank is open

- **GIVEN** the player's Adventure Rank has opened a level
- **WHEN** the player chooses that level on the domain screen
- **THEN** the domain is entered at that level

#### Scenario: A level above the player's Adventure Rank is refused

- **GIVEN** the player's Adventure Rank has not opened a level
- **WHEN** the player chooses that level on the domain screen
- **THEN** the entry is refused and the screen stays open

#### Scenario: A domain closed today is refused

- **GIVEN** a Domain of Mastery is not open on today's day of the week
- **WHEN** the player tries to enter it
- **THEN** the entry is refused and the screen stays open

### Requirement: Entering a domain fades into its scene

Entering a domain SHALL fade into the domain's scene with the party set, and leaving it SHALL fade back out to the entrance.

#### Scenario: Entering a domain fades into its scene

- **GIVEN** the party is set for a domain
- **WHEN** the player enters the domain
- **THEN** the screen fades into the domain's scene

#### Scenario: Leaving a domain fades back to its entrance

- **GIVEN** the player is inside a domain
- **WHEN** the player leaves the domain
- **THEN** the screen fades back to the entrance

### Requirement: A domain challenge ends when cleared, timed out or lost

A domain's challenge SHALL run its waves against the domain's time limit, and SHALL end when the domain is cleared, when the time runs out, or when every member of the party is down.

#### Scenario: Clearing a domain raises its Petrified Tree

- **GIVEN** the player is inside a domain
- **WHEN** the player clears its waves within the time limit
- **THEN** a Petrified Tree is raised at the end of the domain

#### Scenario: Running out of time returns the player to the entrance

- **GIVEN** the player is inside a domain
- **WHEN** the time limit runs out before the domain is cleared
- **THEN** the screen fades back to the entrance

#### Scenario: Every member down returns the player to the entrance

- **GIVEN** the player is inside a domain
- **WHEN** every member of the party is down
- **THEN** the screen fades back to the entrance

#### Scenario: A ley line disorder changes the fight

- **GIVEN** a domain runs under a ley line disorder
- **WHEN** the player fights its waves
- **THEN** the fight changes as the disorder's description says

### Requirement: The Petrified Tree is claimed with resin

A cleared domain's Petrified Tree SHALL be claimed with Original Resin, giving its rewards.

#### Scenario: Claiming the tree spends resin and gives its rewards

- **GIVEN** the player has enough Original Resin for the tree
- **WHEN** the player claims the Petrified Tree
- **THEN** the resin is spent and the artifacts or materials, Mora and Adventure EXP are given

#### Scenario: Claiming the tree with too little resin is refused

- **GIVEN** the player has less Original Resin than the tree takes
- **WHEN** the player tries to claim the Petrified Tree
- **THEN** the claim is refused and nothing is given

### Requirement: A one-time domain rewards its first clear only

A one-time domain SHALL give its reward on its first clear only, and SHALL stay open afterwards with nothing more to give.

#### Scenario: A repeat clear of a one-time domain gives nothing

- **GIVEN** the player has cleared a one-time domain before
- **WHEN** the player clears it again
- **THEN** no reward is given and the domain stays open
