## Purpose

Nicole's kit as built: her three strikes, charged attack, plunges, Pyro skill and Pyro burst's hit, her burst's projections, and her first and fourth ascension buffs, and her first, second, fourth and sixth constellations.

## Requirements

### Requirement: Nicole's three strikes, charged attack and plunges

Nicole's three strikes SHALL land in order.

Her charged attack and plunges SHALL land on the enemies within reach.

#### Scenario: Three strikes in sequence

- **WHEN** the player uses normal attack three times in a row
- **THEN** the three strikes land in order on the enemies within reach

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: Nicole's Pyro skill

Nicole's elemental skill SHALL deal Pyro damage in a 5-metre circle round her body and SHALL go on a 16-second cooldown.

#### Scenario: Skill hits the circle round Nicole

- **WHEN** the player presses Nicole's skill
- **THEN** Pyro damage lands within a 5-metre circle round her body
- **AND** the skill goes on a 16-second cooldown

### Requirement: Nicole's Pyro burst

Nicole's burst SHALL deal Pyro damage in a 6.5-metre circle on the primary target and SHALL cost 60 energy with a 15-second cooldown.

#### Scenario: Burst with enough energy

- **GIVEN** Nicole has at least 60 energy
- **WHEN** the player casts the burst
- **THEN** Pyro damage lands in a 6.5-metre circle on the primary target
- **AND** the burst goes on a 15-second cooldown

#### Scenario: Burst refused without enough energy

- **GIVEN** Nicole has less than 60 energy
- **WHEN** the player casts the burst
- **THEN** the burst does not start

### Requirement: Nicole's skill shields the team

Nicole's elemental skill SHALL shield the team with a Pyro shield scaled by her attack, 8 frames after the cast and lasting 20 seconds.

#### Scenario: Shield lands 8 frames after the cast

- **WHEN** the player presses Nicole's skill
- **THEN** a Pyro shield of 2.21184 times her attack plus 1386.6697, at level 1, covers the team 8 frames later, for 20 seconds

### Requirement: Nicole's skill buffs the team's ATK

Nicole's elemental skill SHALL give each deployed member an ATK buff scaled by her attack and capped, 8 frames after the cast and lasting 20 seconds.

#### Scenario: Team ATK buff is capped

- **WHEN** the skill's buff lands on a deployed member at level 1
- **THEN** the member gets 8.25% of Nicole's attack as ATK, up to 330, for 20 seconds

### Requirement: Nicole's burst projections

Nicole's burst SHALL project a copy of each hit the active character lands on an enemy while its status lasts, physical hits included. A projection SHALL land 30 frames after its hit, at most four times and once each 3 seconds.

#### Scenario: Projection lands 30 frames after the hit that starts it

- **GIVEN** Nicole's burst has started and 109 frames have passed
- **WHEN** the active character's hit lands on an enemy
- **THEN** a projection lands on that enemy 30 frames later

#### Scenario: No projection before the status starts

- **GIVEN** Nicole's burst has started
- **WHEN** a hit lands 108 frames into the burst
- **THEN** no projection lands

#### Scenario: One projection each 3 seconds

- **GIVEN** Nicole's burst is active
- **WHEN** two hits land 1 second apart
- **THEN** only one projection lands

#### Scenario: Projections stop at four

- **GIVEN** Nicole's burst is active
- **WHEN** five hits land 3.1 seconds apart
- **THEN** four projections land

#### Scenario: Physical hit is projected at the hitting character's element

- **GIVEN** Nicole's burst has started and 109 frames have passed
- **WHEN** the active character's physical hit lands on an enemy
- **THEN** a projection lands on that enemy 30 frames later, dealt at the hitting character's element

#### Scenario: Only the active character's hit projects

- **GIVEN** Nicole's burst is active and another character is active
- **WHEN** that other character's hit lands on an enemy
- **THEN** no projection lands

### Requirement: Nicole's first ascension

Her first ascension SHALL give the character swapped in ATK 300 for as long as her skill's buff on that character stands, three seconds after the swap or at once for a Hexerei.

#### Scenario: A swap in gets the buff three seconds on

