## Purpose

The game's enemies in the world as built. Each kind's stats come from its base values and the game's level curves, read from the community's dump of the game's tables. An AI stepped on a fixed step idles or patrols, notices, chases, winds up and strikes, is staggered when its poise breaks, gives up past its leash and heals at home. Camps wake together, spawns come back on the game's timers when their region loads, and a defeated enemy drops Mora, Character EXP, materials and energy by the wiki's tables. Each enemy is drawn as a capsule tinted by its state, and tinted white with a small flash at its middle for a moment after a hit.

## Requirements

### Requirement: An idle enemy notices a target and alerts before it chases

An idle enemy SHALL become alert when a target comes within its aggro range, and SHALL chase once its alert time passes or when it is hit.

#### Scenario: A target within aggro range alerts an idle enemy

- **GIVEN** an idle enemy
- **WHEN** a target comes within its aggro range
- **THEN** the enemy becomes alert

#### Scenario: An alert enemy chases once its alert time passes

- **GIVEN** an alert enemy
- **WHEN** its alert time passes
- **THEN** the enemy chases the target

#### Scenario: A hit on an idle enemy makes it chase at once

- **GIVEN** an idle enemy
- **WHEN** it is hit
- **THEN** the enemy chases at once

### Requirement: An enemy strikes only after its windup while the target is in reach

A chasing enemy SHALL begin a windup when a target is within its attack range and its cooldown is over, and SHALL strike only when the windup passes with the target still in reach.

#### Scenario: A target in attack range starts a windup

- **GIVEN** a chasing enemy with its cooldown over and a target in attack range
- **WHEN** the windup starts
- **THEN** the enemy winds up

#### Scenario: A windup that passes with the target in reach strikes

- **GIVEN** an enemy in windup with the target in reach
- **WHEN** the windup passes
- **THEN** the enemy strikes
- **AND** its cooldown starts

#### Scenario: A windup that passes with no target in reach does not strike

- **GIVEN** an enemy in windup with no target in reach
- **WHEN** the windup passes
- **THEN** the enemy does not strike

### Requirement: A staggered enemy cancels its attack until the stagger passes

An enemy whose poise breaks SHALL be staggered and its attack cancelled, and SHALL chase again once the stagger passes.

#### Scenario: A broken poise staggers the enemy

- **GIVEN** a chasing enemy
- **WHEN** its poise breaks
- **THEN** the enemy is staggered
- **AND** its attack is cancelled

#### Scenario: The enemy chases again once the stagger passes

- **GIVEN** a staggered enemy
- **WHEN** the stagger passes
- **THEN** the enemy chases
- **AND** a shield it holds stands again at its maximum

### Requirement: An enemy past its leash returns home healed and immune on the way

An enemy farther from its spawn than its leash distance, or with no target, SHALL walk home immune to damage and SHALL arrive healed to full with its shield and poise restored.

#### Scenario: An enemy past its leash walks home

- **GIVEN** a chasing enemy farther from its spawn than its leash distance
- **WHEN** the step is taken
- **THEN** the enemy walks home

#### Scenario: A returning enemy takes no damage

- **GIVEN** an enemy walking home
- **WHEN** it is struck
- **THEN** it takes no damage

#### Scenario: An enemy arriving home is healed to full

- **GIVEN** an enemy walking home
- **WHEN** it arrives at its spawn
- **THEN** its health is restored to full
- **AND** its shield stands at its maximum
- **AND** its poise is restored

### Requirement: A defeated enemy drops what its table gives and a boss drops nothing

An enemy whose health reaches zero SHALL be defeated and drop Mora, Character EXP and materials by its level band, except that a boss drops nothing and no enemy gives Adventure EXP.

#### Scenario: A defeated common enemy drops by its level band

- **GIVEN** a common enemy at a level
- **WHEN** it is defeated
- **THEN** it drops Mora, Character EXP and materials by its level's band

#### Scenario: A defeated boss drops nothing

- **GIVEN** a boss
- **WHEN** it is defeated
- **THEN** it drops nothing

#### Scenario: A defeated enemy gives no Adventure EXP

- **GIVEN** an enemy defeated
- **WHEN** its rewards are given
- **THEN** no Adventure EXP is given

### Requirement: Enemy stats grow by the game's level curves

An enemy's max health and ATK SHALL be its base values times the multiplier of its level's curve, and its DEF SHALL be scaled by one plus a hundredth of its level.

#### Scenario: A kind's stats are computed at its level

- **GIVEN** an enemy kind and a level
- **WHEN** its stats are computed
- **THEN** its max health and ATK are its base values times the level's curve multipliers
- **AND** its DEF is scaled by one plus a hundredth of its level

