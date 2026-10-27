## Purpose

Iansan's kit as built, with her three strikes, charged attack, provisional plunges, the skill's activation hit and the burst's hit, her skill's press entering the Nightsoul Blessing with its points, her burst's points and restore with Ascension 1's and Ascension 4's, her Stormflight variant, and her constellations 1, 2, 4 and 6.

## Requirements

### Requirement: Three strikes land on their own hits

Iansan's three strikes SHALL each land on their own hit: a fan ahead of her, a circle ahead of her and a box round her.

#### Scenario: Strike chain lands its three hits

- **GIVEN** Iansan is the character on the field
- **WHEN** the player presses the attack button through her three strikes
- **THEN** the first lands 14 frames into a 27-frame animation
- **AND** the second lands 7 frames into a 31-frame animation
- **AND** the third lands 22 frames into a 55-frame animation

### Requirement: Charged attack strikes a small circle

Iansan's charged attack SHALL strike a small circle on the primary target and SHALL cost 25 stamina.

#### Scenario: Charged attack strikes and spends stamina

- **GIVEN** Iansan has at least 25 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the circle strikes the primary target 21 frames into the 55-frame animation
- **AND** 25 stamina is spent

### Requirement: Provisional plunges

Iansan's plunges SHALL use the standard borrowed plunge and stay provisional.

#### Scenario: The plunges stay provisional

- **GIVEN** Iansan's plunges take the standard borrowed plunge
- **WHEN** the kit is read
- **THEN** the plunges stay provisional

### Requirement: Skill's activation hit

Iansan's skill SHALL deal an Electro activation hit on the primary target and SHALL cool for 16 seconds.

#### Scenario: Pressing the skill strikes the activation hit

- **GIVEN** Iansan is the character on the field and the skill is off cooldown
- **WHEN** the player presses the skill
- **THEN** the activation hit lands on the primary target 9 frames into a 137-frame animation
- **AND** it applies 1 unit of Electro gauge
- **AND** the skill cools for 16 seconds

#### Scenario: The skill cannot be pressed during its cooldown

- **GIVEN** the skill is cooling down
- **WHEN** the player presses the skill again
- **THEN** nothing happens

### Requirement: Burst's hit

Iansan's burst SHALL deal an Electro hit in a circle of 5 metres round her body, and SHALL cool for 18 seconds at 70 energy.

#### Scenario: Casting the burst strikes its circle

- **GIVEN** Iansan has 70 energy
- **WHEN** the player casts the burst
- **THEN** the hit lands 38 frames into the 45-frame animation
- **AND** it applies 1 unit of Electro gauge
- **AND** 70 energy is spent
- **AND** the burst cools for 18 seconds

#### Scenario: The burst cannot be cast during its cooldown

- **GIVEN** the burst is cooling down
- **WHEN** the player casts the burst again
- **THEN** nothing happens

### Requirement: Skill press enters the Nightsoul Blessing

Iansan's skill press SHALL enter her Nightsoul Blessing with 54 Nightsoul points, which drain six a second and which lasts 16 seconds, and the blessing SHALL end when its points reach none.

#### Scenario: Press enters the blessing and its points drain

- **WHEN** the player presses Iansan's skill
- **THEN** Iansan is in the Nightsoul Blessing with 54 points
- **AND** her points drop by six a second

#### Scenario: The blessing ends when its points run out

- **GIVEN** Iansan is in the Nightsoul Blessing
- **WHEN** nine seconds pass with no point gained
- **THEN** she is no longer in the blessing

### Requirement: Constellation 1 energy

From Constellation 1, each 6 Nightsoul points her blessing consumes SHALL restore Iansan 15 energy, and then her Constellation 1 cooldown of 18 seconds SHALL start, during which the points consumed SHALL NOT count toward the next 6.

#### Scenario: Six points restore energy

- **GIVEN** Iansan has Constellation 1 and is in the Nightsoul Blessing
- **WHEN** six points are consumed
- **THEN** she gains 15 energy

#### Scenario: Points consumed during the cooldown do not count

- **GIVEN** Iansan's Constellation 1 cooldown is running
- **WHEN** her blessing consumes points
- **THEN** no energy is gained until the cooldown ends

#### Scenario: Constellation 0 gains nothing

- **GIVEN** Iansan has no constellation
- **WHEN** her blessing consumes six points
- **THEN** she gains no energy

### Requirement: Burst's points and restore

Iansan's burst SHALL gain 15 Nightsoul points 40 frames after the press, entering a 16-second blessing if she holds none, and SHALL restore a point a second for the 12 seconds the burst lasts (15 from Constellation 6), for as long as the blessing it lands in holds, and not once that blessing has exited, even if she enters another.

#### Scenario: Burst enters a blessing

- **GIVEN** Iansan holds no blessing
- **WHEN** she casts her burst and 0.67 seconds pass
- **THEN** her blessing holds 15 points

