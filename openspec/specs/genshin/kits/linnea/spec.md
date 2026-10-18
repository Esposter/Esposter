## Purpose

Linnea's kit as built: her three strikes, charged shot, plunges, Lumi's skill hits, with her burst a healing with no hit and her charged shot's clip and stamina provisional.

## Requirements

### Requirement: Linnea's strikes, charged shot and skill timings

Linnea's three strikes, her charged shot and her skill SHALL land their hits on provisional timings borrowed from a bow user of her role.

#### Scenario: Strike lands on its provisional timing

- **WHEN** the player uses normal attack
- **THEN** each strike lands on its provisional timing on the enemies in reach

### Requirement: Charged shot without a stamina cost

Linnea's charged shot SHALL cost no stamina, provisionally.

#### Scenario: Charged shot needs no stamina

- **GIVEN** Linnea has no stamina
- **WHEN** the player uses the charged shot
- **THEN** the charged shot starts

### Requirement: Skill's four hits

Linnea's skill SHALL deal four hits from its three Lumi labels, and SHALL leave no field.

#### Scenario: Skill deals four hits

- **WHEN** the player uses Linnea's skill
- **THEN** four hits land on the enemies in reach
- **AND** no field is left behind

### Requirement: Burst heals without a hit

Linnea's burst SHALL heal and SHALL deal no hit.

#### Scenario: Burst heals with no damage

- **WHEN** the player casts Linnea's burst
- **THEN** the healing applies
- **AND** no hit lands

### Requirement: Lumi's duration not yet read

Linnea's Lumi duration SHALL NOT take effect, so her skill leaves no timed field.

#### Scenario: No timed field after the skill

- **WHEN** the player uses Linnea's skill
- **THEN** no timed field of Lumi appears afterwards