- **GIVEN** Nicole is at least ascension 1 and her skill's buff stands on the team
- **WHEN** a character is swapped in
- **THEN** that character gains ATK 300 three seconds later, for as long as her skill's buff on it stands

#### Scenario: A Hexerei swapped in gets the buff at once

- **GIVEN** Nicole is at least ascension 1 and her skill's buff stands on the team
- **WHEN** a Hexerei character is swapped in
- **THEN** she gains ATK 300 at once, for as long as her skill's buff on it stands

#### Scenario: A later swap cancels an earlier upgrade

- **GIVEN** a swap's upgrade has not yet landed
- **WHEN** another swap happens
- **THEN** the earlier upgrade does not land

#### Scenario: A swap away takes the buff off the character it leaves

- **GIVEN** Nicole is below constellation 6 and a character she upgraded is swapped out
- **WHEN** the swap happens
- **THEN** that character loses the ATK 300 buff

#### Scenario: Her skill's cast takes every ascension buff off

- **WHEN** Nicole casts her skill
- **THEN** every ATK 300 ascension buff is removed before her skill's own buffs land

#### Scenario: Below the first ascension nothing applies

- **GIVEN** Nicole is below ascension 1
- **WHEN** a character is swapped in
- **THEN** no ascension buff applies

### Requirement: Nicole's fourth ascension

Her fourth ascension SHALL give her the same ATK 300 buff for eight seconds on each elemental hit of the active character, bounded by her skill's buff.

#### Scenario: Her fourth ascension buffs her on each elemental hit

- **GIVEN** Nicole is at least ascension 4 and her skill's buff stands on her
- **WHEN** the active character lands an elemental hit
- **THEN** she gains ATK 300 for eight seconds, or for her skill's remaining time when that is shorter

#### Scenario: A physical hit gives the fourth ascension nothing

- **GIVEN** Nicole is at least ascension 4
- **WHEN** the active character lands a physical hit
- **THEN** she gains no ascension buff

### Requirement: Nicole's first constellation

Her first constellation SHALL project each hit of the active character at six times the hit's damage, 30 frames after the hit, on a 6-second cooldown of its own.

#### Scenario: A hit of the active character is projected at six times

- **GIVEN** Nicole is at least constellation 1
- **WHEN** the active character lands a hit on an enemy
- **THEN** 30 frames later the enemy takes a projected hit at six times the multiplier

#### Scenario: A physical hit is projected too

- **GIVEN** Nicole is at least constellation 1
- **WHEN** the active character lands a physical hit
- **THEN** the projection still lands, dealt at the character's element

#### Scenario: The projections cool for six seconds

- **GIVEN** a projection has just been made
- **WHEN** another hit of the active character lands within six seconds
- **THEN** that hit makes no projection

#### Scenario: Only the active character's hits project

- **GIVEN** Nicole is at least constellation 1
- **WHEN** a character other than the active one lands a hit
- **THEN** no projection lands

#### Scenario: Below the first constellation nothing projects

- **GIVEN** Nicole is constellation 0
- **WHEN** the active character lands a hit
- **THEN** no projection lands

### Requirement: Nicole's second constellation gives the team ATK

Her second constellation SHALL give each deployed member ATK 300 with her skill.

#### Scenario: Her skill gives the team ATK 300 with it

- **GIVEN** Nicole is at least constellation 2
- **WHEN** she casts her skill
- **THEN** each deployed member gains ATK 300 for 20 seconds from the skill's snapshot

#### Scenario: Her next cast takes the team buff off

- **GIVEN** the team holds the second constellation's ATK 300 buff
- **WHEN** she casts her skill again
- **THEN** that buff is removed before her skill's own buffs land

#### Scenario: Below the second constellation nothing applies

- **GIVEN** Nicole is constellation 1
- **WHEN** she casts her skill
- **THEN** no ATK 300 constellation buff applies

### Requirement: Nicole's second constellation lowers RES

Her second constellation SHALL, while an upgraded character's buff stands, lower the RES of that character's element by a quarter on each enemy within 10 metres of the team.

#### Scenario: An upgraded character lowers RES within 10 metres

