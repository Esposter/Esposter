## Purpose

Aloy's kit as built: her strikes, fully charged shot and plunges, with Freeze Bomb, its Chillwater Bomblets and their coil stacks giving Rushing Ice, and her passives, constellations and normal attack bonuses left unbuilt.

## Requirements

### Requirement: Aloy's strikes, fully charged shot and plunges deal physical damage

Aloy's strikes, fully charged shot and plunges SHALL deal their hits on the timings of their animations, and her attacks SHALL deal no poise.

#### Scenario: A fully charged shot deals its hit

- **GIVEN** Aloy fully charges her shot
- **WHEN** the shot is released
- **THEN** it deals its hit on its animation's timing

### Requirement: Freeze Bomb throws a bomb and two bomblets

Freeze Bomb SHALL deal three hits, the bomb and its two Chillwater Bomblets, and each hit SHALL give one unit of Cryo.

#### Scenario: Each bomblet strikes once

- **GIVEN** Aloy throws Freeze Bomb
- **WHEN** the bomb and its bomblets land
- **THEN** each of the three hits strikes its target

#### Scenario: A bomblet adds a coil stack for each enemy it strikes

- **GIVEN** a Chillwater Bomblet strikes an enemy
- **WHEN** the hit lands
- **THEN** one coil stack is added for that enemy

### Requirement: Four coil stacks give Aloy's attacks Cryo infusion for ten seconds

When Aloy holds four coil stacks her attacks SHALL be infused with Cryo for ten seconds, as Rushing Ice.

#### Scenario: Four coil stacks infuse her attacks with Cryo

- **GIVEN** Aloy holds four coil stacks
- **WHEN** she performs an attack
- **THEN** the attack deals Cryo damage
- **AND** the infusion lasts ten seconds

#### Scenario: Fewer than four coil stacks give no infusion

- **GIVEN** Aloy holds fewer than four coil stacks
- **WHEN** she performs an attack
- **THEN** the attack deals no Cryo infusion

### Requirement: Prophecies of Dawn strikes the circle round its offset point

Prophecies of Dawn SHALL strike the enemies inside its circle, which sits at its offset from Aloy and has its radius.

#### Scenario: Prophecies of Dawn strikes enemies in its circle

- **GIVEN** Aloy casts Prophecies of Dawn
- **WHEN** the burst strikes
- **THEN** it strikes the enemies inside its circle
