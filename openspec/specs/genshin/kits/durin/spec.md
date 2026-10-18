## Purpose

Durin's kit as built, with his four strikes, charged attack, provisional plunges, Tap E's window, the Confirmation of Purity and Denial of Darkness recasts, and both Dragon bursts, and what is left waiting on the passive and particle hooks.

## Requirements

### Requirement: Basic attacks

Durin's normal attacks SHALL be four strikes, a charged attack, a collision attack and two plunging attacks, and the charged attack SHALL cost 20 stamina.

#### Scenario: Strike chain plays four strikes on their own frames

- **GIVEN** Durin is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes land at 11, 9, 14 and 37 frames into their animations, the last of two hits at 38 frames

#### Scenario: Charged attack hits the circle ahead of him

- **GIVEN** Durin has 20 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack hits a circle of 2.5 metres centred 0.8 metres ahead at 17 frames
- **AND** 20 stamina is spent

### Requirement: Tap E window

Tap E SHALL deal no damage when pressed and SHALL open a six-second window in which Durin's normal attacks become Denial of Darkness, cooling for 12 seconds before it can be pressed again.

#### Scenario: Tap E opens the window

- **GIVEN** Durin is the character on the field
- **WHEN** the player presses Tap E
- **THEN** no damage is dealt
- **AND** a six-second window opens in which his normal attacks become Denial of Darkness

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Tap E was pressed less than 12 seconds ago
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Confirmation of Purity recast

Confirmation of Purity SHALL land a Pyro circle of radius 4.5 metres 35 frames after it is pressed, end the window and the Denial of Darkness status, and give 6 energy at most once every six seconds.

#### Scenario: Confirmation of Purity ends the window

- **GIVEN** the window is open
- **WHEN** the player presses Confirmation of Purity
- **THEN** its Pyro circle lands 35 frames later
- **AND** the window and the Denial of Darkness status end

#### Scenario: Energy is given at most once every six seconds

- **GIVEN** a recast has given energy less than six seconds ago
- **WHEN** another recast lands
- **THEN** no energy is given

### Requirement: Denial of Darkness normal attack

The window's normal attack, Denial of Darkness, SHALL be three Pyro hits that end the window, give the same energy, and start a 30-second Denial of Darkness status.

#### Scenario: The three hits land in order

- **GIVEN** the window is open
- **WHEN** the player attacks
- **THEN** three Pyro hits land at 32, 37 and 42 frames into an animation of 67 frames
- **AND** the window ends and the 30-second Denial of Darkness status starts

### Requirement: Dragon bursts

Durin's burst SHALL be As the Light Shifts, or As the Stars Smolder while the Denial of Darkness status stands, costing 70 energy and cooling for 18 seconds.

#### Scenario: The burst is As the Light Shifts by default

- **GIVEN** Durin has 70 energy and the Denial of Darkness status does not stand
- **WHEN** the player casts the burst
- **THEN** As the Light Shifts plays, with hits at 97, 121 and 154 frames of an animation of 104 frames

#### Scenario: The burst is As the Stars Smolder under the status

- **GIVEN** Durin has 70 energy and the Denial of Darkness status stands
- **WHEN** the player casts the burst
- **THEN** As the Stars Smolder plays with the same hit frames

#### Scenario: The burst is refused without enough energy

- **GIVEN** Durin has less than 70 energy
- **WHEN** the player casts the burst
- **THEN** it does not cast

### Requirement: Dragon ticks

Each burst SHALL leave a Dragon that strikes the primary target in sixteen ticks for As the Light Shifts or twenty for As the Stars Smolder, and a new burst SHALL end the Dragon standing.

#### Scenario: The Dragon strikes its ticks

- **GIVEN** a burst has left its Dragon
- **WHEN** the Dragon's ticks land
- **THEN** each tick strikes the primary target
- **AND** the ticks of the white Dragon land 58.8 frames apart from 155.2 frames, and those of the black Dragon 73.6 frames apart from 175.4 frames

#### Scenario: A new burst ends the Dragon standing

- **GIVEN** a Dragon is standing
- **WHEN** Durin casts another burst
- **THEN** the Dragon standing ends

### Requirement: Provisional plunges

Durin's plunges SHALL land with timings and poise borrowed from another character, provisional until a recording of the game settles them.

#### Scenario: A recording settles the plunges

- **GIVEN** a recording of Durin's plunge exists
- **WHEN** its timing and poise are compared with the kit's
- **THEN** the borrowed values stay provisional until the comparison settles them
