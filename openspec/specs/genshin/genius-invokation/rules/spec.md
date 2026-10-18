## Purpose

The card game's rules engine, a duel's dice, rounds and turns, the reactions and the damage that settles a hit, played through the engine's public functions. Each rule sits with the reason it was chosen and its source.

## Requirements

### Requirement: Each side switches once before choosing its active character

Each side SHALL switch its cards once during preparation, and the first round SHALL start once both sides have chosen their active characters.

#### Scenario: Preparation ends when both sides have chosen

- **GIVEN** both sides have drawn their hands
- **WHEN** each side has switched once and chosen its active character
- **THEN** the first round's roll starts

### Requirement: Each side rolls eight dice a round and may reroll once

Each side SHALL roll eight dice each round and MAY reroll any dice it names once, and naming no dice SHALL pass the reroll.

#### Scenario: Naming no dice passes the reroll

- **GIVEN** a side has rolled its dice
- **WHEN** the side names no dice to reroll
- **THEN** the reroll passes and the dice stay

#### Scenario: Naming dice rerolls only those dice

- **GIVEN** a side has rolled its dice
- **WHEN** the side names some dice to reroll
- **THEN** only the named dice are rerolled

### Requirement: A combat action passes the turn unless the other side has declared its end

A combat action SHALL pass the turn to the other side unless that side has already declared the round's end.

#### Scenario: Using a skill passes the turn

- **GIVEN** it is a side's turn and the other side has not declared its end
- **WHEN** the side uses a skill
- **THEN** the turn passes to the other side

#### Scenario: Tuning keeps the turn

- **GIVEN** it is a side's turn
- **WHEN** the side tunes a die by discarding a card
- **THEN** the turn stays with the side

#### Scenario: Playing a card passes no turn

- **GIVEN** it is a side's turn
- **WHEN** the side plays a card
- **THEN** the turn stays with the side

### Requirement: A refused action leaves the duel as it was

A refused action SHALL leave the duel unchanged and SHALL say why it was refused.

#### Scenario: Skill the character cannot pay for is refused

- **GIVEN** a character lacks the energy its burst costs
- **WHEN** the player uses the burst
- **THEN** the action is refused, the dice it would have paid stay in the dice, and the refusal says why

### Requirement: A switch costs one die, less any reduction from the field

A switch SHALL cost one die of any face, less any reduction the field's cards give to switches.

#### Scenario: Switch with a field reduction may cost no die

- **GIVEN** a field card reduces the cost of a switch by one die
- **WHEN** the side switches
- **THEN** the switch costs no die

#### Scenario: Leave It to Me makes the next switch fast

- **GIVEN** a side has played Leave It to Me
- **WHEN** the side next switches
- **THEN** the switch is a fast action and the card is spent

### Requirement: A defeated active character is replaced by a free action

A side SHALL replace its defeated active character by a free action, and only that side's turn actions SHALL wait on the replacement.

#### Scenario: Replacement is free and does not pass the turn

- **GIVEN** a side's active character is defeated
- **WHEN** the side chooses a replacement
- **THEN** the replacement costs no dice and the turn does not pass

### Requirement: The round's end gives the first side and the draws

The side that declares the round's end first SHALL go first in the next round, and each side SHALL draw two cards, a draw past the hand's limit being discarded.

#### Scenario: First declarer goes first next round

- **GIVEN** both sides declare the round's end
- **WHEN** the next round begins
- **THEN** the side that declared first goes first

#### Scenario: Draw past the hand limit is discarded

- **GIVEN** a side's hand is at its limit
- **WHEN** the side draws at the round's end
- **THEN** the drawn card is discarded

#### Scenario: Frozen lapses at the end phase

- **GIVEN** a character is frozen
- **WHEN** the end phase runs
- **THEN** the frozen status lapses

### Requirement: A duel ends with no winner after its fifteenth round

A duel SHALL end with no winner once the fifteenth round's end phase has closed.

#### Scenario: Duel concedes after the fifteenth round

- **GIVEN** the fifteenth round's end phase has closed
- **WHEN** the next step is due
- **THEN** both sides concede with no winner

