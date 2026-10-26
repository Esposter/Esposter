## Purpose

Nahida's kit as built, with her strikes, charged attack, plunges, All Schemes to Know's press and full hold, its Seeds of Skandha marks, Tri-Karma Purification and Illusory Heart's field, and what is left of her Ascension and constellation passives.

## Requirements

### Requirement: Nahida's strikes and charged attack

Nahida's four strikes and charged attack SHALL land on the enemies within reach, dealing Dendro damage.

#### Scenario: Four strikes in sequence

- **WHEN** the player uses normal attack four times in a row
- **THEN** the four strikes land in order on the enemies within reach

#### Scenario: Charged attack lands

- **WHEN** the player uses the charged attack
- **THEN** its hit lands on the enemies within reach

### Requirement: Nahida's plunge attacks

Nahida's collision and two plunges SHALL land on the enemies within reach, with timing and poise provisional.

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the collision and the plunge hits land on the enemies within reach

### Requirement: All Schemes to Know's press and full hold

All Schemes to Know's press SHALL strike the enemies within reach as Dendro, and holding it for the full 300 frames SHALL release its full hold, while a shorter hold SHALL release the press (provisional: the record's five-second minimum is Unsourced, see the design). Each enemy a press or a full hold strikes SHALL gain Seeds of Skandha, as the Requirement below sets out.

#### Scenario: Press strikes the enemies in reach

- **WHEN** the player presses All Schemes to Know
- **THEN** the press strikes the enemies within its reach as Dendro

#### Scenario: Full hold releases the full hold

- **WHEN** the player holds All Schemes to Know for 300 frames and releases it
- **THEN** the full hold strikes the enemies within its reach

#### Scenario: Short hold releases the press

- **WHEN** the player holds All Schemes to Know for less than the full hold and releases it
- **THEN** the press plays instead

### Requirement: Seeds of Skandha marks up to eight enemies per cast

Each enemy All Schemes to Know's press or full hold strikes SHALL gain Seeds of Skandha for 25 seconds, and a cast SHALL mark at most eight enemies, counting an enemy already marked.

#### Scenario: A cast marks the enemies it strikes

- **WHEN** the player presses All Schemes to Know and it strikes two enemies
- **THEN** both enemies carry Seeds of Skandha for 25 seconds

#### Scenario: A cast marks at most eight enemies

- **GIVEN** nine enemies in reach of All Schemes to Know
- **WHEN** the player presses All Schemes to Know
- **THEN** eight of them carry Seeds of Skandha

#### Scenario: A new mark restarts the seconds

- **GIVEN** an enemy carries Seeds of Skandha with ten seconds left
- **WHEN** a new cast of All Schemes to Know strikes it
- **THEN** it carries Seeds of Skandha for 25 seconds again

### Requirement: Tri-Karma Purification strikes marked enemies on a reaction

A reaction on an enemy carrying Seeds of Skandha SHALL set off Tri-Karma Purification, which SHALL strike every enemy carrying Seeds of Skandha, whichever character is on the field, and which SHALL NOT strike again within the interval set by its clock.

#### Scenario: A reaction on a marked enemy strikes every marked enemy

- **GIVEN** two enemies carry Seeds of Skandha
- **WHEN** a reaction triggers on one of them
- **THEN** Tri-Karma Purification strikes both enemies

#### Scenario: A reaction on an unmarked enemy strikes nothing

- **WHEN** a reaction triggers on an enemy with no Seeds of Skandha
- **THEN** Tri-Karma Purification does not strike

#### Scenario: The clock holds the next strike

- **GIVEN** Tri-Karma Purification has just struck
- **WHEN** a second reaction on a marked enemy triggers before 2.5 seconds have passed
- **THEN** Tri-Karma Purification does not strike again

#### Scenario: The Electro count shortens the interval inside Illusory Heart

- **GIVEN** Illusory Heart's window is open and one Electro character is on the team
- **WHEN** a reaction triggers on a marked enemy
- **THEN** the clock holds for 2.5 seconds less the Electro cut at the burst's level

### Requirement: Tri-Karma Purification's damage

Each Tri-Karma Purification strike SHALL deal Dendro damage from Nahida's ATK and Elemental Mastery, with a Pyro bonus while Illusory Heart's window is open, and the first strike of a trigger SHALL give three Dendro particles, once every seven seconds.

#### Scenario: Strike scales on ATK and Elemental Mastery

- **WHEN** Tri-Karma Purification strikes an enemy
- **THEN** its damage adds Nahida's Elemental Mastery times the skill's Elemental Mastery multiplier to its ATK multiplier's damage

#### Scenario: Pyro count adds damage inside Illusory Heart

- **GIVEN** Illusory Heart's window is open and one Pyro character is on the team
- **WHEN** Tri-Karma Purification strikes an enemy
- **THEN** its damage gains the burst's Pyro bonus at its level

#### Scenario: Particles come once every seven seconds

- **WHEN** Tri-Karma Purification strikes twice within seven seconds
- **THEN** only the first strike gives Dendro particles

### Requirement: Illusory Heart's field

Nahida's burst SHALL cast a field of radius 20 metres, centred one metre ahead of her, lasting 15 seconds plus the Hydro count's extension at the burst's level, whose ticks open a one-second window for Tri-Karma Purification while Nahida's body stands inside it.

#### Scenario: The field lasts 15 seconds without a Hydro character

- **GIVEN** Nahida has no Constellation 1
- **WHEN** the player casts the burst with no Hydro character on the team
- **THEN** the field lasts 15 seconds

