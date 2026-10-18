## Purpose

The player's party as the game keeps it — up to four characters in each team Party Setup holds, one team deployed and one of its members on the field. A member's key switches it in past the one second cooldown, never one who is down, and Left Alt with the key also uses that member's burst. A team is added, renamed, disbanded or deployed under the game's own limits and refusals, and the deployed team's elements give its Elemental Resonances. The state is plain data and pure rules in genshin-world, read by the world screen once a frame.

## Requirements

### Requirement: A team holds up to four characters, one each

A team SHALL hold up to four characters, each character at most once, and the deployed team's first member SHALL stand on the field.

#### Scenario: Team set with its members

- **GIVEN** a team in Party Setup
- **WHEN** its members are set
- **THEN** each character appears in the team once
- **AND** the team holds no more than four characters

#### Scenario: Team deployed

- **GIVEN** a team with standing members
- **WHEN** the team is deployed
- **THEN** its first member stands on the field

### Requirement: A new player's party starts with four default teams

A new player's party SHALL start with the four default teams, named Party 1 to Party 4, with the first deployed and its first member on the field.

#### Scenario: New player's party created

- **GIVEN** a new player's party is created
- **WHEN** the player first opens Party Setup
- **THEN** the teams Party 1 to Party 4 are shown
- **AND** Party 1 is deployed with its first member on the field

### Requirement: A member's key switches it onto the field past the cooldown

A party member's key SHALL switch that member onto the field when the member is in the deployed team and the switch cooldown since the last switch has passed.

#### Scenario: Key switches a member in

- **GIVEN** a standing member in the deployed team and no switch in the last second
- **WHEN** the player presses that member's key
- **THEN** the member takes the field

#### Scenario: Switch within the cooldown

- **GIVEN** a switch was made less than a second ago
- **WHEN** the player presses another member's key
- **THEN** the switch is refused for cooldown

### Requirement: A switch never brings on a fallen member or changes an empty slot

A switch SHALL NOT bring on a character who is down, and SHALL leave the field unchanged for an empty slot or the member already on the field.

#### Scenario: Fallen member's key pressed

- **GIVEN** the member in that slot is down
- **WHEN** the player presses its key
- **THEN** the switch is refused because the character is down

#### Scenario: Empty slot or member already on the field

- **GIVEN** the key's slot is empty or holds the member already on the field
- **WHEN** the player presses the key
- **THEN** the field is unchanged

### Requirement: Left Alt with a member's key uses that member's burst

Left Alt with a party member's key SHALL use that member's burst once the member is on the field, and a refused switch SHALL use no burst.

#### Scenario: Burst on switch

- **GIVEN** a standing member in the deployed team and no cooldown running
- **WHEN** the player presses Left Alt with that member's key
- **THEN** the member takes the field
- **AND** the member uses its burst

#### Scenario: Refused switch uses no burst

- **GIVEN** a switch that is refused for cooldown
- **WHEN** the player presses Left Alt with that member's key
- **THEN** no burst is used

### Requirement: A character keeps its own HP, energy and cooldowns whichever team holds it

A character SHALL keep its own HP as a share of its Max HP, its energy toward its burst and its skill and burst cooldowns, whichever team holds it.

#### Scenario: Character moved between teams

- **GIVEN** a character with partial HP, energy and a running cooldown
- **WHEN** the character is moved into another team
- **THEN** its HP, energy and cooldowns are unchanged
- **AND** its HP keeps its share as its Max HP changes

### Requirement: A member who falls leaves the field to the next standing member

When the member on the field falls, the next standing member of the deployed team SHALL take the field.

#### Scenario: Member on the field falls

- **GIVEN** the member on the field is taken to no HP
- **WHEN** the member falls
- **THEN** the member is down and loses its energy
- **AND** the next standing member of the deployed team takes the field

### Requirement: A fallen deployed team is revived at 35 percent and jumped to the nearest statue

A deployed team whose members have all fallen SHALL be revived at 35 percent of each member's Max HP and jumped to the nearest loaded statue to the body.

#### Scenario: Whole team fallen

- **GIVEN** every member of the deployed team is down
- **WHEN** the team is revived
- **THEN** each fallen member is revived at 35 percent of its Max HP
- **AND** the team is jumped to the nearest loaded Statue of The Seven to the body

#### Scenario: No statue loaded

- **GIVEN** every member of the deployed team is down and no statue is loaded
- **WHEN** the team is revived
- **THEN** the team is revived where it fell

### Requirement: A drowning takes every member's energy and a tenth of its Max HP

A drowning SHALL take every member's energy and a tenth of each member's Max HP.

#### Scenario: Player drowns

- **GIVEN** the party is drowning
- **WHEN** the drowning takes effect
- **THEN** every member loses all its energy
- **AND** every member loses a tenth of its Max HP

### Requirement: A team is deployed only with a standing member

A team SHALL be refused deployment when it has no members, and when all its members are down.

#### Scenario: Empty team deployed

- **GIVEN** a team with no members
- **WHEN** the player deploys it
- **THEN** the deployment is refused as an empty team

#### Scenario: Team of fallen members deployed

- **GIVEN** a team whose members are all down
- **WHEN** the player deploys it
- **THEN** the deployment is refused because the team is down

### Requirement: Teams are added, renamed and disbanded under the game's limits

The player SHALL be able to add a team, which is named Team Standing By until renamed, up to fifteen teams, to rename a team, and to disband a team, with the four default teams and the deployed team kept.

