## Purpose

Lyney's kit as built, with his four strikes, Prop Arrow with its Grin-Malkin Hat, collision and two plunges, Bewildering Lights' press, and Wondrous Trick: Miracle Parade's Explosive Firework with its hat, and what is left of his tap-released and partial-hold shots, his Prop Surplus, his hat's explosions and his passives.

## Requirements

### Requirement: Lyney's four strikes

Lyney's four strikes SHALL land in order, hitting the enemies within reach.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

### Requirement: Prop Arrow and its Grin-Malkin Hat

Lyney's Prop Arrow SHALL set a Grin-Malkin Hat, whose Pyrotechnic Strike lands 36 frames after the hat expires, 387 frames after the cast.

#### Scenario: Hat's strike lands after it expires

- **WHEN** the player fires Prop Arrow and the hat expires
- **THEN** the Pyrotechnic Strike lands 36 frames later on the primary target

### Requirement: Lyney's plunge attacks

Lyney's plunge attacks SHALL land a collision and two plunges at provisional timings, on the enemies within reach.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: Bewildering Lights' press

Bewildering Lights' press SHALL strike the enemies within its reach.

#### Scenario: Press strikes the enemies in reach

- **WHEN** the player presses Bewildering Lights
- **THEN** the press strikes the enemies within its reach

### Requirement: Wondrous Trick: Miracle Parade

Wondrous Trick: Miracle Parade's Explosive Firework SHALL set a Grin-Malkin Hat, whose Pyrotechnic Strike lands 36 frames after the hat expires, 563 frames after the cast.

#### Scenario: Burst's hat strike lands after it expires

- **WHEN** the player casts Wondrous Trick: Miracle Parade and the hat expires
- **THEN** the Pyrotechnic Strike lands 36 frames later on the primary target

### Requirement: Constellation 4 Pyro RES

From Constellation 4, the Prop Arrow's Pyrotechnic Strike SHALL cut the Pyro RES of the enemy it hits by 20% for 6 seconds.

#### Scenario: Constellation 4 cuts the enemy's Pyro RES

- **GIVEN** Lyney has Constellation 4
- **WHEN** his Prop Arrow's Pyrotechnic Strike hits an opponent
- **THEN** that opponent's Pyro RES is reduced by 20% for 6 seconds

#### Scenario: Constellation 3 changes nothing

- **GIVEN** Lyney has Constellation 3
- **WHEN** his Prop Arrow's Pyrotechnic Strike hits an opponent
- **THEN** the opponent's Pyro RES is not reduced

### Requirement: Unbuilt Lyney effects

Lyney's tap-released and partial-hold shots, his Prop Surplus, his hat's explosions, his hat limit, his burst ticks, his Spiritbreath Thorn, his Ascension passives and Constellations 1 and 6 SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Lyney has a hold shot, Prop Surplus, a hat explosion or a passive unlocked
- **WHEN** the player fights with Lyney
- **THEN** those effects have no effect