#### Scenario: The restore stops when the blessing ends

- **GIVEN** the blessing her burst landed in has run out of points
- **WHEN** another second passes
- **THEN** the burst's restore gives her no points

#### Scenario: A blessing entered again does not resume the restore

- **GIVEN** the blessing her burst landed in has run out of points
- **AND** she enters a new blessing within the burst's 12 seconds and Precise Movement is up again
- **WHEN** another second passes
- **THEN** the burst's restore gives her no points

### Requirement: Ascension 1's points

From Ascension 1, while Precise Movement lasts, Iansan's burst restore SHALL give a point each second, and SHALL give 4 once after she gains or consumes points on the field, with at most one such arming every 2.8 seconds.

#### Scenario: Gained points arm the four

- **GIVEN** Iansan is at Ascension 1 with Precise Movement and her burst's points are gained
- **WHEN** the next second's restore falls
- **THEN** it gives her 4 points

#### Scenario: Below Ascension 1 the restore gives nothing

- **GIVEN** Iansan is at Ascension 0
- **WHEN** the burst's restore falls
- **THEN** it gives her no points

### Requirement: Ascension 4's Warming Up heals on her restore

From Ascension 4, a nearby party member's Nightsoul burst SHALL give Iansan Warming Up for 10 seconds. While it lasts, each restore of at least one Nightsoul point SHALL heal the active character for 60% of Iansan's ATK, and the heal SHALL wait 2.8 seconds after each heal. Below Ascension 4 a burst SHALL give her nothing.

#### Scenario: The restore heals the active character for 60% of her ATK

- **GIVEN** Iansan is at Ascension 4 with Warming Up up
- **WHEN** her burst's restore gives her points
- **THEN** the active character heals for 60% of her current ATK

#### Scenario: The heal waits 2.8 seconds after each heal

- **GIVEN** Iansan has just healed the active character with Warming Up
- **WHEN** a further restore falls within 2.8 seconds
- **THEN** it heals nothing

#### Scenario: Warming Up lasts 10 seconds

- **GIVEN** a nearby party member's Nightsoul burst gives Iansan Warming Up
- **WHEN** 10 seconds pass
- **THEN** Warming Up is gone, and a restore heals nothing

#### Scenario: Below Ascension 4 a burst gives no Warming Up

- **GIVEN** Iansan is at Ascension 3
- **WHEN** a Nightsoul burst goes off
- **THEN** she gains no Warming Up

### Requirement: Constellation 2 party ATK

From Constellation 2, Iansan's burst SHALL give her Precise Movement at Ascension 1, and while Precise Movement lasts every other deployed member SHALL have 30% ATK, which ends when her blessing exits.

#### Scenario: Burst gives Precise Movement and the party its ATK

- **GIVEN** Iansan is at Constellation 2 and Ascension 1 on the field
- **WHEN** she casts her burst
- **THEN** she carries Precise Movement
- **AND** each other deployed member has 30% ATK

#### Scenario: The party ATK ends with the blessing

- **GIVEN** the other members have Iansan's party ATK
- **WHEN** her blessing exits
- **THEN** they lose it

#### Scenario: Below Constellation 2 nothing is given

- **GIVEN** Iansan is at Constellation 1
- **WHEN** she casts her burst
- **THEN** no member gains ATK from her

### Requirement: Constellation 4 Surging Force

From Constellation 4, another member's burst while Iansan's restore runs and she is off the field SHALL give her two Surging Force stacks, once per burst of hers. Each stack SHALL add 4 points to a restore tick, and half the overflow of the previous tick SHALL add to the next.

#### Scenario: Another burst gives two stacks once

- **GIVEN** Iansan's restore is running and she is off the field at Constellation 4
- **WHEN** another member casts a burst
- **THEN** she gains two Surging Force stacks
- **AND** a second burst during the same restore gives none

#### Scenario: A stack adds four points to a restore tick

- **GIVEN** Iansan holds a Surging Force stack
- **WHEN** her restore ticks
- **THEN** the tick gives her 4 more points
- **AND** the stack is spent

#### Scenario: Overflow adds half to the next tick

- **GIVEN** a restore tick overflowed her maximum by 4 points
- **WHEN** the next restore tick falls
- **THEN** it gives her 2 more points

### Requirement: Constellation 6 Extreme Force

From Constellation 6, Iansan's burst restore SHALL run for 15 seconds, and each restore tick that overflows her maximum SHALL give the active character 25% DMG Bonus for 3 seconds.

#### Scenario: The restore runs for 15 seconds

- **GIVEN** Iansan is at Constellation 6
- **WHEN** she casts her burst
- **THEN** her restore runs for 15 seconds

#### Scenario: An overflowing tick gives the active character DMG Bonus

- **GIVEN** a restore tick overflows her maximum
- **WHEN** the tick lands
- **THEN** the active character has 25% DMG Bonus for 3 seconds
