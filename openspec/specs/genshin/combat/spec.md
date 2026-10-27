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

The enemy an action turns to as it starts SHALL be the primary target until another action targets.

#### Scenario: An action that starts makes the enemy it turns to the primary target, which outlasts the action

- **GIVEN** an enemy inside the targeting area of a normal attack
- **WHEN** the attack starts and plays out
- **THEN** the enemy is the primary target, during the attack and after it

### Requirement: A primary target that dies or leaves the world is let go

A primary target that dies or leaves the world SHALL be let go.

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

Vaporize and Melt SHALL multiply the hit they amplify, by two where Hydro vaporizes or Pyro melts (the reverse reactions, Pyro on Hydro and Cryo on Pyro, are 1.5).

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

Ascendant Gleam's reaction bonus SHALL be capped at 36 percent.

#### Scenario: A reaction bonus past the cap is held at 36 percent

- **GIVEN** the lighter's stats would give a bonus above 36 percent
- **WHEN** a Lunar damage is priced
- **THEN** the bonus is 36 percent

### Requirement: A skill or burst outside the Moonsign lights Ascendant Gleam

A skill or burst outside the Moonsign SHALL light Ascendant Gleam for 20 seconds.

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

- **GIVEN** two deployed members whose Stellar Jubilees each give a Base DMG Bonus of 0.7 percent per 100 of the holder's ATK, capped at 14 percent
- **WHEN** a Stellar Swirl is priced
- **THEN** its base damage is raised by the two bonuses added together

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

### Requirement: An enemy's strike told to the team's kits

An enemy's strike that lands on a party member SHALL be told to every deployed member's kit, with the enemy that struck, the member it landed on and whether a shield on the team took any of it, a strike a shield absorbed whole told as well as one that cost the member HP.

#### Scenario: An enemy's strike on an unshielded member is told to the kits

- **GIVEN** the member on the field holds no shield
- **WHEN** an enemy's strike lands on it
- **THEN** the kits are told that enemy struck that member, no shield taking any of it

#### Scenario: A strike a shield absorbs whole is told to the kits, the member losing no HP

- **GIVEN** the member on the field holds a shield that can absorb the whole of an enemy's strike
- **WHEN** the strike lands on it
- **THEN** the member loses no HP
- **AND** the kits are told that enemy struck that member, a shield taking it

### Requirement: A shield

A shield SHALL absorb damage before the character takes any, and only the damage it cannot absorb SHALL reach the character.

A shield cast SHALL be told to every deployed member's kit once it stands, its owner the character that cast it, a Crystallize shard's the character whose reaction left the shard.

#### Scenario: Damage past what a shield can absorb reaches the character

- **GIVEN** a character holds a shield
- **WHEN** damage exceeds what the shield can absorb
- **THEN** the shield absorbs what it can
- **AND** the excess passes to the character

#### Scenario: An elemental shield absorbs an enemy's strike of its own element 250% as effectively

- **GIVEN** the member on the field holds a Cryo shield
- **WHEN** an enemy whose attacks carry Cryo strikes it
- **THEN** each point of the shield's health absorbs 2.5 points of the strike

#### Scenario: A Shield Strength buff raises what a shield absorbs

- **GIVEN** the member on the field holds a shield and carries a buff of 25% Shield Strength
- **WHEN** an enemy's strike lands on it
- **THEN** each point of the shield's health absorbs 1.25 points of the strike

#### Scenario: A shield that takes a strike reports the health it has left

- **GIVEN** the member on the field holds a shield another member cast
- **WHEN** an enemy's strike lands on it
- **THEN** the shield's owner is told the damage the shield absorbed, the health it has left and the member the strike was on

#### Scenario: A Crystallize shard picked up is told to the party

- **GIVEN** a Crystallize shard lies within reach of the member on the field, and may be picked up
- **WHEN** the member's step picks it up
- **THEN** the team holds the shard's Crystallize shield
- **AND** every deployed member's kit is told that member picked up a shard of that element

#### Scenario: A shield cast is told to every deployed member's kit once it stands

- **GIVEN** two members are deployed
- **WHEN** a kit casts a shield onto the team
- **THEN** each member's kit is told the shield is cast, with the shield already among the team's effects

#### Scenario: Tells the team's kits the shard's Crystallize shield is cast, owned by the character whose reaction left it

- **GIVEN** a Crystallize shard another member's reaction left lies within reach of the member on the field
- **WHEN** the member's step picks it up
- **THEN** the team's kits are told its Crystallize shield is cast, owned by the member whose reaction left the shard

