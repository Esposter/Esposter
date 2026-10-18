## Purpose

The characters, skills and action cards the built decks play, each as a module under the engine's card hooks, and the opponent decks and the words a duel shows. A card's behaviour and its reasons, with its sources.

## Requirements

### Requirement: A named skill deals its stated damage in the element its name spells

A skill whose effect is named by its damage SHALL deal the stated amount of the element the name spells, and the monsters' Electro SHALL count as Electro.

#### Scenario: Physical damage named by its element

- **GIVEN** a skill's effect names a Physical damage of a stated amount
- **WHEN** the skill is used
- **THEN** that amount of Physical damage is dealt

#### Scenario: Monster's Electro damage is Electro

- **GIVEN** a monster's skill names its damage as Elec
- **WHEN** the skill is used
- **THEN** the damage is Electro

### Requirement: A skill's damage passes the field's bonuses before any doubling

A skill's damage SHALL pass every additive bonus on the field before any doubling is applied.

#### Scenario: Doubling applies after the field's bonus

- **GIVEN** a field card adds a bonus and another card doubles damage
- **WHEN** a skill deals damage
- **THEN** the bonus is added first and the doubling applies to the total

### Requirement: A card's bonus applies only to the skills it names

A card's damage bonus SHALL apply only to the skills it names, such as the next Normal Attack alone.

#### Scenario: Bonus applies to the next Normal Attack only

- **GIVEN** a card gives one damage more to the next Normal Attack
- **WHEN** the character uses a skill that is not a Normal Attack
- **THEN** the bonus is not added

### Requirement: A card in hand is placed by its kind

A card played from a hand SHALL be placed by its kind: equipment is equipped to its target, a support takes the support zone, and an event is played and then gone.

#### Scenario: Equipment is equipped to its target

- **GIVEN** a player holds an equipment card and its target is standing
- **WHEN** the player plays the card
- **THEN** the equipment is equipped to its target

#### Scenario: Support takes the support zone

- **GIVEN** a player holds a support card and the support zone has room
- **WHEN** the player plays the card
- **THEN** the support takes its place in the zone

#### Scenario: Event is gone once played

- **GIVEN** a player holds an event card
- **WHEN** the player plays the card
- **THEN** the event takes effect and leaves the field

### Requirement: The field holds no more than its cards' limits

The field SHALL hold at most sixteen dice, four supports, and one equipment of each kind per character.

#### Scenario: Fifth support does not join the field

- **GIVEN** four supports already stand on a side
- **WHEN** a card would add a fifth support
- **THEN** the side still holds four supports

### Requirement: A card a skill creates does not trigger on the use that created it

A card that a skill creates SHALL NOT trigger on the use that created it, and SHALL trigger on the next skill.

#### Scenario: Created card waits for the next skill

- **GIVEN** a skill creates a card on the field
- **WHEN** the skill that created it finishes
- **THEN** the created card does not deal its damage on that use

### Requirement: A passive acts after each skill its character uses

A passive's hooks SHALL run after each skill its character uses, and a switch the passive makes SHALL happen after the skill.

#### Scenario: Passive switches the next character after a skill

- **GIVEN** a passive switches the next standing character in after a skill
- **WHEN** its character uses the skill
- **THEN** the next standing character is switched in after the skill

### Requirement: A passive's starting status is given when the battle begins

A passive's starting status SHALL be given when its side is created at the start of the battle.

#### Scenario: Flowfire Edge converts Physical damage for three usages

- **GIVEN** a battle begins with a character holding the Flowfire Edge passive
- **WHEN** the side is created
- **THEN** the character's Physical damage is converted to Pyro for three usages

### Requirement: Guaranteed dice are set when the dice are rolled

Guaranteed dice SHALL be set when the dice are rolled, and a reroll MAY still throw them.

#### Scenario: Guaranteed dice are set at the first roll

- **GIVEN** a character's passive guarantees two dice
- **WHEN** the dice are rolled
- **THEN** the two guaranteed dice are set

### Requirement: The Oceanic Mimics are summoned by the kind fewest on the field

The Oceanic Mimics SHALL be summoned as the kind the side holds fewest of, the earliest kind winning a tie.

#### Scenario: Fewest kind is summoned

- **GIVEN** a side holds more copies of one Mimic kind than of another
- **WHEN** Mimics are summoned
- **THEN** the kind it holds fewest of is summoned

### Requirement: A character eats one food a round

A character SHALL eat no more than one food a round, and a second food in the same round SHALL be refused.

#### Scenario: Second food in a round is refused

- **GIVEN** a character has eaten a food this round
- **WHEN** the player tries to give it another food
- **THEN** the second food is refused

### Requirement: Opponent decks are legal decks

An opponent deck SHALL be legal, meaning every talent card it holds has its character in the same deck.

#### Scenario: Deck with a talent but no character is not legal

- **GIVEN** a deck holds a talent card whose character is not in the deck
- **WHEN** the deck is checked
- **THEN** the deck is not legal and is not played

### Requirement: Card and character words come from the game's text by id

A card's and a character's name and description SHALL be shown in the game's words, looked up by the text id each carries.

#### Scenario: Character with no description text shows none

- **GIVEN** a character's description id names no text in any language
- **WHEN** the character is shown
- **THEN** no description is shown for that character

### Requirement: Ellin's deck holds no cards and gives its side two statuses

Ellin's opponent deck SHALL hold no cards and SHALL give its side only the two statuses its passives give at the start of the battle.

#### Scenario: Ellin's side starts with its two statuses

- **GIVEN** Ellin's deck is played in a duel
- **WHEN** the battle begins
- **THEN** its side starts with the Flowfire Edge and Elemental Lifeform statuses and no cards
