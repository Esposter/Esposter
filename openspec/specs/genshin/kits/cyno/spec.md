## Purpose

Cyno's kit as built, with the Invoker's Spear, Secret Rite: Chasmic Soulfarer, Sacred Rite: Wolf's Swiftness as Pactsworn Pathclearer with Mortuary Rite, Judication, Ascension 1 and 4, and Constellations 2, 4 and 6, and what is left of Constellation 1 and the stance's plunges.

## Requirements

### Requirement: Invoker's Spear attacks

Cyno's Invoker's Spear SHALL be four strikes, a charged attack costing 25 stamina, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Cyno is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

#### Scenario: Charged attack costs 25 stamina

- **GIVEN** Cyno has 25 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack spends 25 stamina

### Requirement: Secret Rite

Secret Rite: Chasmic Soulfarer SHALL cast when pressed and SHALL cool for seven and a half seconds before it can be pressed again.

#### Scenario: Pressing Secret Rite casts it

- **GIVEN** Cyno is the character on the field
- **WHEN** the player presses Secret Rite
- **THEN** Chasmic Soulfarer casts and its cooldown starts

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Secret Rite was pressed less than seven and a half seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Sacred Rite stance

Sacred Rite: Wolf's Swiftness SHALL set Pactsworn Pathclearer on the team for 712 frames, cost 80 energy and cool for 20 seconds.

#### Scenario: Casting Sacred Rite sets the stance

- **GIVEN** Cyno has 80 energy
- **WHEN** the player casts Sacred Rite: Wolf's Swiftness
- **THEN** Pactsworn Pathclearer stands for 712 frames
- **AND** Cyno gains 100 Elemental Mastery for the stance's duration

#### Scenario: Leaving the field ends the stance

- **GIVEN** Pactsworn Pathclearer stands
- **WHEN** Cyno leaves the field
- **THEN** the stance ends and its Elemental Mastery is removed

#### Scenario: Sacred Rite is refused during its cooldown

- **GIVEN** Sacred Rite was cast less than 20 seconds ago
- **WHEN** the player casts it again
- **THEN** it does not cast

### Requirement: Pactsworn normal attacks

While Pactsworn Pathclearer stands, Cyno's normal attacks and charged attack SHALL be Pactsworn's own five strikes and charged attack in place of the Invoker's Spear.

#### Scenario: The stance changes the strike chain

- **GIVEN** Pactsworn Pathclearer stands
- **WHEN** the player presses the attack button repeatedly
- **THEN** Pactsworn's five strikes play in their place

#### Scenario: The stance's charged attack replaces the spear's

- **GIVEN** Pactsworn Pathclearer stands
- **WHEN** the player holds the attack button to charge
- **THEN** Pactsworn's charged attack plays in place of the spear's

### Requirement: Mortuary Rite

Mortuary Rite SHALL be the stance's skill, costing three seconds of cooldown instead of seven and a half, and extending the stance by four seconds at most two times per burst.

#### Scenario: Mortuary Rite cools for three seconds

- **GIVEN** Pactsworn Pathclearer stands
- **WHEN** the player presses Mortuary Rite
- **THEN** its cooldown is three seconds

#### Scenario: Mortuary Rite extends the stance

- **GIVEN** Pactsworn Pathclearer stands with its time running
- **WHEN** the player presses Mortuary Rite
- **THEN** the stance is extended by four seconds

#### Scenario: A third Mortuary Rite does not extend the stance

- **GIVEN** Mortuary Rite has extended the stance twice in this burst
- **WHEN** the player presses Mortuary Rite again
- **THEN** the stance is not extended

### Requirement: Judication and Endseer

From Ascension 1, the burst SHALL add a Judication field that gives Endseer while the stance holds, and a Mortuary Rite cast under Endseer SHALL fire three Duststalker Bolts.

#### Scenario: Judication gives Endseer

- **GIVEN** Cyno is at Ascension 1 and the stance holds
- **WHEN** the Judication field ticks
- **THEN** Cyno has Endseer

#### Scenario: Mortuary Rite under Endseer fires three bolts

