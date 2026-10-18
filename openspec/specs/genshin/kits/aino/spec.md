## Purpose

Aino's kit as built, with her three strikes, a provisional charged attack and plunges, Musecatcher's two stages, and Cool Your Jets Ducky's Water Balls with Ascension 1 at Ascendant Gleam and Ascension 4, Constellation 1's Elemental Mastery, Constellation 2's water ball on her teammates' hits, and Constellation 4's skill energy, and what is left waiting on the Moonsign and Lunar hooks.

## Requirements

### Requirement: Aino's strikes deal their hits at their hitmarks as physical damage

Aino's three strikes SHALL deal their hits at the frames of their animations, the first strike at 23 frames, the second at 20 frames and the third at 35 and 43 frames, and her strikes SHALL deal physical damage.

#### Scenario: A strike lands at its hitmark

- **GIVEN** Aino starts a normal attack
- **WHEN** the frame of the strike's hitmark passes
- **THEN** the strike deals its damage at that frame

#### Scenario: The third strike lands two hits

- **GIVEN** Aino performs her third strike
- **WHEN** its animation plays through
- **THEN** it deals its first hit at 35 frames and its second at 43 frames

### Requirement: Aino's charged attack deals its hit at 24 frames of a 55 frame animation

Aino's charged attack SHALL deal its hit at 24 frames of a 55 frame animation and SHALL cost 40 stamina.

#### Scenario: The charged attack costs stamina when performed

- **GIVEN** Aino has at least 40 stamina
- **WHEN** she performs her charged attack
- **THEN** 40 stamina is spent

### Requirement: Aino's plunges land on Bennett's plunge timings

Aino's plunge attacks SHALL land on the timings and poise of Bennett's plunges.

#### Scenario: A plunge lands on Bennett's timing

- **GIVEN** Aino performs a plunge attack
- **WHEN** the plunge reaches its landing
- **THEN** its damage is dealt on the timing Bennett's plunge uses

### Requirement: Musecatcher strikes in two stages

Musecatcher SHALL strike in two stages, the second centred on Aino's body rather than ahead of it, and both stages SHALL deal Hydro damage.

#### Scenario: The second stage strikes around Aino's body

- **GIVEN** Aino uses Musecatcher's second stage
- **WHEN** the stage strikes
- **THEN** it strikes enemies round Aino's body

#### Scenario: Both stages deal Hydro damage

- **GIVEN** Musecatcher strikes an enemy
- **WHEN** its damage is dealt
- **THEN** the damage is Hydro

### Requirement: Cool Your Jets Ducky drops ten Water Balls over its burst

Cool Your Jets Ducky SHALL drop one Water Ball every 90 frames from 123 frames for 14.2 seconds, and each ball SHALL land ten frames after it falls on a random enemy within eleven metres of Aino's body.

#### Scenario: The burst drops balls on a fixed beat

- **GIVEN** Aino casts Cool Your Jets Ducky
- **WHEN** the burst runs
- **THEN** a Water Ball falls every 90 frames from 123 frames

#### Scenario: The burst ends after 14.2 seconds

- **GIVEN** the burst has been running for 14.2 seconds
- **WHEN** the next beat would fall
- **THEN** no further Water Ball falls

#### Scenario: Each ball lands on an enemy in reach

- **GIVEN** a Water Ball falls
- **WHEN** it lands ten frames later
- **THEN** it strikes a random enemy within eleven metres of Aino's body

### Requirement: Ascension 1 at Ascendant Gleam drops the Water Balls faster and wider

At Ascension 1 with the team at Ascendant Gleam, Cool Your Jets Ducky SHALL drop one Water Ball every 0.7 seconds, and each ball SHALL land on a random enemy within ten metres of Aino's body with a landing radius of four metres, so its reach is fourteen metres. The interval and radius SHALL be read as the burst is cast.

#### Scenario: Ascendant Gleam drops the balls every 0.7 seconds

- **GIVEN** Aino is at Ascension 1 and the team is at Ascendant Gleam
- **WHEN** her burst is cast
- **THEN** a Water Ball falls every 0.7 seconds

#### Scenario: Below Ascendant Gleam the balls keep their base beat

