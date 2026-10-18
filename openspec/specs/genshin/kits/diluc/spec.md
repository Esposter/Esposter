## Purpose

Diluc's kit as built: his strikes, charged attack, collision and plunges, Searing Onslaught's three presses and Dawn with its infusion, phoenix and A4, with his Relentless built apart from its +3 seconds duration clause, and his phase-0 passive left unbuilt.

## Requirements

### Requirement: Basic attacks

Diluc's normal attacks SHALL be four strikes, a charged attack, a collision attack and two plunging attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Diluc is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

### Requirement: Provisional charged attack

Diluc's charged attack SHALL be provisional, its slashes timed at half a second and one second within an attack lasting one and a fifth seconds, until a recording of the game settles them.

#### Scenario: Charged attack timings stay estimates

- **GIVEN** Diluc charges his attack
- **WHEN** the charged attack plays
- **THEN** the slashes land at half a second and one second
- **AND** the attack ends at one and a fifth seconds, and these values stay provisional until a recording settles them

### Requirement: Searing Onslaught chain

Searing Onslaught SHALL chain up to three presses, each pressed within four seconds of the one before, and its ten-second cooldown SHALL start on the first press.

#### Scenario: A follow-up press plays inside the window

- **GIVEN** Searing Onslaught was pressed less than four seconds ago
- **WHEN** the player presses it again
- **THEN** its next press plays even while the cooldown runs

#### Scenario: A press after the chain lapses waits out the cooldown

- **GIVEN** the chain has lapsed and the first press was less than ten seconds ago
- **WHEN** the player presses Searing Onslaught
- **THEN** it does not cast

### Requirement: Dawn phoenix

Dawn's phoenix SHALL launch from the slash, strike eight ticks at intervals of a fifth of a second, and explode 1.7 seconds after its launch.

#### Scenario: The phoenix strikes eight ticks and then explodes

- **GIVEN** Dawn's slash has launched the phoenix
- **WHEN** the phoenix runs its course
- **THEN** it strikes eight ticks, one every fifth of a second
- **AND** it explodes 1.7 seconds after its launch

### Requirement: Dawn stamina drain

While Dawn plays, stamina SHALL drain at 40 a second, 48 in all over its 1.2 seconds.

#### Scenario: Dawn drains stamina as it plays

- **GIVEN** Diluc has stamina
- **WHEN** Dawn plays
- **THEN** stamina drains at 40 a second until the slash ends

### Requirement: Poise from the skill, burst and collision

Searing Onslaught SHALL deal 120 poise, Dawn SHALL deal 100 poise, and Diluc's collision attack SHALL deal 35 poise.

#### Scenario: Searing Onslaught deals 120 poise

- **GIVEN** Diluc is the character on the field
- **WHEN** Searing Onslaught hits an enemy
- **THEN** the enemy takes 120 poise damage

#### Scenario: The collision attack deals 35 poise

- **GIVEN** Diluc is the character on the field
- **WHEN** his collision attack hits an enemy
- **THEN** the enemy takes 35 poise damage

### Requirement: Dawn infusion

Dawn SHALL infuse Diluc's attacks for as long as it lasts.

#### Scenario: Diluc's attacks are infused while Dawn lasts

- **GIVEN** Diluc casts Dawn
- **WHEN** Diluc attacks while Dawn lasts
- **THEN** his attacks are infused

### Requirement: First constellation adds 15% DMG to enemies above half HP

From constellation 1, each strike Diluc makes SHALL deal 15% more DMG to an enemy whose HP is above half.

#### Scenario: A strike on an enemy above half HP gains the bonus

- **GIVEN** Diluc is at constellation 1
- **WHEN** a strike hits an enemy whose HP is above half
- **THEN** the strike's DMG bonus is raised by 15%

#### Scenario: Below the first constellation a strike gains nothing

- **GIVEN** Diluc is at constellation 0
- **WHEN** a strike hits an enemy whose HP is above half
- **THEN** the strike's DMG bonus is unchanged

### Requirement: Second constellation stacks Searing Ember on each hit Diluc takes

From constellation 2, each hit that costs Diluc HP SHALL add a stack of Searing Ember, at most one every 1.5 seconds and up to three stacks. Each stack gives 10% ATK and 5% ATK SPD for 10 seconds, and a new stack restarts those 10 seconds.

#### Scenario: A hit that costs Diluc HP adds a stack

- **GIVEN** Diluc is at constellation 2
- **WHEN** an enemy's strike, a drown or a wildlife's charge costs Diluc HP
- **THEN** his ATK is raised by 10% and his ATK SPD by 5% for 10 seconds

#### Scenario: A hit inside 1.5 seconds of the last stack adds none

- **GIVEN** Diluc is at constellation 2 and a stack was added less than 1.5 seconds ago
- **WHEN** another hit costs Diluc HP
- **THEN** no stack is added

#### Scenario: HP lost to a kit of the team that names its source adds nothing

- **GIVEN** Diluc is at constellation 2
- **WHEN** HP is lost to a kit of the team that names its own source
- **THEN** no stack is added

#### Scenario: Below the second constellation a hit adds nothing

- **GIVEN** Diluc is at constellation 1
- **WHEN** an enemy's strike costs Diluc HP
- **THEN** his ATK and ATK SPD are unchanged

### Requirement: Fourth constellation adds 40% to a follow-up Searing Onslaught press two seconds after the one before

From constellation 4, a Searing Onslaught press that follows the one before it by two seconds or more SHALL deal 40% more DMG for two seconds, its skill strikes taking the bonus while it runs. The wiki's Flowing Flame text and gcsim v2.47.2's `cons.go` agree on the window.

#### Scenario: A press two seconds after the last gets the bonus

- **GIVEN** Diluc is at constellation 4
- **WHEN** he presses Searing Onslaught, and then presses its next press two seconds later
- **THEN** that press's strikes deal 40% more DMG, and the bonus ends two seconds after the press

#### Scenario: A press within two seconds of the last gets nothing

- **GIVEN** Diluc is at constellation 4
- **WHEN** he presses Searing Onslaught, and then presses its next press one second later
- **THEN** that press's strikes gain no bonus

#### Scenario: The first press and his normal attacks get nothing

- **GIVEN** Diluc is at constellation 4
- **WHEN** he presses Searing Onslaught for the first time, or lands a normal attack while the bonus runs
- **THEN** those strikes gain no bonus

#### Scenario: Below the fourth constellation nothing is added

- **GIVEN** Diluc is at constellation 3
- **WHEN** he presses a follow-up Searing Onslaught press two seconds after the one before it
- **THEN** that press's strikes gain no bonus

### Requirement: Sixth constellation adds 30% DMG and ATK SPD to the next two normal attacks

From constellation 6, after a Searing Onslaught press the next two normal attacks within six seconds SHALL deal 30% more DMG and attack 30% faster. Each press re-arms them. The combo clause, that Searing Onslaught does not interrupt the normal attack combo, is not built.

#### Scenario: The next two normal attacks are buffed

- **GIVEN** Diluc is at constellation 6
- **WHEN** he presses Searing Onslaught, and then lands normal attacks
- **THEN** the first two normal attacks deal 30% more DMG and attack 30% faster, and the third does not

#### Scenario: The attacks must come within six seconds

- **GIVEN** Diluc is at constellation 6 and six seconds have passed since his Searing Onslaught press
- **WHEN** he lands a normal attack
- **THEN** that attack gains nothing

#### Scenario: Below the sixth constellation nothing is added

- **GIVEN** Diluc is at constellation 5
- **WHEN** he lands a normal attack after Searing Onslaught
- **THEN** that attack gains nothing