#### Scenario: Team added

- **GIVEN** fewer than fifteen teams exist
- **WHEN** the player adds a team
- **THEN** the team is named Team Standing By until it is renamed

#### Scenario: Sixteenth team refused

- **GIVEN** fifteen teams exist
- **WHEN** the player adds a team
- **THEN** the addition is refused as full

#### Scenario: Team disbanded

- **GIVEN** the player disbands a team that is neither a default team nor the deployed one
- **WHEN** the disbanding completes
- **THEN** the team is removed
- **AND** the four default teams and the deployed team remain

#### Scenario: Team renamed to an empty name

- **GIVEN** a team the player has renamed
- **WHEN** the player renames it to an empty name
- **THEN** the team takes back its own name

### Requirement: The deployed team's elements give its Elemental Resonances

A full team's elements SHALL give each element that two or more members share its Elemental Resonance, and four different elements SHALL give the Protective Canopy.

#### Scenario: Two members share an element

- **GIVEN** a full deployed team with two Pyro members
- **WHEN** the team's resonances are read
- **THEN** the Pyro Elemental Resonance is given

#### Scenario: Four different elements

- **GIVEN** a full deployed team whose four members have four different elements
- **WHEN** the team's resonances are read
- **THEN** the Protective Canopy is given and no other resonance is given

#### Scenario: Team not full

- **GIVEN** a deployed team with fewer than four members
- **WHEN** the team's resonances are read
- **THEN** no resonance is given

#### Scenario: Stat resonance applied

- **GIVEN** the Pyro Elemental Resonance is given to the deployed team
- **WHEN** each member's attributes are read
- **THEN** every member of the deployed team has its ATK raised by 25 percent

### Requirement: Enduring Rock lowers a struck enemy's Geo resistance while a shield holds

While a shield is up on a Geo team with the Enduring Rock resonance, the team's hits SHALL deal 15 percent more damage, and each enemy struck SHALL lose 20 percent of its Geo resistance for 15 seconds.

#### Scenario: Shield up on a Geo team

- **GIVEN** a Geo team with the Enduring Rock resonance and a live shield
- **WHEN** the team strikes an enemy
- **THEN** the hit deals 15 percent more damage
- **AND** the enemy loses 20 percent of its Geo resistance for 15 seconds before the hit's damage is read

#### Scenario: No shield up

- **GIVEN** a Geo team with the Enduring Rock resonance and no live shield
- **WHEN** the team strikes an enemy
- **THEN** no extra damage and no lost resistance apply

### Requirement: Sprawling Greenery gives Elemental Mastery after each reaction

With the Sprawling Greenery resonance, each reaction a strike triggers SHALL give every party member Elemental Mastery for six seconds, 30 after Burning, Quicken, Bloom or Lunar-Bloom and 20 after Aggravate, Spread, Hyperbloom or Burgeon.

#### Scenario: Reaction triggered by a strike

- **GIVEN** a Dendro team with the Sprawling Greenery resonance
- **WHEN** a strike triggers a Burning reaction
- **THEN** every party member gains 30 Elemental Mastery for six seconds

#### Scenario: Reaction of the lesser kind

- **GIVEN** a Dendro team with the Sprawling Greenery resonance
- **WHEN** a strike triggers a Spread reaction
- **THEN** every party member gains 20 Elemental Mastery for six seconds

### Requirement: Impetuous Winds shortens skills, speeds movement and cuts stamina spent

With the Impetuous Winds resonance, a skill's cooldown SHALL be five percent shorter, the on-field character's walking, running, sprinting and dashing SHALL be ten percent faster, and each stamina spend SHALL be 15 percent lower while the on-field character carries Anemo's resonance.

#### Scenario: Skill started on an Anemo team

- **GIVEN** an Anemo team with the Impetuous Winds resonance
- **WHEN** a skill starts its cooldown
- **THEN** the cooldown is five percent shorter

#### Scenario: On-field character moves

- **GIVEN** the on-field character with the Impetuous Winds resonance
- **WHEN** the character walks, runs, sprints or dashes
- **THEN** its speed is ten percent higher

#### Scenario: Stamina spent

- **GIVEN** the on-field character carries Anemo's resonance
- **WHEN** the character spends stamina
- **THEN** each stamina spend is 15 percent lower

### Requirement: Each HP change is recorded for the character kits

Every HP change made in combat SHALL be recorded for the character kits, and a revive or a statue's heal SHALL NOT be recorded.

#### Scenario: Combat heal recorded

- **GIVEN** a heal in combat restores HP to a member
- **WHEN** the heal takes effect
- **THEN** the change is recorded with its member, its share and the character whose kit made it

#### Scenario: Statue heal not recorded

- **GIVEN** a statue heals a member out of combat
- **WHEN** the heal takes effect
- **THEN** no change is recorded for the kits

### Requirement: Only the character on the field takes an enemy's strike

Only the character on the field SHALL take an enemy's strike, while the other members' HP falls only by a drowning.

#### Scenario: Enemy strikes the party

- **GIVEN** an enemy strikes the party
- **WHEN** the strike lands
- **THEN** only the character on the field loses HP

### Requirement: The HUD redraws as the party changes

The world's HUD SHALL redraw as members' HP, energy and cooldowns change and as the teams change.

#### Scenario: Member's HP falls

- **GIVEN** the HUD shows a member's HP
- **WHEN** the member's HP changes
- **THEN** the HUD redraws the member's HP
