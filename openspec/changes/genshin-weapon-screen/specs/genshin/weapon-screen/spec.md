## ADDED Requirements

### Requirement: Weapon Screen Shows A Held Weapon

The weapon screen SHALL open on a weapon the player holds and show its name, rarity, level, EXP towards the next level, ascension phase and refinement rank.

#### Scenario: the weapon screen opens on a held weapon

- **GIVEN** a player holding a three-star weapon at level 1
- **WHEN** the player opens the weapon screen on that weapon
- **THEN** the screen shows its name, its rarity, its level, its EXP towards the next level, its phase and its refinement rank

### Requirement: Enhance Spends Ores And Fodder

Enhance SHALL level the weapon with the enhancement ores and fodder weapons the player picks, spending the Mora their EXP costs, as the weapon enhancement's levelling rules do.

#### Scenario: Enhance applies the chosen ores and fodder

- **GIVEN** a player holding an ore and a fodder weapon, and enough Mora for their EXP
- **WHEN** the player picks them and presses Enhance
- **THEN** the weapon's level rises by the levels the EXP covers, the ore and the fodder weapon leave the bag, and the Mora is spent

#### Scenario: Enhance is refused when the wallet is short of Mora

- **GIVEN** a player holding too little Mora for the EXP picked
- **WHEN** the player presses Enhance
- **THEN** the weapon, the bag and the wallet stay as they were

### Requirement: Ascend At The Level Cap Only

Ascend SHALL be offered only while the weapon is at its phase's level cap, and SHALL raise it to the next phase by spending that phase's Mora and items once the player's Adventure Rank allows it.

#### Scenario: Ascend is offered only at the level cap

- **GIVEN** a weapon below its phase's level cap
- **WHEN** the weapon screen shows its actions
- **THEN** Ascend is not offered

#### Scenario: Ascend spends the phase's Mora and items

- **GIVEN** a weapon at its phase's level cap, a player whose Adventure Rank allows the next phase, and the Mora and items it costs
- **WHEN** the player presses Ascend
- **THEN** the weapon moves to the next phase and the Mora and items are spent

#### Scenario: Ascend is refused below the Adventure Rank

- **GIVEN** a weapon at its phase's level cap and a player whose Adventure Rank is below the phase's requirement
- **WHEN** the player presses Ascend
- **THEN** the weapon stays in its phase and nothing is spent

### Requirement: Refine Adds Ranks To Five

Refine SHALL add one refinement rank by spending a copy or a refinement material and the Mora that rank costs, up to rank five, and SHALL NOT be offered for a one- or two-star weapon.

#### Scenario: Refine adds a rank for a copy and the rank's Mora

- **GIVEN** a three-star weapon at rank one, a copy of it in the bag, and the Mora that rank two costs
- **WHEN** the player presses Refine and chooses the copy
- **THEN** the weapon is at rank two, the copy leaves the bag, and the Mora is spent

#### Scenario: Refine is not offered at rank five

- **GIVEN** a three-star weapon at rank five
- **WHEN** the weapon screen shows its actions
- **THEN** Refine is not offered

#### Scenario: Refine is not offered for a two-star weapon

- **GIVEN** a two-star weapon
- **WHEN** the weapon screen shows its actions
- **THEN** Refine is not offered

### Requirement: Action Labels In The Game's Words

The weapon screen SHALL name Enhance, Ascend and Refine in the game's own words for the reader's game language.

#### Scenario: the action labels read in the reader's game language

- **GIVEN** a reader whose game language is one of the game's languages
- **WHEN** the weapon screen shows its actions
- **THEN** each action's label is the game's word for it in that language