- **GIVEN** Aino is at Ascension 1 and the team is short of Ascendant Gleam
- **WHEN** her burst is cast
- **THEN** a Water Ball falls every 90 frames

### Requirement: Ascension 4 adds half Aino's Elemental Mastery to each Water Ball

At Ascension 4 each Water Ball SHALL add half of Aino's Elemental Mastery to its damage.

#### Scenario: Elemental Mastery raises a Water Ball's damage

- **GIVEN** Aino is at Ascension 4 with Elemental Mastery
- **WHEN** a Water Ball strikes
- **THEN** its damage includes half of her Elemental Mastery

### Requirement: Constellation 1 gives Elemental Mastery to Aino and to the member on the field

From Constellation 1, Aino's skill or burst SHALL give her 80 Elemental Mastery for fifteen seconds, and while that runs the member a swap brings on the field SHALL have 80 Elemental Mastery too, for the seconds left of it.

#### Scenario: Aino's skill gives her Elemental Mastery

- **GIVEN** Aino has Constellation 1
- **WHEN** she uses her skill
- **THEN** she has 80 more Elemental Mastery for fifteen seconds

#### Scenario: A member swapped in while the buff runs has it too

- **GIVEN** Aino's Constellation 1 buff is running
- **WHEN** another member comes on the field
- **THEN** that member has 80 more Elemental Mastery for the seconds left, and loses it when it leaves the field

#### Scenario: A member swapped in after the buff runs out has none

- **GIVEN** fifteen seconds have passed since Aino's skill or burst
- **WHEN** another member comes on the field
- **THEN** that member has no Elemental Mastery from it

#### Scenario: Below Constellation 1 no Elemental Mastery is gained

- **GIVEN** Aino has Constellation 0
- **WHEN** she uses her skill
- **THEN** she gains no Elemental Mastery

### Requirement: Constellation 4 gives Aino energy on her skill's hits

From Constellation 4, each of Aino's skill hits that strikes an enemy SHALL give her 10 energy, at most once every ten seconds.

#### Scenario: A skill hit gives energy

- **GIVEN** Aino has Constellation 4
- **WHEN** a skill hit strikes an enemy
- **THEN** she gains 10 energy

#### Scenario: Energy is limited to once every ten seconds

- **GIVEN** a skill hit gave Aino energy less than ten seconds ago
- **WHEN** another skill hit strikes an enemy
- **THEN** she gains no energy

#### Scenario: Below Constellation 4 no energy is gained

- **GIVEN** Aino has Constellation 3
- **WHEN** a skill hit strikes an enemy
- **THEN** she gains no energy

### Requirement: Constellation 2 queues a water ball on her teammates' hits while she is off the field

From Constellation 2, while Aino is off the field and her burst's zone stands, each enemy her active teammate's hit strikes SHALL be struck by a water ball from Aino: AoE Hydro DMG of 25% of her ATK and 100% of her Elemental Mastery, as Elemental Burst DMG, at most once every five seconds.

#### Scenario: an active constellation's switch queues a water ball on an enemy the active member hits while Aino is off the field

- **GIVEN** Aino has Constellation 2 and is off the field, her burst's zone stands
- **WHEN** her active teammate's hit strikes an enemy
- **THEN** a water ball is queued on that enemy

#### Scenario: an inactive constellation changes nothing

- **GIVEN** Aino has Constellation 1 and is off the field, her burst's zone stands
- **WHEN** her active teammate's hit strikes an enemy
- **THEN** no water ball is queued

#### Scenario: the water ball queues nothing while Aino is on the field

- **GIVEN** Aino has Constellation 2 and is on the field
- **WHEN** a hit strikes an enemy
- **THEN** no water ball is queued

#### Scenario: the water ball queues nothing once her burst's zone has run out

- **GIVEN** Aino has Constellation 2 and her burst's zone has run out
- **WHEN** her active teammate's hit strikes an enemy
- **THEN** no water ball is queued

#### Scenario: the water ball fires once every five seconds

- **GIVEN** a water ball was queued less than five seconds ago
- **WHEN** her active teammate's hit strikes an enemy
- **THEN** no water ball is queued, and one is queued once five seconds have passed
