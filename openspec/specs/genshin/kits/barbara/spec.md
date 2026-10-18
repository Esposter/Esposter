## Purpose

Barbara's kit as built: her strikes, charged attack and plunges, Let the Show Begin's droplets, the Melody Loop and Shining Miracle's heal, with the burst's heal on off-field members, the loop's Wet and her passives and other constellations left unbuilt.

## Requirements

### Requirement: Barbara's strikes count under the normal attack cooldown

Barbara's strikes SHALL count under the normal attack internal cooldown, and her charged attack and plunges SHALL count under none.

#### Scenario: Strikes share the normal attack cooldown

- **GIVEN** Barbara's strikes hit enemies
- **WHEN** the cooldown is checked
- **THEN** the strikes count under the normal attack cooldown

#### Scenario: The charged attack counts under no cooldown

- **GIVEN** Barbara performs her charged attack
- **WHEN** it hits an enemy
- **THEN** the hit counts under no internal cooldown

### Requirement: Let the Show Begin summons two droplets

Let the Show Begin SHALL summon two droplets that strike enemies.

#### Scenario: The burst summons two droplets

- **GIVEN** Barbara casts Let the Show Begin
- **WHEN** the burst is cast
- **THEN** two droplets are summoned

### Requirement: The Melody Loop heals the active character every five seconds for fifteen seconds

The Melody Loop SHALL ring the active character wherever it moves, healing it at the start and every five seconds after for the loop's fifteen seconds.

#### Scenario: The loop heals on its beat

- **GIVEN** Barbara's Melody Loop is standing
- **WHEN** five seconds pass since the last heal
- **THEN** the active character is healed

#### Scenario: The loop ends after fifteen seconds

- **GIVEN** the Melody Loop has been standing for fifteen seconds
- **WHEN** the loop's time runs out
- **THEN** the loop ends and no further heal occurs

### Requirement: Barbara's strikes heal the party while the Melody Loop stands

While the Melody Loop stands, each of Barbara's strikes SHALL heal every party member once, however many enemies it reaches, and her charged attack SHALL heal four times that amount without a shield.

#### Scenario: A strike heals once whatever the enemy count

- **GIVEN** the Melody Loop stands and a strike reaches several enemies
- **WHEN** the strike lands
- **THEN** each party member is healed once

#### Scenario: The charged attack heals four times as much

- **GIVEN** the Melody Loop stands
- **WHEN** Barbara's charged attack lands
- **THEN** each party member is healed four times the strike's amount

#### Scenario: No party heal occurs without the Melody Loop

- **GIVEN** no Melody Loop stands
- **WHEN** Barbara's strike lands
- **THEN** no party heal occurs

### Requirement: Shining Miracle heals only the active character

Shining Miracle SHALL heal only the active character, once at its first tick, rather than every party member.

#### Scenario: Shining Miracle heals the active character once

- **GIVEN** Barbara casts Shining Miracle
- **WHEN** the first tick occurs
- **THEN** only the active character is healed

### Requirement: Vitality Burst gives the party a Hydro bonus from two constellations

From two constellations, the Melody Loop's first tick SHALL give every other deployed member a Hydro damage bonus for the loop's duration.

#### Scenario: The Hydro bonus reaches the other members

- **GIVEN** Barbara has two constellations
- **WHEN** the Melody Loop's first tick occurs
- **THEN** every other deployed member gains a Hydro damage bonus for the loop's duration

#### Scenario: Barbara herself gets no Hydro bonus

- **GIVEN** Barbara has two constellations
- **WHEN** the Melody Loop's first tick occurs
- **THEN** Barbara gains no Hydro damage bonus from it
