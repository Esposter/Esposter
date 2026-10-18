## ADDED Requirements

### Requirement: Normal Boss Trounce Blossom Claim

A normal boss's defeat SHALL leave a Trounce Blossom at its place, which the player claims for 40 Original Resin.

#### Scenario: a defeated normal boss leaves a Trounce Blossom at its place

- **GIVEN** a normal boss in its arena
- **WHEN** the player defeats that boss
- **THEN** a Trounce Blossom appears at the boss's place

#### Scenario: a normal boss's claim pays Mora and its own drop for the World Level

- **GIVEN** a player at a World Level holding 40 Original Resin
- **WHEN** the player claims a normal boss's Trounce Blossom
- **THEN** the player receives the Mora and the boss's own drop for that World Level

#### Scenario: a claim with less than 40 Original Resin is refused

- **GIVEN** a player holding fewer than 40 Original Resin
- **WHEN** the player tries to claim a normal boss's Trounce Blossom
- **THEN** the claim is refused and the blossom stays unclaimed

### Requirement: Normal Boss Return After Claim

A normal boss SHALL return to its arena five seconds after its Trounce Blossom is claimed.

#### Scenario: a normal boss returns five seconds after its blossom is claimed

- **GIVEN** a defeated normal boss whose Trounce Blossom is claimed
- **WHEN** five seconds pass after the claim
- **THEN** the boss is back in its arena and idle

#### Scenario: an unclaimed blossom keeps the boss defeated until the player teleports away

- **GIVEN** a defeated normal boss whose Trounce Blossom is unclaimed
- **WHEN** the player teleports away
- **THEN** the boss is back in its arena and idle

### Requirement: Boss Immunities

A boss SHALL resist displacement and SHALL NOT be frozen by Frozen.

#### Scenario: a boss is not displaced by a strike that would push it

- **GIVEN** a boss in its arena
- **WHEN** a strike that would displace an ordinary enemy lands on the boss
- **THEN** the boss stays in its place

#### Scenario: Frozen does not freeze a boss

- **GIVEN** a boss in its arena
- **WHEN** an attack applying Frozen hits the boss
- **THEN** the boss is not frozen

### Requirement: Weekly Boss Trounce Domain Entry

A weekly boss SHALL be fought in its trounce domain once the quest that introduces it is done.

#### Scenario: a weekly boss's domain opens once its introducing quest is done

- **GIVEN** a weekly boss whose introducing quest is done
- **WHEN** the player enters its trounce domain on any day of the week
- **THEN** the domain opens and the boss can be fought

#### Scenario: a weekly boss's domain is locked before its introducing quest

- **GIVEN** a weekly boss whose introducing quest is not done
- **WHEN** the player looks for its trounce domain
- **THEN** the domain cannot be entered

### Requirement: Weekly Boss Quick Challenge

The handbook SHALL let the player challenge a locked weekly boss from Adventure Rank 40.

#### Scenario: a locked weekly boss is challenged from the handbook at Adventure Rank 40

- **GIVEN** a player at Adventure Rank 40 and a weekly boss whose domain is locked
- **WHEN** the player challenges that boss from the handbook
- **THEN** the fight with that boss starts

#### Scenario: a locked weekly boss cannot be challenged below Adventure Rank 40

- **GIVEN** a player below Adventure Rank 40 and a weekly boss whose domain is locked
- **WHEN** the player looks for that boss in the handbook
- **THEN** the boss cannot be challenged

### Requirement: Weekly Boss Claim Once A Week

A weekly boss's Trounce Blossom SHALL be claimed once per week.

#### Scenario: a second claim of a weekly boss in the same week is refused

- **GIVEN** a weekly boss whose blossom was claimed this week
- **WHEN** the player tries to claim that boss's blossom again this week
- **THEN** the claim is refused

#### Scenario: a weekly boss's claim is available again after the weekly reset

- **GIVEN** a weekly boss whose blossom was claimed in a previous week
- **WHEN** the weekly reset has passed
- **THEN** the boss's blossom can be claimed again

### Requirement: Weekly Boss Rewards

A weekly boss's claim SHALL pay its talent materials, Mora and experience for the World Level, and its highest difficulty's first clear SHALL give one of each of its materials.

#### Scenario: a weekly boss's claim pays its talent materials and Mora

- **GIVEN** a player at a World Level who can claim a weekly boss
- **WHEN** the player claims that boss's blossom
- **THEN** the player receives the boss's talent materials and Mora for that World Level

#### Scenario: the first clear of the highest difficulty pays one of each material

- **GIVEN** a weekly boss whose highest difficulty has not been cleared before
- **WHEN** the player claims the first-clear reward in the handbook
- **THEN** the player receives one of each of that boss's materials
