## Purpose

Aino's kit as built, with her three strikes, a provisional charged attack and plunges, Musecatcher's two stages, and Cool Your Jets Ducky's Water Balls with Ascension 4, and what is left waiting on the Moonsign, Lunar and member-hit hooks.

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

### Requirement: Ascension 4 adds half Aino's Elemental Mastery to each Water Ball

At Ascension 4 each Water Ball SHALL add half of Aino's Elemental Mastery to its damage.

#### Scenario: Elemental Mastery raises a Water Ball's damage

- **GIVEN** Aino is at Ascension 4 with Elemental Mastery
- **WHEN** a Water Ball strikes
- **THEN** its damage includes half of her Elemental Mastery
