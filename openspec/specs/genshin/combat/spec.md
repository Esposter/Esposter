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

### Requirement: The primary target

The enemy an action turns to as it starts SHALL be the primary target until another action targets, and a primary target that dies or leaves the world SHALL be let go.

#### Scenario: An action that starts makes the enemy it turns to the primary target, which outlasts the action

- **GIVEN** an enemy inside the targeting area of a normal attack
- **WHEN** the attack starts and plays out
- **THEN** the enemy is the primary target, during the attack and after it

#### Scenario: A primary target that dies, or leaves the world, is let go

- **GIVEN** an enemy is the primary target
- **WHEN** it dies or leaves the world
- **THEN** the next step holds no primary target

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

### Requirement: A reaction's Elevation

A deployed member's party reaction bonus SHALL raise a Lunar or Stellar reaction's damage and a direct Lunar hit's by its Elevation, a multiplier of its own applied last, apart from the Base DMG Bonus and the DMG Bonus.

#### Scenario: A Lunar contributor's damage is multiplied by its Elevation last

- **GIVEN** a deployed member's kit gives a Lunar contributor an Elevation of 20 percent
- **WHEN** the contributor's share of the Lunar reaction is priced
- **THEN** its share, CRIT and all, is multiplied by 1.2

#### Scenario: A Stellar reaction's damage, its flat base among it, is multiplied by its creator's Elevation last

- **GIVEN** a deployed member's kit gives the reaction's creator a flat base and an Elevation of 20 percent
- **WHEN** a Stellar Swirl it makes is priced
- **THEN** its damage with the flat base is multiplied by 1.2

#### Scenario: A direct Lunar hit takes the party reaction bonuses its Lunar reaction takes, and its Elevation last

- **GIVEN** a deployed member's kit gives a Lunar-Bloom a DMG Bonus, a CRIT Rate, a CRIT DMG and an Elevation
- **WHEN** a direct Lunar-Bloom hit is priced on an enemy
- **THEN** the DMG Bonus adds to its reaction bonus, the CRIT Rate to its roll and the CRIT DMG to a CRIT hit
- **AND** the whole is multiplied by one plus the Elevation

### Requirement: A Stellar Jubilee's Base DMG Bonus

A Stellar reaction's damage SHALL take the Base DMG Bonus each deployed Stellar Jubilee gives from its holder's stats, the bonuses of two Jubilees adding up.

#### Scenario: A Stellar reaction's Base DMG takes the Base DMG Bonus each deployed Stellar Jubilee gives, two adding up

- **GIVEN** two deployed members whose Stellar Jubilees each give a Base DMG Bonus of 7 percent
- **WHEN** a Stellar Swirl is priced
- **THEN** its base damage is raised by 14 percent

### Requirement: An enemy's strike's element

An enemy's strike SHALL be resisted by the struck member's RES to its kind's attack element, and a kind with no attack element's by the member's Physical RES.

#### Scenario: An elemental enemy's strike is priced against the member's RES to its element

- **GIVEN** a member with 50 percent Pyro RES
- **WHEN** an enemy whose attacks carry Pyro strikes it
- **THEN** the strike's damage is resisted by the 50 percent, and not by the member's Physical RES

#### Scenario: A physical enemy's strike is priced against the member's Physical RES

- **GIVEN** a member with 50 percent Physical RES
- **WHEN** an enemy whose attacks carry no element strikes it
- **THEN** the strike's damage is resisted by the 50 percent

### Requirement: A party member's DMG Reduction

An enemy's strike on a party member SHALL be priced against the member as the team's buffs leave it, its DMG Bonus lowered by the member's DMG Reduction, and a DMG Reduction past the whole SHALL leave it no damage.

#### Scenario: A member's DMG Reduction lowers an enemy's strike on it, as its buffs leave it

- **GIVEN** a buff gives the member on the field a DMG Reduction of 35 percent
- **WHEN** an enemy strikes it
- **THEN** it loses 65 percent of the damage the strike would deal it without the buff

#### Scenario: A DMG Reduction past the whole leaves an enemy's strike no damage

- **GIVEN** a buff gives the member on the field a DMG Reduction of 120 percent
- **WHEN** an enemy strikes it
- **THEN** it loses no HP

### Requirement: A shield

A shield SHALL absorb damage before the character takes any, and only the damage it cannot absorb SHALL reach the character.

#### Scenario: Damage past what a shield can absorb reaches the character

- **GIVEN** a character holds a shield
- **WHEN** damage exceeds what the shield can absorb
- **THEN** the shield absorbs what it can
- **AND** the excess passes to the character

#### Scenario: An elemental shield absorbs an enemy's strike of its own element 250% as effectively

- **GIVEN** the member on the field holds a Cryo shield
- **WHEN** an enemy whose attacks carry Cryo strikes it
- **THEN** each point of the shield's health absorbs 2.5 points of the strike

#### Scenario: A shield that takes a strike reports the health it has left

- **GIVEN** the member on the field holds a shield another member cast
- **WHEN** an enemy's strike lands on it
- **THEN** the shield's owner is told the damage the shield absorbed, the health it has left and the member the strike was on

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