### Requirement: A normal attack and an elemental skill gain energy, a burst pays it

A normal attack or an elemental skill SHALL gain its character one energy, and a burst SHALL pay the energy its cost names.

#### Scenario: Elemental skill gains one energy

- **GIVEN** a character uses an elemental skill
- **WHEN** the skill resolves
- **THEN** the character gains one energy

#### Scenario: Burst with too little energy is refused

- **GIVEN** a character has less energy than its burst costs
- **WHEN** the player uses the burst
- **THEN** the burst is refused

### Requirement: Elements apply an aura and Anemo and Geo set none

Cryo, Hydro, Pyro, Electro and Dendro damage SHALL set its aura on the target, and Anemo and Geo damage SHALL set no aura.

#### Scenario: Pyro sets the aura

- **GIVEN** the target has no aura
- **WHEN** Pyro damage hits it
- **THEN** the target gains a Pyro aura

#### Scenario: Anemo sets no aura

- **GIVEN** the target has no aura
- **WHEN** Anemo damage hits it
- **THEN** the target gains no aura

### Requirement: A reaction adds its bonus to the hit, and Swirl adds none

A reaction SHALL add its bonus to the hit that makes it, and Swirl SHALL add no bonus.

#### Scenario: Melt adds two to the hit

- **GIVEN** a hit makes a Melt reaction
- **WHEN** the reaction resolves
- **THEN** two is added to the hit

#### Scenario: Swirl adds no bonus

- **GIVEN** a hit makes a Swirl reaction
- **WHEN** the reaction resolves
- **THEN** no bonus is added to the hit

### Requirement: A reaction summons its card on the attacker's side

A reaction SHALL summon its card on the attacker's side, and a second reaction of the same kind SHALL add a usage to the card already there, up to its usage limit, rather than a second copy.

#### Scenario: Second reaction joins the existing card

- **GIVEN** a Burning Flame card is already on the attacker's side
- **WHEN** another Burning reaction is made
- **THEN** the existing card gains a usage and no second copy appears

### Requirement: A frozen target takes extra damage from Pyro or Physical hits

A frozen target SHALL take two more damage from a Pyro or Physical hit, and that hit SHALL remove the frozen status.

#### Scenario: Pyro hit on a frozen target

- **GIVEN** a target is frozen
- **WHEN** a Pyro hit lands on it
- **THEN** two more damage is taken and the frozen status is removed

### Requirement: A shield takes damage before health, and piercing skips it

A shield SHALL take damage before the character's health, and piercing damage SHALL skip the shield.

#### Scenario: Shield absorbs damage first

- **GIVEN** a character has a shield
- **WHEN** a hit lands on it
- **THEN** the shield takes the damage before the character's health

#### Scenario: Piercing skips the shield

- **GIVEN** a character has a shield
- **WHEN** piercing damage lands on it
- **THEN** the shield takes none of the damage

### Requirement: Swirl spreads damage to the other opposing characters without an aura

A Swirl SHALL spread one of its aura's elements to each other opposing character as damage only, setting no aura and reacting with none.

#### Scenario: Swirl spread sets no aura on the others

- **GIVEN** a Swirl reaction is made against a side with other characters standing
- **WHEN** the spread lands
- **THEN** each other opposing character takes the spread as damage and gains no aura

### Requirement: An Overloaded active character is switched to the next standing character

An Overloaded active character SHALL be switched to the next standing character in order, with no choice given to the player.

#### Scenario: Overloaded forces a switch

- **GIVEN** a side's active character is Overloaded
- **WHEN** the reaction resolves
- **THEN** the side switches to the next standing character in order without a choice

### Requirement: A character at no health is cleared and its side owes a replacement or loses

A character at no health SHALL be cleared, and its side SHALL owe a replacement while one of its characters stands and lose the duel once none does.

#### Scenario: Defeated character with a standing ally owes a replacement

- **GIVEN** a side's active character is cleared and another character stands
- **WHEN** the defeat is settled
- **THEN** the side owes a replacement

#### Scenario: Side with no character standing loses

- **GIVEN** a side has no character standing
- **WHEN** the defeat is settled
- **THEN** the side loses the duel
