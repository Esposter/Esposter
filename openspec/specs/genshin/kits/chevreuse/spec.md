## Purpose

Chevreuse's kit as built, with Short-Range Rapid Interdiction Fire's press and hold, the Overcharged Ball an Overloaded reaction sets going, and Ring of Bursting Grenades with Constellation 4's hold waiver, and what is left of her passives, her skill's heal and her other constellations. The sources of its numbers are cited inline on the [design page](design.md), which also lists what is open.

## Requirements

### Requirement: Basic attacks

Chevreuse's normal attacks SHALL be four normal attacks, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Normal attack chain plays four attacks in order

- **GIVEN** Chevreuse is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her four normal attacks play in order and each deals its own hit

#### Scenario: Plunge hits the area around its landing point

- **WHEN** the player plunges from the air
- **THEN** the plunge hits the enemies inside its area around her landing point

### Requirement: Short-Range Rapid Interdiction Fire press and hold

Short-Range Rapid Interdiction Fire SHALL strike a Pyro box 2 metres wide and 6 metres long when pressed, and a Pyro box 3 metres wide and 7 metres long when held.

#### Scenario: Pressing the skill strikes the press box

- **GIVEN** Chevreuse is the character on the field and the skill is ready
- **WHEN** the player presses Short-Range Rapid Interdiction Fire
- **THEN** a Pyro box 2 metres wide and 6 metres long strikes the enemies in its box at 25 frames

#### Scenario: Holding the skill strikes the hold box

- **GIVEN** Chevreuse is the character on the field and the skill is ready
- **WHEN** the player holds Short-Range Rapid Interdiction Fire until its hold threshold
- **THEN** a Pyro box 3 metres wide and 7 metres long strikes the enemies in its box at 19 frames of the hold's release

### Requirement: Overcharged Ball after an Overloaded reaction

After any Overloaded reaction happens on an enemy, the next hold of Short-Range Rapid Interdiction Fire SHALL cast the Overcharged Ball instead, a Pyro circle of radius 5 metres on the primary target with 125 poise, and the ball SHALL be spent as the hold starts.

#### Scenario: An Overloaded reaction by any member arms the ball

- **GIVEN** Chevreuse is in the party
- **WHEN** any party member causes an Overloaded reaction on an enemy
- **THEN** Chevreuse's next hold casts the Overcharged Ball

#### Scenario: The ball is spent by the hold that casts it

- **GIVEN** the Overcharged Ball is armed
- **WHEN** the player holds Short-Range Rapid Interdiction Fire
- **THEN** a Pyro circle of radius 5 metres on the primary target strikes with 125 poise
- **AND** the next hold is a plain hold

#### Scenario: A hold with no ball armed is a plain hold

- **GIVEN** no Overloaded reaction has happened since the last ball was spent
- **WHEN** the player holds Short-Range Rapid Interdiction Fire
- **THEN** the plain hold box strikes instead of the Overcharged Ball

### Requirement: Ring of Bursting Grenades

Ring of Bursting Grenades SHALL land an Explosive Grenade circle of radius 6 metres at 59 frames, and its eight shells SHALL explode between 83 and 119 frames after the cast, round the primary target.

#### Scenario: The burst's grenade lands at 59 frames

- **GIVEN** Chevreuse has the energy to cast Ring of Bursting Grenades
- **WHEN** the player casts the burst
- **THEN** an Explosive Grenade circle of radius 6 metres lands at 59 frames

#### Scenario: The eight shells explode after the animation ends

- **GIVEN** Ring of Bursting Grenades has been cast
- **WHEN** the shells explode between 83 and 119 frames after the cast
- **THEN** each shell lands in the area round the primary target
- **AND** the shells land even though they explode after the burst's animation ends

### Requirement: Constellation 4 waives the hold's cooldown after the Ring

At constellation 4, Ring of Bursting Grenades SHALL let the next two holds of Short-Range Rapid Interdiction Fire start with no cooldown, for six seconds from the cast, and a Ring cast again restarts the two holds.

#### Scenario: A hold after the Ring starts with no cooldown

- **GIVEN** Chevreuse is at constellation 4 and has cast Ring of Bursting Grenades less than six seconds ago
- **WHEN** the player holds Short-Range Rapid Interdiction Fire
- **THEN** the hold starts and her skill's cooldown is not started by it

#### Scenario: The third hold after the Ring starts a cooldown

- **GIVEN** Chevreuse is at constellation 4 and two holds have started since the last Ring cast
- **WHEN** the player holds Short-Range Rapid Interdiction Fire again
- **THEN** the hold starts its ordinary cooldown

#### Scenario: The waiver ends after six seconds

- **GIVEN** Chevreuse is at constellation 4 and six seconds have passed since the Ring cast
- **WHEN** the player holds Short-Range Rapid Interdiction Fire
- **THEN** the hold starts its ordinary cooldown

#### Scenario: Below constellation 4 the Ring waives nothing

- **GIVEN** Chevreuse is at constellation 3
- **WHEN** the player casts Ring of Bursting Grenades and then holds Short-Range Rapid Interdiction Fire
- **THEN** the hold starts its ordinary cooldown

## Open

- [ ] **The plunge's area round her landing point** — no source yet: no source on disk gives its area. gcsim's template returns not implemented for her plunges (`~/Esposter/cache/gcsim-v2.47.2/internal/template/character/character.go:157`), and the wiki's Chevreuse character page, which names the plunge's damage and collision, is not cached.