### Requirement: A kit's pick-up

A pick-up a kit leaves in the world SHALL be picked up by the member on the field within its radius once it may be, and SHALL then do what its kit gives it to do. One never picked up SHALL run out as an effect expiring.

#### Scenario: A pick-up in reach is picked up once it may be

- **GIVEN** a kit's pick-up lies within its radius of the member on the field, and may be picked up
- **WHEN** the member's step runs
- **THEN** the pick-up does what picking it up does
- **AND** it is taken off the team's effects with no effect expiring

#### Scenario: A pick-up too new or out of reach is left where it lies

- **GIVEN** a kit's pick-up that may not yet be picked up, or lies past its radius
- **WHEN** the member's step runs
- **THEN** the pick-up stays where it lies

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

### Requirement: Glimmer Reaction Damage

A Stellar Swirl's own damage SHALL be weighted across the four highest contributors, at 0.6, 0.3, 0.05 and 0.05, each contributor's damage worked out alone with standard crit. A Stellar-Conduct SHALL deal no damage of its own: its damage is dealt only by a talent's or a constellation's direct hit.

#### Scenario: a Glimmer reaction weights its four highest contributors

- **GIVEN** a Stellar Swirl with four contributors of differing damage
- **WHEN** the reaction deals its damage
- **THEN** the highest contributor counts for 60%, the next for 30%, and the two lowest of the four for 5% each

#### Scenario: a Glimmer reaction with a lower contributor is not counted

- **GIVEN** a Stellar Swirl with five contributors
- **WHEN** the reaction deals its damage
- **THEN** only the four highest contributors are counted

### Requirement: Direct Stellar Hits

A talent's or a constellation's direct Stellar hit SHALL be priced by the Glimmer formula over its talent multiplier of its striker's ATK, raised by the Base DMG Bonus of the deployed team's Stellar Jubilees, its elemental mastery and its Stellar Glimmer reaction DMG Bonus, cut by the enemy's RES alone with no Defence. Its coefficient SHALL be 1 for a Stellar Swirl and, for a Stellar-Conduct, the Starlight Prism's by the count of hits its striker carries.

#### Scenario: prices a direct Stellar-Conduct hit by the Glimmer formula at its coefficient by the Starlight Prism's count its striker carries, with no Defence

- **GIVEN** a striker carrying the Starlight Prism's count of 3 recorded hits
- **WHEN** its direct Stellar-Conduct hit strikes an enemy
- **THEN** it is priced at a coefficient of 1.55, with no Defence

#### Scenario: prices a direct Stellar Swirl hit by the Glimmer formula at its coefficient by the Starlight Prism's count its striker carries, with no Defence

- **GIVEN** a striker carrying the Starlight Prism's count of 3 recorded hits
- **WHEN** its direct Stellar Swirl hit strikes an enemy
- **THEN** it is priced at a coefficient of 1, which the count does not raise

### Requirement: Direct Stellar Hits take the party reaction bonuses

A talent's or a constellation's direct Stellar hit SHALL take the party reaction bonuses its reaction takes, with the Elevation last.

#### Scenario: a direct Stellar-Conduct hit takes the party reaction bonuses Stellar-Conduct takes, and its Elevation last

- **GIVEN** a party member whose kit grants Stellar-Conduct a DMG Bonus, a CRIT DMG bonus and an Elevation
- **WHEN** a direct Stellar-Conduct hit strikes an enemy
- **THEN** the DMG Bonus joins its reaction bonus, the CRIT DMG its CRIT hit, and the Elevation multiplies the whole last

### Requirement: Stellar Swirl Once Enabled

Anemo SHALL turn a Cryo Swirl into Stellar Swirl while the party holds a Stellar Jubilee passive that enables Stellar Swirl.

#### Scenario: a Cryo Swirl starts Stellar Swirl while the party enables it

- **GIVEN** the party holds a Stellar Jubilee passive that enables Stellar Swirl
- **WHEN** Anemo Swirls a Cryo aura
- **THEN** the reaction is Stellar Swirl

#### Scenario: a Cryo Swirl stays an ordinary Swirl without the enabler

- **GIVEN** no party member holds a Stellar Jubilee passive that enables Stellar Swirl
- **WHEN** Anemo Swirls a Cryo aura
- **THEN** the reaction is an ordinary Swirl

#### Scenario: a Stellar Swirl spreads no Cryo beside it

