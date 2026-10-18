## Purpose

Chasca's kit as built: her four normal attacks, fully-charged Aimed Shot, collision and low plunge, Spirit Reins' Resonance and Galesplitting, and what is left of her Nightsoul Blessing, its Shadowhunt Shells and the burst's other shells.

## Requirements

### Requirement: Four normal attacks

Chasca's normal attacks SHALL be four attacks, the third of which hits twice and the fourth of which hits once, each in a short box half a metre ahead of her.

#### Scenario: Third normal attack lands two hits

- **GIVEN** Chasca is the character on the field
- **WHEN** the player performs her third normal attack
- **THEN** the attack lands two hits, at 14 and 20 frames

#### Scenario: Fourth normal attack lands one hit

- **GIVEN** Chasca is the character on the field
- **WHEN** the player performs her fourth normal attack
- **THEN** the attack lands one hit at 39 frames

### Requirement: Fully-charged Aimed Shot

Chasca's fully-charged Aimed Shot SHALL land an Anemo hit at 86 frames of its 96-frame animation and SHALL cost no stamina.

#### Scenario: Fully charging the Aimed Shot lands its hit

- **GIVEN** Chasca is the character on the field
- **WHEN** the player fully charges the Aimed Shot and releases it
- **THEN** an Anemo hit lands on the enemies in its box at 86 frames
- **AND** no stamina is spent

### Requirement: Collision and low plunge

Chasca's collision attack and low plunge SHALL land their hits in a circle round her at the frames the kit sets.

#### Scenario: Collision lands in a circle around Chasca

- **GIVEN** Chasca collides with an enemy
- **WHEN** the collision hit lands at 44 frames
- **THEN** it strikes the enemies inside a circle of radius 1.5 metres round Chasca

#### Scenario: Low plunge lands at 50 frames

- **GIVEN** Chasca performs a low plunge from the air
- **WHEN** the plunge reaches 50 frames of its 80-frame animation
- **THEN** it strikes the enemies inside a circle of radius 3 metres

### Requirement: Spirit Reins' Resonance

Spirit Reins' Resonance SHALL land an Anemo circle of radius 5.5 metres round Chasca at 3 frames, SHALL let her next action start 6 frames after it is pressed, and SHALL go on cooldown for 6.5 seconds.

#### Scenario: Pressing Resonance strikes round Chasca

- **GIVEN** Chasca is the character on the field and Resonance is ready
- **WHEN** the player presses Spirit Reins' Resonance
- **THEN** an Anemo circle of radius 5.5 metres round her lands at 3 frames

#### Scenario: Resonance cannot be pressed during its cooldown

- **GIVEN** Resonance was pressed less than 6.5 seconds ago
- **WHEN** the player presses it again
- **THEN** Resonance does not activate

### Requirement: Spirit Reins' Nightsoul Blessing

Spirit Reins' press SHALL enter the Nightsoul Blessing with 80 points, which drain eight a second, and a sprint in the Blessing SHALL drain 13.3 points. The Blessing SHALL end when its points drain to none.

#### Scenario: The press enters the Blessing with 80 points

- **GIVEN** Chasca is out of the Blessing
- **WHEN** the player presses Spirit Reins' Resonance and two seconds pass
- **THEN** the Blessing holds 64 points

#### Scenario: The Blessing ends when its points drain to none

- **GIVEN** Chasca entered the Blessing 9.5 seconds ago
- **WHEN** another second passes
- **THEN** the Blessing has ended

#### Scenario: A press inside the Blessing leaves it

- **GIVEN** Chasca is in the Blessing
- **WHEN** the player presses Spirit Reins' Resonance
- **THEN** the Blessing ends
- **AND** the press still lands Resonance's strike, which gcsim's exit press does not, until the kit can play a different action on that press

#### Scenario: A sprint in the Blessing drains 13.3 points

- **GIVEN** Chasca is in the Blessing with 72 points
- **WHEN** she sprints
- **THEN** the Blessing holds 58.7 points

#### Scenario: A sprint outside the Blessing drains nothing

- **GIVEN** Chasca is out of the Blessing
- **WHEN** she sprints
- **THEN** no Nightsoul points are drained

### Requirement: Galesplitting's first hit

Galesplitting Soulseeker Shell SHALL land its first Anemo hit on the primary target in a circle of radius 6 metres at 96 frames, cost 60 energy, and go on cooldown for 15 seconds.

#### Scenario: Casting Galesplitting lands its first hit

- **GIVEN** Chasca has 60 energy and Galesplitting is ready
- **WHEN** the player casts Galesplitting Soulseeker Shell
- **THEN** an Anemo circle of radius 6 metres lands on the primary target at 96 frames

#### Scenario: Galesplitting is refused without enough energy

- **GIVEN** Chasca has less than 60 energy
- **WHEN** the player tries to cast Galesplitting Soulseeker Shell
- **THEN** the burst does not activate

#### Scenario: The burst's later shells do not land yet

- **GIVEN** Galesplitting's first hit has landed
- **WHEN** the burst's remaining shell hits would fall
- **THEN** none of them land

### Requirement: High plunge landing is provisional

Chasca's high plunge SHALL land with the low plunge's timing in a circle of radius 5 metres, with that timing provisional until a recording settles it.

#### Scenario: High plunge uses the provisional landing

- **GIVEN** Chasca performs a high plunge from the air
- **WHEN** the plunge lands at the low plunge's 50 frames
- **THEN** it strikes the enemies inside a circle of radius 5 metres
- **AND** the landing stays provisional until a recording settles it
