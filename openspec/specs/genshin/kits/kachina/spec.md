## Purpose

Kachina's kit as built: her four strikes, charged attack, plunges and burst's Geo hit, with her skill's Turbo Twirly left unbuilt and most timings provisional.

## Requirements

### Requirement: Four normal attacks with provisional timings

Kachina's four normal attacks SHALL play in order from the attack button, with one, two, one and one hits, on hit frames and areas borrowed from another character until a recording settles them.

#### Scenario: Normal attack chain plays four attacks in order

- **GIVEN** Kachina is the character on the field
- **WHEN** the player presses the attack button through the four normal attacks
- **THEN** the attacks play in order, dealing one, two, one and one hits
- **AND** they run 160, 186, 198 and 206 frames
- **AND** their hit frames and areas stay provisional until a recording settles them

### Requirement: Charged attack and plunges with provisional timings

Kachina's charged attack and plunges SHALL stay provisionally timed until a recording of her attacks settles them.

#### Scenario: Charged attack costs stamina as it plays

- **GIVEN** Kachina has at least 25 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack plays for 102 frames and hits 24 frames in
- **AND** 25 stamina is spent

#### Scenario: Plunges hit at 45 and 46 frames

- **GIVEN** Kachina is in the air
- **WHEN** the player plunges
- **THEN** the plunge hits 45 or 46 frames into its animation
- **AND** the timing stays provisional until a recording settles it

### Requirement: Burst's Geo hit scales with DEF

Kachina's burst SHALL deal one Geo hit whose damage is a share of her DEF, and SHALL cost 70 energy.

#### Scenario: Casting the burst lands its Geo hit

- **GIVEN** Kachina has 70 energy
- **WHEN** the player casts the burst
- **THEN** its Geo hit lands 18 frames into its 50-frame animation
- **AND** its damage is 380.57% of her DEF at talent level 1
- **AND** 70 energy is spent

#### Scenario: The burst cannot be cast during its cooldown

- **GIVEN** the burst is cooling down
- **WHEN** the player casts the burst again
- **THEN** nothing happens

### Requirement: Skill plays its animation without a hit yet

Kachina's skill SHALL play its 48-frame animation and SHALL deal no hit yet.

#### Scenario: Pressing the skill plays its animation

- **GIVEN** Kachina is the character on the field
- **WHEN** the player presses the skill
- **THEN** its 48-frame animation plays
- **AND** no hit lands