- **GIVEN** the party holds a Stellar Jubilee passive that enables Stellar Swirl
- **WHEN** Anemo Swirls a Cryo aura
- **THEN** the reaction carries no spread gauge

### Requirement: Stellar-Conduct Once Enabled

A Superconduct SHALL become Stellar-Conduct while the party holds a Stellar Jubilee passive that enables Stellar-Conduct, and Stellar-Conduct SHALL NOT occur without one.

#### Scenario: a Superconduct becomes Stellar-Conduct while the party enables it

- **GIVEN** the party holds a Stellar Jubilee passive that enables Stellar-Conduct
- **WHEN** Electro meets a Cryo aura
- **THEN** the reaction is Stellar-Conduct

#### Scenario: no Stellar-Conduct occurs without the enabler

- **GIVEN** no party member holds a Stellar Jubilee passive that enables Stellar-Conduct
- **WHEN** Electro meets a Cryo aura
- **THEN** the reaction is an ordinary Superconduct

### Requirement: Stellar Jubilee Enables Both Reactions

A Stellar Linchpin user's Stellar Jubilee passive SHALL enable Stellar Swirl and Stellar-Conduct for the party it is in.

#### Scenario: a Stellar Jubilee passive enables both reactions for its party

- **GIVEN** a party member holds a Stellar Jubilee passive
- **WHEN** the party's reactions are read
- **THEN** Stellar Swirl and Stellar-Conduct are both enabled

### Requirement: Starlight Prism Sustains a Polestar Field

A Stellar-Conduct SHALL leave a Starlight Prism that lasts 7 seconds and sustains a Polestar Field of radius 15 around it, the field standing for as long as the prism does. A Stellar-Conduct triggered with the body inside a standing field SHALL set that field's time back to 7 seconds rather than leave a second field, and one triggered with the body inside none SHALL leave a new field beside any that stand. While it stands, the enemies inside it have their Physical RES lowered by 40%.

#### Scenario: a Stellar-Conduct places a Polestar Field round the point given for 7 seconds, ticking every 4

- **WHEN** a Stellar-Conduct is triggered and no Polestar Field stands
- **THEN** a Polestar Field of radius 15 stands at the body on the field for 7 seconds, placed by the reaction path for any enabler

#### Scenario: a Stellar-Conduct refreshes a standing Polestar Field

- **WHEN** a Stellar-Conduct is triggered with the body inside a standing Polestar Field
- **THEN** the field's time is set back to 7 seconds, and no second field stands

#### Scenario: a Stellar-Conduct with the body outside the standing Polestar Field places a second one beside it

- **WHEN** a Stellar-Conduct is triggered with the body outside the one Polestar Field that stands
- **THEN** a second field stands at the body for 7 seconds, and the first keeps its time

### Requirement: Starlight Prism Buffs by Recorded Hits

Inside the field, a Cryo or Electro hit on an enemy that applies an element, as its internal cooldown allows, SHALL be recorded by the prism, the hit that created the prism excepted. Every 4 seconds the count resets, and the buffs it grants last 4 seconds: the Base Reaction Coefficient of the Stellar-Conduct, the Cryo and Electro DMG Bonus of the body in the field, and the Physical RES reduction of the enemies in it.

#### Scenario: a recorded hit raises the Stellar-Conduct's coefficient

- **WHEN** one Cryo or Electro hit is recorded
- **THEN** the Base Reaction Coefficient is 1.45, rising by 0.05 for each further hit up to 12 hits, where it is 2

#### Scenario: a field with no recorded hit gives a 20% Cryo and Electro DMG Bonus

- **WHEN** no Cryo or Electro hit is recorded
- **THEN** the body in the field has a 20% Cryo and Electro DMG Bonus

#### Scenario: a field with recorded hits gives 28% plus 1% a hit

- **WHEN** one Cryo or Electro hit is recorded
- **THEN** the body in the field has a 29% Cryo and Electro DMG Bonus, rising by 1% for each further hit up to 12 hits, where it is 40%

#### Scenario: a member's Radiance: Stellar-Conduct carries the count of hits the last tick took

- **WHEN** two Cryo or Electro hits are recorded and the field's next tick passes with the body inside it
- **THEN** each deployed member's Radiance: Stellar-Conduct carries the count of 2, which a direct Stellar-Conduct hit reads its coefficient by

#### Scenario: a field lowers the enemies' Physical RES by 40%