- **GIVEN** a character holds her first ascension's buff
- **WHEN** an enemy stands within 10 metres of the team
- **THEN** that enemy's RES for the upgraded character's element is lowered by a quarter, for as long as the upgrade lasts

#### Scenario: An enemy beyond 10 metres is left alone

- **GIVEN** a character holds her first ascension's buff
- **WHEN** an enemy stands beyond 10 metres of the team
- **THEN** that enemy's RES is not lowered

#### Scenario: Without an upgraded buff nothing lowers RES

- **GIVEN** Nicole is at least constellation 2 and no character holds her first ascension's buff
- **WHEN** an enemy stands within 10 metres of the team
- **THEN** no RES is lowered

### Requirement: Nicole's fourth constellation hit bonus

Her fourth constellation SHALL give an upgraded character 0.7 of Nicole's attack in flat base damage on each of its normal, charged, plunging, skill or burst hits, for eight hits.

#### Scenario: An upgraded character's hit gains 0.7 of her attack

- **GIVEN** Nicole is at least constellation 4 and a character holds her first ascension's buff
- **WHEN** that character lands a normal, charged, plunging, skill or burst hit
- **THEN** the hit's flat base damage gains 0.7 of Nicole's attack, and one of the character's eight stacks is spent

#### Scenario: Her own hit gains the same bonus

- **GIVEN** Nicole is at least constellation 4 and holds her first ascension's buff
- **WHEN** she lands a hit of the same attack kinds
- **THEN** her hit's flat base damage gains 0.7 of her attack, from the same stacks

#### Scenario: A projection gains nothing and spends no stack

- **GIVEN** an upgraded character holds stacks
- **WHEN** a projection of its hit lands
- **THEN** the projection's damage gains no bonus and no stack is spent

#### Scenario: Below the fourth constellation nothing applies

- **GIVEN** Nicole is below constellation 4
- **WHEN** an upgraded character lands a hit
- **THEN** its flat base damage gains nothing

### Requirement: Nicole's fourth constellation stack refresh

An upgrade SHALL give the upgraded character its eight stacks again only once its 16-second cooldown has run out.

#### Scenario: An upgrade within the cooldown gives no fresh stacks

- **GIVEN** an upgraded character has spent some of its stacks less than 16 seconds ago
- **WHEN** it is upgraded again
- **THEN** it keeps the stacks it has left

### Requirement: Nicole's sixth constellation ignores defence

Her sixth constellation SHALL ignore 40% of the defence an upgraded character's hit is dealt against, her own hits and the team's.

#### Scenario: An upgraded character's hit ignores 40% of defence

- **GIVEN** Nicole is at least constellation 6 and a character holds her first ascension's buff
- **WHEN** that character lands a hit
- **THEN** 40% of the enemy's defence is ignored on the hit

#### Scenario: Her own upgraded hit ignores the same

- **GIVEN** Nicole is at least constellation 6 and holds her first ascension's buff
- **WHEN** she lands a hit
- **THEN** 40% of the enemy's defence is ignored on it

### Requirement: Nicole's sixth constellation holds her upgrades

Her sixth constellation SHALL hold her upgrades for as long as her skill's buff stands, her own and each one she gives the team.

#### Scenario: Her fourth ascension holds for her skill's remaining time

- **GIVEN** Nicole is at least constellation 6 and holds her fourth ascension's buff
- **WHEN** its eight seconds would run out while her skill's buff still stands
- **THEN** her buff stays for as long as her skill's buff does

#### Scenario: Her upgrade gives each other member the same buff

- **GIVEN** Nicole is at least constellation 6
- **WHEN** she is upgraded
- **THEN** each other deployed member is upgraded too, for as long as her skill's buff stands

#### Scenario: A swap away keeps the buff on the character it leaves

- **GIVEN** Nicole is at least constellation 6 and a character holds her first ascension's buff
- **WHEN** she swaps away from that character
- **THEN** the character keeps the buff

## Open

- [ ] **Nicole's plunge collision and hits land on the enemies within reach** — no source yet: gcsim's nicole package has no plunge frames or hitbox, and no Nicole plunge recording is in the parity captures.