- **GIVEN** Cyno has Endseer
- **WHEN** the player presses Mortuary Rite
- **THEN** three Duststalker Bolts fire at its hit point

#### Scenario: Each bolt deals the talent multiplier, provisionally

- **GIVEN** a Duststalker Bolt is fired
- **WHEN** the bolt hits an enemy
- **THEN** it deals the talent multiplier once, a provisional value until the game's ratio is confirmed

### Requirement: Ascension 4 flat damage from Elemental Mastery

From Ascension 4, Pactsworn's normal attacks SHALL gain flat damage from Elemental Mastery, and each Duststalker Bolt SHALL gain more of it.

#### Scenario: A normal attack gains flat damage from Elemental Mastery

- **GIVEN** Cyno is at Ascension 4 and Pactsworn Pathclearer stands
- **WHEN** a normal attack hits an enemy
- **THEN** the hit gains flat damage from Elemental Mastery at 150 percent

#### Scenario: A bolt gains more flat damage from Elemental Mastery

- **GIVEN** Cyno is at Ascension 4 and a Duststalker Bolt is fired
- **WHEN** the bolt hits an enemy
- **THEN** the bolt gains flat damage from Elemental Mastery at 250 percent

### Requirement: Constellation 2 Electro stacks

From constellation 2, each normal attack that strikes an enemy SHALL add a stack of Electro DMG Bonus, up to five stacks, each stack giving 10 percent for four seconds.

#### Scenario: A normal attack adds a stack

- **GIVEN** Cyno is at constellation 2
- **WHEN** a normal attack strikes an enemy
- **THEN** one stack is added and gives 10 percent Electro DMG Bonus for four seconds

#### Scenario: A sixth stack is not added

- **GIVEN** Cyno is at constellation 2 and five stacks stand
- **WHEN** another normal attack strikes an enemy
- **THEN** no further stack is added

### Requirement: Constellation 4 energy from reactions

From constellation 4, each reaction that Cyno's own strikes trigger while the stance holds SHALL give every other team member 3 energy, at most five times per burst.

#### Scenario: A reaction gives energy to the team

- **GIVEN** Cyno is at constellation 4 and the stance holds
- **WHEN** one of his strikes triggers a reaction
- **THEN** every other member of the deployed team gains 3 energy

#### Scenario: The energy is limited to five times per burst

- **GIVEN** five reactions have already given energy in this burst
- **WHEN** another reaction is triggered by Cyno's strikes
- **THEN** no further energy is given

### Requirement: Constellation 6 Day of the Jackal

From constellation 6, the burst and each Judication field SHALL give Day of the Jackal stacks up to eight, lasting eight seconds, and while the stance holds each normal attack that strikes an enemy SHALL spend a stack to fire a Duststalker Bolt, at most once every 0.4 seconds.

#### Scenario: Day of the Jackal stacks are capped at eight

- **GIVEN** Cyno is at constellation 6 and eight stacks stand
- **WHEN** the burst casts again
- **THEN** the stacks stay at eight

#### Scenario: A normal attack fires a bolt within the interval

- **GIVEN** Cyno is at constellation 6, the stance holds and a bolt fired less than 0.4 seconds ago
- **WHEN** a normal attack strikes an enemy
- **THEN** no bolt is fired

### Requirement: Constellation 1 raises normal attack speed after Wolf's Swiftness

From constellation 1, Sacred Rite: Wolf's Swiftness SHALL raise Cyno's normal attack speed by 20% for 10 seconds.

#### Scenario: Wolf's Swiftness raises his normal attack speed from the first constellation

- **GIVEN** Cyno is at constellation 1
- **WHEN** the player uses Sacred Rite: Wolf's Swiftness
- **THEN** his normal attack speed is raised by 20% for 10 seconds

#### Scenario: Below the first constellation Wolf's Swiftness raises no attack speed

- **GIVEN** Cyno is at constellation 0
- **WHEN** the player uses Sacred Rite: Wolf's Swiftness
- **THEN** his normal attack speed is unchanged