- **WHEN** an enemy stands in the field
- **THEN** its Physical RES is reduced by 40%

### Requirement: Stellar Swirl Places a Stellar Vortex

A Stellar Swirl SHALL deal Anemo damage to its target and then leave one Stellar Vortex lasting 3 seconds, and a standing vortex SHALL NOT be doubled. A vortex SHALL explode at its expiry for AoE Cryo damage. The third Stellar Swirl SHALL level it to Lv. 2, which deals more damage across a wider area, and three further Stellar Swirls SHALL explode it at once.

#### Scenario: a Stellar Swirl leaves one Stellar Vortex for 3 seconds

- **WHEN** a Stellar Swirl is triggered and no vortex stands
- **THEN** one Lv. 1 Stellar Vortex stands for 3 seconds

#### Scenario: the third Stellar Swirl levels the vortex up

- **WHEN** the third Stellar Swirl is triggered
- **THEN** the vortex is Lv. 2

#### Scenario: three more Stellar Swirls explode a vortex at once

- **WHEN** three more Stellar Swirls are triggered after the vortex levels up
- **THEN** the vortex explodes at once

### Requirement: Stellar Vortex Explosion Coefficient

A Stellar Vortex's explosion SHALL be priced at a Base Reaction Coefficient of 2 at Lv. 1 and 3 at Lv. 2, for the indirect Stellar Glimmer damage. Its contributors' damage is weighted as the Glimmer Reaction Damage requirement above states.

#### Scenario: a Stellar Vortex that expires with one or two stacks explodes at a coefficient of 2

- **WHEN** a vortex has one or two stacks of Stellar Swirl and runs out
- **THEN** its explosion's Base Reaction Coefficient is 2

#### Scenario: a Stellar Vortex detonated with three or more stacks uses a coefficient of 3

- **WHEN** a vortex has three or more stacks of Stellar Swirl and explodes, at its sixth stack or as it runs out
- **THEN** its explosion's Base Reaction Coefficient is 3

### Requirement: Stellar Swirl's Anemo Instance Coefficient

A Stellar Swirl's Anemo instance SHALL be priced at a Base Reaction Coefficient of 0.75, for the indirect Stellar Glimmer damage.

#### Scenario: a Stellar Swirl's Anemo instance has a coefficient of 0.75

- **WHEN** a Stellar Swirl is triggered
- **THEN** its Anemo instance's Base Reaction Coefficient is 0.75

## Open

- [ ] **Each deployed Stellar Jubilee's Base DMG Bonus adds, two at 7% giving 14%** — contradicted by `~/Esposter/cache/gcsim-v2.47.2/internal/characters/odette/stellar.go`: the Base DMG bonus is 0.7% per 100 ATK, capped at 14%.
- [ ] **An enemy's strike is resisted by the member's RES to its attack element, or Physical RES with none** — no source yet: gcsim's `~/Esposter/cache/gcsim-v2.47.2/pkg/avatar/avatar.go` sets a member's resistance to zero, with a TODO that players have no resistances, so the source does not hold this rule.
- [ ] **A DMG Reduction lowers a strike's damage by its share, and 120% leaves none** — no source yet: gcsim's `DamageReduction` in `~/Esposter/cache/gcsim-v2.47.2/pkg/core/player/character/mods.go` sums the active mods' amounts, and no gcsim code calls it on a strike, so the source does not hold this arithmetic
- [ ] **A party that is all down revives at 35% health at the nearest statue** — no source yet: the game's own rule for a fallen party's revive at a statue, which gcsim does not hold
- [ ] **The Starlight Prism lasts 7 seconds, sustains a radius-15 Polestar Field, and a refresh sets the field back to 7 seconds** — contradicted by `~/Esposter/cache/gcsim-v2.47.2/pkg/reactable/stellarconduct_gadget.go:17`: its field lasts 6 seconds (`sscFieldDur`).
- [ ] **The third Stellar Swirl levels the vortex to Lv. 2, and three more explode it at once** — contradicted by `~/Esposter/cache/gcsim-v2.47.2/pkg/reactable/stellarswirl.go`: its stack add reaches 3 on the second swirl and 6 on the third.
- [ ] **A direct Stellar Swirl hit has Base Reaction Coefficient 1, which the count does not raise** — no source yet: gcsim's direct-hit coefficient for a Stellar Swirl, since `~/Esposter/cache/gcsim-v2.47.2/pkg/core/combat/reaction.go` line 24 gives 1 to the reaction's tag alone.
