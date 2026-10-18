## Purpose

Genshin's combat rules as built — pure, tested functions in the world package over plain state. An element's attack is left on a target as an aura that decays, a second element triggers the reactions the game tries in its own priority, each consuming its auras by its coefficient, and Electro-Charged, Quicken, Burning and Freeze keep their coexisting auras and ticks. The damage formula, the level multiplier, the internal cooldowns on applying an element and on a reaction's damage, shields and energy follow the community's documented mechanics, each held to a worked example from them. The Traveler's kit prices its hits through them, and an enemy's strike on the party does too.

## Requirements

### Requirement: An element an attack leaves on a target

An element an attack leaves on a target SHALL stay as an aura that decays over time.

#### Scenario: A two unit Pyro tap leaves 1.6 units of Pyro that lasts 12 seconds

- **GIVEN** an untouched target
- **WHEN** a two unit Pyro attack lands on it
- **THEN** 1.6 units of Pyro remain on the target as an aura
- **AND** the aura decays out after 12 seconds

#### Scenario: Anemo and Geo leave no aura

- **GIVEN** an untouched target
- **WHEN** an Anemo or a Geo attack lands on it
- **THEN** no aura remains on the target

### Requirement: An element applied to a target that already holds another element

An element applied to a target that already holds another element SHALL trigger the reactions of the applied element in the game's priority order.

#### Scenario: Two unit Hydro on a burning target vaporizes the Burning and blooms the Dendro with what is left

- **GIVEN** a target is burning with Pyro and Dendro on it
- **WHEN** two units of Hydro land on it
- **THEN** Vaporize consumes the Burning and its Pyro
- **AND** the Hydro left over blooms the Dendro beneath them

#### Scenario: A reaction is recorded once however many auras it meets

- **GIVEN** one application of an element meets several auras of the same reaction
- **WHEN** the application lands
- **THEN** that reaction is recorded once

### Requirement: Electro and Hydro lying together on a target

Electro and Hydro lying together on a target SHALL tick Electro-Charged damage until one of them decays away.

#### Scenario: Electro-Charged ticks when Electro and Hydro meet and every second after

- **GIVEN** an Electro aura and a Hydro aura stand on a target
- **WHEN** they meet on the target
- **THEN** an Electro-Charged tick lands at once
- **AND** another tick lands each second after

#### Scenario: Electro-Charged ends once one of its auras decays away

- **GIVEN** Electro-Charged is ticking on a target
- **WHEN** one of its auras decays away
- **THEN** Electro-Charged ends after at most one more tick

### Requirement: A hit's damage

A hit's damage SHALL be cut by the enemy's defence against the attacker's level, so a hit from the enemy's own level deals half.

#### Scenario: A hit from an attacker of the enemy's own level is halved by defence

- **GIVEN** an enemy at a level with the defence that level gives it
- **WHEN** an attacker of the same level hits it with no other reduction
- **THEN** defence halves the damage

### Requirement: An enemy's resistance

An enemy's resistance SHALL cut damage by its share, up to three quarters, and beyond that by a diminishing factor.

#### Scenario: A resistance of half cuts half the damage

- **GIVEN** an enemy with 50 percent resistance to an element
- **WHEN** a hit of that element lands
- **THEN** half the damage remains

#### Scenario: A resistance past three quarters cuts damage by a diminishing factor

- **GIVEN** an enemy with 90 percent resistance to an element
- **WHEN** a hit of that element lands
- **THEN** the damage is cut to one over four times the resistance plus one

### Requirement: A hit

A hit SHALL apply its element only on the hits its internal cooldown group lets through.

#### Scenario: Seven arrows in one cooldown group melt the target on the first, fourth and seventh

- **GIVEN** seven arrows hit one target inside one internal cooldown group
- **WHEN** the arrows land
- **THEN** the first, fourth and seventh arrows apply Pyro to the target

#### Scenario: A hit after the reset interval starts the group again

- **GIVEN** an internal cooldown group has run past its reset interval
- **WHEN** the next hit of the group lands
- **THEN** that hit applies its element as the first of the group

### Requirement: Vaporize and Melt

Vaporize and Melt SHALL multiply the hit they amplify, by two where Hydro vaporizes or Pyro melts.

#### Scenario: Hydro vaporizing a Pyro target doubles the hit

- **GIVEN** a target holds Pyro
- **WHEN** a Hydro hit lands and vaporizes it
- **THEN** the hit's damage is multiplied by two

### Requirement: Lunar-Bloom

Lunar-Bloom SHALL deal no damage of its own, and it SHALL leave a Dendro Core.

#### Scenario: A Lunar-Bloom leaves a core and deals no damage

- **GIVEN** a Moonsign turns a Bloom into Lunar-Bloom
- **WHEN** the reaction triggers on an enemy
- **THEN** the reaction deals no damage of its own
- **AND** a Dendro Core is left by the enemy

### Requirement: Ascendant Gleam's reaction bonus

Ascendant Gleam's reaction bonus SHALL be capped at 36 percent, and a skill or burst outside the Moonsign SHALL light it for 20 seconds.

#### Scenario: A reaction bonus past the cap is held at 36 percent

- **GIVEN** the lighter's stats would give a bonus above 36 percent
- **WHEN** a Lunar damage is priced
- **THEN** the bonus is 36 percent

#### Scenario: A skill or burst outside the Moonsign lights Ascendant Gleam for 20 seconds

- **GIVEN** Ascendant Gleam is lit on another character
- **WHEN** a character outside the Moonsign starts a skill or burst
- **THEN** that character's Ascendant Gleam lasts 20 seconds
- **AND** it replaces the Ascendant Gleam lit before

### Requirement: A shield

A shield SHALL absorb damage before the character takes any, and only the damage it cannot absorb SHALL reach the character.

#### Scenario: Damage past what a shield can absorb reaches the character

- **GIVEN** a character holds a shield
- **WHEN** damage exceeds what the shield can absorb
- **THEN** the shield absorbs what it can
- **AND** the excess passes to the character

### Requirement: A normal or charged attack's hit

A normal or charged attack's hit SHALL give its character one energy at a chance set by its weapon, which rises with each hit that gives none.

#### Scenario: A sword's chance of energy rises after a hit that gives none

- **GIVEN** a character with a sword has a base chance of 10 percent
- **WHEN** a hit does not give it energy
- **THEN** its chance on the next hit rises by 5 percent

#### Scenario: A hit that gives energy returns the chance to its base

- **GIVEN** a character's chance has risen after misses
- **WHEN** a hit gives it energy
- **THEN** its chance returns to the weapon's base

### Requirement: A particle

A particle SHALL give energy of its own element to each standing party member at a higher share than other elements.

#### Scenario: A particle gives its own element the largest share

- **GIVEN** a particle of an element is dropped by a struck enemy
- **WHEN** it reaches the party
- **THEN** a member of that element gains 3 energy
- **AND** a member of another element gains 1 energy
- **AND** a member with no element gains 2 energy

### Requirement: When every member of the party is down, the party

When every member of the party is down, the party SHALL revive at 35 percent health at the nearest statue.

#### Scenario: The whole party falling revives it at a statue

- **GIVEN** every member of the deployed team has fallen
- **WHEN** the last member falls
- **THEN** the team revives at 35 percent health
- **AND** it is moved to the nearest statue
