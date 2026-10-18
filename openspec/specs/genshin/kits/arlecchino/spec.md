## Purpose

Arlecchino's kit as built: her six strikes, charged attack, collision and two plunges, All Is Ash's Spike and Cleave and Balemoon Rising, with Bond of Life, the Blood-Debt Directive, her HP-debt heal and her constellations not built.

## Requirements

### Requirement: Arlecchino's six strikes deal physical damage at their hitmarks

Arlecchino's six strikes SHALL deal physical damage, each strike's reach SHALL be its offset from her body plus its radius, and her fourth strike SHALL deal two hits at 24 and 35 frames.

#### Scenario: The fourth strike lands two hits

- **GIVEN** Arlecchino performs her fourth strike
- **WHEN** its animation plays through
- **THEN** it deals its first hit at 24 frames and its second at 35 frames

#### Scenario: A strike reaches its offset and radius

- **GIVEN** Arlecchino performs a strike with an offset hitbox
- **WHEN** the strike is checked for enemies in reach
- **THEN** enemies within the offset plus the radius are struck

### Requirement: Arlecchino's charged attack costs 25 stamina and strikes at 37 frames

Arlecchino's charged attack SHALL strike at 37 frames of its 60 frame animation and SHALL cost 25 stamina.

#### Scenario: The charged attack costs stamina when performed

- **GIVEN** Arlecchino has at least 25 stamina
- **WHEN** she performs her charged attack
- **THEN** 25 stamina is spent

### Requirement: Arlecchino's plunges land at 47 and 48 frames with their poise

Arlecchino's low and high plunges SHALL land at 47 and 48 frames with poise of 100 and 150, and her collision SHALL be queued 41 frames into a plunge.

#### Scenario: The high plunge carries more poise than the low plunge

- **GIVEN** Arlecchino performs a low plunge and then a high plunge
- **WHEN** each plunge lands
- **THEN** the high plunge carries the greater poise

### Requirement: Balemoon Rising strikes once at 110 frames and costs 60 energy

Balemoon Rising SHALL strike once at 110 frames of its 146 frame animation, SHALL cost 60 energy and SHALL have a cooldown of 15 seconds.

#### Scenario: Balemoon Rising is refused without enough energy

- **GIVEN** Arlecchino has less than 60 energy
- **WHEN** she tries to use Balemoon Rising
- **THEN** the burst is not used

#### Scenario: Balemoon Rising strikes at 110 frames

- **GIVEN** Arlecchino uses Balemoon Rising
- **WHEN** the animation reaches 110 frames
- **THEN** it strikes once

#### Scenario: Balemoon Rising goes on cooldown

- **GIVEN** Arlecchino has just used Balemoon Rising
- **WHEN** the burst is checked again within 15 seconds
- **THEN** it is not available

### Requirement: Balemoon Rising resets her skill's cooldown

Balemoon Rising SHALL reset Arlecchino's skill cooldown 107 frames after it starts, so the skill is ready again at that point.

#### Scenario: her burst resets her skill's cooldown 107 frames after it starts

- **GIVEN** Arlecchino's skill is on cooldown
- **WHEN** Balemoon Rising's animation reaches 107 frames
- **THEN** her skill's cooldown is zero

### Requirement: Arlecchino's skill has a cooldown of 30 seconds

Arlecchino's elemental skill SHALL have a cooldown of 30 seconds.

#### Scenario: The skill cannot be used again within its cooldown

- **GIVEN** Arlecchino has just used her skill
- **WHEN** she tries to use it again within 30 seconds
- **THEN** the skill is not available