### Requirement: A defeated camp member returns only after its camp's respawn time

A defeated enemy SHALL NOT return before its respawn time, which depends on its camp: twelve hours for a camp of common enemies, the next daily reset for a camp with an elite, and on the next load for a camp with a boss.

#### Scenario: A common camp member returns twelve hours after its defeat

- **GIVEN** a camp of common enemies with a member defeated
- **WHEN** twelve hours pass
- **THEN** the member returns

#### Scenario: An elite camp member returns at the next daily reset

- **GIVEN** a camp with an elite and a member defeated
- **WHEN** the next daily reset at 04:00 on the server's clock arrives
- **THEN** the member returns

#### Scenario: A boss camp returns on the next load with its reward claimed

- **GIVEN** a camp with a boss whose reward is claimed
- **WHEN** the page is next loaded
- **THEN** the boss's camp is spawned again

### Requirement: A camp wakes together

When one member of a camp is engaged, every idle member of that camp SHALL be alerted.

#### Scenario: An engaged member wakes its idle camp-mates

- **GIVEN** a camp with one member engaged and others idle
- **WHEN** the step is taken
- **THEN** every idle camp-mate is alerted

### Requirement: Camps spawn when their region arrives and respawn when the World Level changes

A camp SHALL spawn when its region's data arrives and leave when the region leaves reach, and every camp SHALL spawn anew when the World Level changes.

#### Scenario: A region arriving in reach spawns its camps

- **GIVEN** a region whose data arrives in reach
- **WHEN** the data arrives
- **THEN** its camps spawn at the level their World Level gives

#### Scenario: A region leaving reach removes its enemies

- **GIVEN** a region with spawned camps
- **WHEN** the region leaves reach
- **THEN** its enemies are removed

#### Scenario: A World Level change spawns every camp anew

- **GIVEN** camps spawned at one World Level
- **WHEN** the World Level changes
- **THEN** every camp spawns anew

### Requirement: An enemy's strike lands on the team's shields before the member's health

An enemy's strike on a party member SHALL land first on the shields the team holds, all at once, and what none of them absorbs SHALL reduce the struck member's health by its share of maximum health.

#### Scenario: Shields absorb a strike before health

- **GIVEN** the team holding shields and an enemy striking a member
- **WHEN** the strike lands
- **THEN** the shields take the damage first
- **AND** only what none of them absorbs reduces the member's health

### Requirement: An enemy in range of a live taunt strikes the nearest taunt

An enemy within aggro range of a live taunt SHALL strike the nearest such taunt instead of the character.

#### Scenario: The nearest taunt takes the strike

- **GIVEN** a live taunt within an enemy's aggro range
- **WHEN** the enemy strikes
- **THEN** the nearest taunt takes the damage

### Requirement: An enemy drops its energy once at each health threshold for its life

An enemy SHALL drop its energy at each health threshold it falls to, once for its life however it is healed.

#### Scenario: Falling to a threshold drops energy

- **GIVEN** an enemy falling to a health threshold
- **WHEN** the threshold is passed
- **THEN** its energy drops

#### Scenario: Falling to the same threshold again drops no energy

- **GIVEN** an enemy healed and falling again to a threshold already passed
- **WHEN** the threshold is passed again
- **THEN** no energy drops

### Requirement: A page reload restores each defeated enemy by its saved respawn time

A reload of the page SHALL bring back a defeated enemy only once its saved respawn time has passed, and SHALL bring back a boss's camp, whose respawn the save does not hold.

#### Scenario: A defeated enemy stays away after a reload until its respawn time

- **GIVEN** a common enemy defeated, with its saved respawn time still ahead
- **WHEN** the page is reloaded
- **THEN** the enemy is not in the world
- **AND** it is back in the world once its respawn time passes

#### Scenario: A boss returns after a reload

- **GIVEN** a boss defeated in this page's session
- **WHEN** the page is reloaded
- **THEN** the boss is back in the world

### Requirement: Each enemy is drawn as a capsule tinted by its state

Each enemy SHALL be drawn as a capsule tinted by its state, and SHALL be tinted white with a small flash at its middle for a moment after a hit.

#### Scenario: An enemy is tinted by its state

- **GIVEN** an enemy in a given state
- **WHEN** it is drawn
- **THEN** its capsule is tinted by that state

#### Scenario: A hit tints the enemy white with a flash

- **GIVEN** an enemy a hit lands on
- **WHEN** the hit lands
- **THEN** its capsule is tinted white
- **AND** a small flash stands at its middle for a moment
