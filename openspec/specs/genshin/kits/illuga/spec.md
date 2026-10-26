## Purpose

Illuga's kit as built: his four strikes, charged attack, plunges, Press of his skill and burst's two hits, Haunted Night and Nightingale's Song, Torchforger's Covenant's Lightkeeper's Oath, and Constellations 2, 4 and 6, with his skill's Hold not built and his timings provisional.

## Requirements

### Requirement: Four strikes

Illuga's four strikes SHALL play in order from the attack button as his normal attacks.

#### Scenario: Strike chain plays four strikes in order

- **GIVEN** Illuga is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** his four strikes play in order

### Requirement: Charged attack and plunges

Illuga's charged attack and plunges SHALL each deal their own hits.

#### Scenario: Charged attack deals its hits

- **GIVEN** Illuga is the character on the field
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack deals its own hits

#### Scenario: Plunge deals its own hit

- **GIVEN** Illuga is in the air
- **WHEN** the player plunges
- **THEN** the plunge deals its own hit

### Requirement: Skill's Press deals two hits

Pressing Illuga's skill SHALL deal the two hits of its Press.

#### Scenario: Pressing the skill lands the Press

- **GIVEN** Illuga is the character on the field
- **WHEN** the player presses the skill
- **THEN** the two hits of the Press land

#### Scenario: Holding the skill deals only the Press

- **GIVEN** Illuga is the character on the field
- **WHEN** the player holds the skill
- **THEN** the two Press hits land alone
- **AND** no hit of the Hold is dealt

### Requirement: Burst deals two hits

Illuga's burst SHALL deal its two hits.

#### Scenario: Casting the burst lands both hits

- **GIVEN** Illuga is the character on the field
- **WHEN** the player casts the burst
- **THEN** both of its hits land

### Requirement: Haunted Night and Nightingale's Song

Illuga's burst SHALL start Haunted Night's Oriole-Song for twenty seconds with twenty-one stacks of Nightingale's Song. Each Geo hit a nearby active party member lands on an enemy SHALL spend one stack, and that hit SHALL gain Geo DMG of 33.6% of Illuga's Elemental Mastery for the stack it spends. Illuga's own hits SHALL spend no stack and gain no bonus.

#### Scenario: The burst starts Haunted Night

- **GIVEN** Illuga is the character on the field
- **WHEN** the player casts the burst
- **THEN** Haunted Night's Oriole-Song holds for twenty seconds with twenty-one stacks

#### Scenario: A Geo hit by the active member spends a stack and gains the bonus

- **GIVEN** Haunted Night holds and a party member other than Illuga is on the field
- **WHEN** that member's Geo hit lands on an enemy
- **THEN** one stack is spent
- **AND** the hit's base damage gains 33.6% of Illuga's Elemental Mastery

#### Scenario: Illuga's own hit gains nothing

- **GIVEN** Haunted Night holds and Illuga is on the field
- **WHEN** his own Geo hit lands on an enemy
- **THEN** no stack is spent and no bonus applies

### Requirement: Torchforger's Covenant's Lightkeeper's Oath

From ascension 1, Illuga's skill or burst SHALL give each other deployed party member Lightkeeper's Oath for twenty seconds. A member's Geo hits under it SHALL gain 5% CRIT Rate and 10% CRIT DMG, and while the team is Ascendant Gleam, the member SHALL gain 50 Elemental Mastery.

#### Scenario: The burst gives the others the Oath from ascension 1

- **GIVEN** Illuga has ascension 1 and a party member is deployed beside him
- **WHEN** the player casts the burst
- **THEN** the other member carries Lightkeeper's Oath for twenty seconds
- **AND** Illuga carries none

#### Scenario: Below ascension 1 the Oath is not given

- **GIVEN** Illuga has ascension 0
- **WHEN** the player casts the burst
- **THEN** no member carries Lightkeeper's Oath

### Requirement: Constellation 2 summons Aedon's hit

At Constellation 2, for every seven stacks of Nightingale's Song consumed, Illuga SHALL summon one Geo hit of 400% of his Elemental Mastery and 200% of his DEF as Elemental Burst DMG on one nearby opponent.

#### Scenario: Seven stacks consumed summon one hit

- **GIVEN** Illuga has Constellation 2 and Haunted Night holds
- **WHEN** seven stacks are consumed
- **THEN** one Aedon hit is summoned

#### Scenario: Below Constellation 2 nothing is summoned

- **GIVEN** Illuga has Constellation 1
- **WHEN** seven stacks are consumed
- **THEN** no Aedon hit is summoned

### Requirement: Constellation 4 gives the active member DEF

At Constellation 4, while Haunted Night holds, the active party member SHALL gain 200 DEF.

#### Scenario: The active member gains 200 DEF

- **GIVEN** Illuga has Constellation 4 and Haunted Night holds
- **WHEN** a party member other than Illuga is on the field
- **THEN** that member gains 200 DEF

### Requirement: Constellation 6 enhances Lightkeeper's Oath

At Constellation 6, Lightkeeper's Oath SHALL give 10% CRIT Rate and 30% CRIT DMG to Geo hits, and under Ascendant Gleam, 80 Elemental Mastery.

#### Scenario: The enhanced Oath raises the CRIT and the Elemental Mastery

- **GIVEN** Illuga has Constellation 6 and a party member carries Lightkeeper's Oath
- **WHEN** that member's Geo hit is priced
- **THEN** the hit gains 10% CRIT Rate and 30% CRIT DMG

### Requirement: Provisional timings and areas

Illuga's hit timings and areas SHALL stay provisional, borrowed from other characters' attacks, until a recording of his attacks settles them.

#### Scenario: A recording settles the timings

- **GIVEN** a recording of Illuga's attacks exists
- **WHEN** its timings and areas are compared with the kit's
- **THEN** the timings and areas stay provisional until the comparison settles them

## Open

- [ ] **The skill's Press deals two hits** — no source yet: the cached wiki gives the Press DMG row without a hit count.
- [ ] **The burst deals two hits** — no source yet: the cached wiki gives one Skill DMG row without a hit count.
- [ ] **Illuga's own hits spend no stack** — no source yet: the cached wiki's 'nearby active party members' wording does not say whether Illuga counts.
- [ ] **Constellation 4's 200 DEF holds only while Haunted Night holds** — no source yet: the record gives 200 DEF at talent 1274, and the cached wiki gives that note without its text.
- [ ] **Constellation 6's 80 Elemental Mastery applies under Ascendant Gleam** — no source yet: the record gives talent 1276's 80 Elemental Mastery, but no line gives its condition.