#### Scenario: The Hydro count extends the field

- **WHEN** the player casts the burst with one Hydro character on the team
- **THEN** the field lasts 15 seconds plus the burst's Hydro extension at its level

#### Scenario: A tick inside the field opens the window

- **WHEN** the field ticks while Nahida stands inside it
- **THEN** Tri-Karma Purification's Pyro bonus and Electro cut apply for one second

### Requirement: Constellation 1's Shrine tally

From Constellation 1, the Pyro, Hydro and Electro counts SHALL each be one higher before they are clamped at two, so each count's first row of the burst's tables applies with no character of that element on the team.

#### Scenario: Constellation 1 extends the field with no Hydro character

- **GIVEN** Nahida has Constellation 1 and no Hydro character is on the team
- **WHEN** the player casts the burst
- **THEN** the field lasts 15 seconds plus the burst's Hydro extension at its first row

#### Scenario: Constellation 1 applies the Electro cut with no Electro character

- **GIVEN** Nahida has Constellation 1, no Electro character is on the team, and the field's window is open
- **WHEN** Tri-Karma Purification is triggered
- **THEN** the interval is cut by the Electro cut at its first row

### Requirement: Constellation 2's defence reduction and Lunar-Bloom CRIT

From Constellation 2, a Quicken, Aggravate or Spread on an enemy Nahida has marked SHALL reduce that enemy's DEF by 30% for eight seconds, and another member's direct Lunar-Bloom hit on a marked enemy SHALL gain 10% CRIT Rate and 20% CRIT DMG.

#### Scenario: A defence-reducing reaction lowers the marked enemy's DEF

- **GIVEN** Nahida has Constellation 2 and an enemy carries her marks
- **WHEN** a Quicken, Aggravate or Spread lands on that enemy
- **THEN** the enemy's DEF is reduced by 30% for eight seconds

#### Scenario: A reaction on an unmarked enemy lowers nothing

- **GIVEN** Nahida has Constellation 2 and an enemy carries no mark
- **WHEN** a Quicken lands on it
- **THEN** no DEF is reduced

#### Scenario: A party member's Lunar-Bloom hit gains CRIT on a marked enemy

- **GIVEN** Nahida has Constellation 2 and an enemy carries her marks
- **WHEN** another party member's direct Lunar-Bloom hit lands on that enemy
- **THEN** the hit gains 10% CRIT Rate and 20% CRIT DMG

#### Scenario: Below Constellation 2 nothing applies

- **GIVEN** Nahida has Constellation 1 and an enemy carries her marks
- **WHEN** a Quicken lands on it
- **THEN** no DEF is reduced

### Requirement: Constellation 4's Elemental Mastery from marked enemies

From Constellation 4, Nahida's Elemental Mastery SHALL rise by 80 plus 20 for each marked enemy within 30 metres of her, up to four, so by 100 with one and 160 with four, and SHALL rise by nothing with none.

#### Scenario: One marked enemy in reach adds 100 Elemental Mastery

- **GIVEN** Nahida has Constellation 4 and one enemy within 30 metres carries her marks
- **WHEN** her Elemental Mastery is priced
- **THEN** it is 100 higher

#### Scenario: Four marked enemies in reach add 160 Elemental Mastery

- **GIVEN** Nahida has Constellation 4 and four or more enemies within 30 metres carry her marks
- **WHEN** her Elemental Mastery is priced
- **THEN** it is 160 higher

#### Scenario: No marked enemy in reach adds nothing

- **GIVEN** Nahida has Constellation 4 and no marked enemy is within 30 metres
- **WHEN** her Elemental Mastery is priced
- **THEN** nothing is added

### Requirement: Constellation 6's Karmic Oblivion

From Constellation 6, for ten seconds after Illusory Heart is unleashed, a normal or charged attack's hit on a marked enemy SHALL strike every marked enemy with Karmic Oblivion, dealt as Elemental Skill DMG at 200% of Nahida's ATK and 400% of her Elemental Mastery. Karmic Oblivion SHALL strike at most six times, and no more than once in 0.2 seconds.

#### Scenario: A marked hit strikes every marked enemy

- **GIVEN** Nahida has Constellation 6 and has unleashed Illusory Heart
- **WHEN** her normal attack hits a marked enemy
- **THEN** Karmic Oblivion strikes every marked enemy

#### Scenario: Karmic Oblivion waits 0.2 seconds between instances

- **GIVEN** Karmic Oblivion has just struck
- **WHEN** a normal or charged attack hits a marked enemy within 0.2 seconds
- **THEN** nothing more is struck

#### Scenario: Karmic Oblivion stops after six instances

- **GIVEN** Karmic Oblivion has struck six times in the ten seconds
- **WHEN** a charged attack hits a marked enemy
- **THEN** nothing more is struck

#### Scenario: Nothing before Illusory Heart is unleashed

- **GIVEN** Nahida has Constellation 6 and has not unleashed Illusory Heart
- **WHEN** her normal attack hits a marked enemy
- **THEN** nothing is struck

### Requirement: Unbuilt Nahida effects

Nahida's Ascension passives and Constellation 2's CRIT on the reactions of a marked enemy SHALL NOT take effect.

#### Scenario: Unbuilt effects do nothing

- **GIVEN** Nahida has an Ascension passive unlocked, or Constellation 2 and a reaction on a marked enemy
- **WHEN** the player fights with Nahida
- **THEN** those effects have no effect
