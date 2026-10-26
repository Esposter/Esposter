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

### Requirement: Every damage a side deals passes the field's bonuses before any doubling

Every damage a side deals SHALL pass every additive bonus on its field before any doubling is applied, a skill's hit, a Swirl's spread, a piercing, an End Phase DMG and a switch's DMG alike.

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

### Requirement: A summon or combat status placed again is refreshed or stacks

A summon or combat status SHALL be placed by its id: a card of that id already on the field SHALL be refreshed to its starting usages and rounds, and a second copy SHALL NOT be added, unless the card names a most usages it stacks to. A card that names one SHALL stack instead: placed again, its starting usages SHALL be added to the usages it has, up to that most.

#### Scenario: A summon placed again refreshes the one on the field

- **GIVEN** a Frostflake Seki no To is on a side with one usage left
- **WHEN** Kamisato Art: Soumetsu summons a Frostflake again
- **THEN** the one Frostflake on the field is refreshed to its starting usages, and no second copy appears

#### Scenario: A summon that stacks adds its usages up to its most

- **GIVEN** a Bake-Kurage is on a side with three usages, and its most is four
- **WHEN** Kurage's Oath summons a Bake-Kurage again
- **THEN** the one Bake-Kurage on the field has four usages, and no second copy appears

### Requirement: An onstage placed again takes no slot of its own

An onstage is a combat status and SHALL follow the same rule, so a second copy of an onstage SHALL NOT take a slot of its own, and the copy already there SHALL keep its counter.

#### Scenario: An onstage placed again refreshes the one on the field

- **GIVEN** a Changing Shifts is on a side's onstages with no usage left
- **WHEN** the side plays Changing Shifts again
- **THEN** the one Changing Shifts on the field has its usage back, and no second copy appears

### Requirement: A support placed again takes a slot of its own

A support SHALL NOT be refreshed: a second copy SHALL take a slot of its own.

#### Scenario: A support played again takes its own slot

- **GIVEN** a Wagner is on a side's supports with its counter at three
- **WHEN** a second Wagner is played
- **THEN** the second Wagner takes a slot of its own, and the first keeps its counter

### Requirement: A card hears the turn's start, a declared round's end and a summon's leaving

A side handed its choice of action SHALL run its field's before-action hooks before the choice, and a side declaring its round's end SHALL run its round-end hooks before the declaration counts. The damage such a hook returns SHALL be dealt by its side through the damage seam. Each summon that leaves a side's field SHALL tell that side's supports once.

#### Scenario: A before-action card deals its damage before the side chooses

- **GIVEN** a side holds Tenko Thunderbolts, which deals 3 Electro before its choice
- **WHEN** the turn passes to that side
- **THEN** the opposing active character takes 3 Electro DMG before the side chooses its action, and the card leaves the field

#### Scenario: Hanachirusato gains Progress when a summon disappears

- **GIVEN** a side holds Hanachirusato with no Progress and a Bake-Kurage with one usage
- **WHEN** the End Phase spends the Bake-Kurage's last usage
- **THEN** Hanachirusato gains one Cleansing Ritual Progress

#### Scenario: A Summon a card's play destroys counts for Progress

- **GIVEN** a side holds Hanachirusato with no Progress and a Bake-Kurage on its field
- **WHEN** the side plays Guardian's Oath, which destroys every Summon
- **THEN** Hanachirusato gains one Cleansing Ritual Progress

### Requirement: The Oceanic Mimics are summoned by the kind fewest on the field

The Oceanic Mimics SHALL be summoned as the kind the side holds fewest of, the earliest kind winning a tie.

#### Scenario: Fewest kind is summoned

- **GIVEN** a side holds more copies of one Mimic kind than of another
- **WHEN** Mimics are summoned
- **THEN** the kind it holds fewest of is summoned

#### Scenario: A further Mimic refreshes a kind already held

- **GIVEN** a side holds one Mimic of each kind
- **WHEN** a Mimic is summoned
- **THEN** the earliest kind's Mimic is refreshed to its usages, and no second copy appears

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

Ellin's opponent deck SHALL hold no cards and SHALL give its side only the two statuses its passives give at the start of the battle (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/GCGDeckExcelConfigData.json`, id 11002, which has no `cardList` key).

#### Scenario: Ellin's side starts with its two statuses

- **GIVEN** Ellin's deck is played in a duel
- **WHEN** the battle begins
- **THEN** its side starts with the Flowfire Edge and Elemental Lifeform statuses and no cards

### Requirement: A defeat a card answers restores the character, once

A character about to fall SHALL first be offered to the cards attached to it. A card that answers SHALL restore the character to the HP it names and spend itself, and a character with no answer SHALL fall as before.

#### Scenario: Fiery Rebirth restores Abyss Lector to 4 HP once

- **GIVEN** Abyss Lector has 3 HP and Fiery Rebirth attached
- **WHEN** an opposing skill deals her 5 Pyro DMG
- **THEN** she stands at 4 HP with Fiery Rebirth triggered, and a second lethal hit defeats her

#### Scenario: Electro Crystal Core restores Electro Hypostasis to 1 HP once

- **GIVEN** Electro Hypostasis has 2 HP and Electro Crystal Core attached
- **WHEN** a lethal hit lands on her
- **THEN** she stands at 1 HP, the Electro Crystal Core is spent, and the next lethal hit defeats her

### Requirement: A skill prepared for a side runs as its turn begins

A side's prepared skills SHALL run when the turn passes to that side, before its before-action hooks, each for a preparer still standing, and a skill prepared while they run SHALL wait for the following turn.

#### Scenario: Rock-Paper-Scissors Combo's preparations run at the next turn

- **GIVEN** Electro Hypostasis uses Rock-Paper-Scissors Combo, preparing Scissors and Paper
- **WHEN** the turn passes to that side
- **THEN** Scissors deals 2 Electro DMG and Paper deals 3 Electro DMG to the opposing active character before the side chooses, and Scissors' own preparation of Paper waits for the turn after

### Requirement: A side's prepared skills wait while the opponent has declared its end

While the opponent has declared its round's end, the side keeps the turn without a new one beginning, so its prepared skills SHALL wait for the turn it next takes.

#### Scenario: A prepared skill waits while the opponent has declared its end

- **GIVEN** Electro Hypostasis prepared Paper in its own Combat Action, and the opposing side has declared its Round end
- **WHEN** Electro Hypostasis keeps taking actions
- **THEN** Paper deals nothing and stays prepared, and it deals its 3 Electro DMG when the turn next passes to that side

### Requirement: A prepared skill is heard as a skill used by its preparer's cards

The cards on a preparer's field SHALL hear its prepared skill as a skill used, so a Crowfeather Cover on that character spends a usage on a prepared Elemental Skill.

#### Scenario: A prepared skill is recorded as used this round

- **GIVEN** Electro Hypostasis prepared Paper, and the turn passes to its side
- **WHEN** Paper runs
- **THEN** Paper is recorded as used this round, as a skill its character uses is

#### Scenario: A prepared Elemental Skill spends the holder's Crowfeather Cover usage

- **GIVEN** Electro Hypostasis has a Crowfeather Cover and its prepared Paper is due
- **WHEN** the turn passes to that side
- **THEN** Paper deals 4 Electro DMG with the cover's +1, and the cover has one usage left

### Requirement: A card on one side surcharges the other side's switch once a round

A card's surcharge on a switch SHALL add its dice to the switch cost the opposing side pays, once that cost is paid the surcharging card SHALL hear the payment, and Chains of Warding Thunder SHALL surcharge at most one switch a round.

#### Scenario: Chains of Warding Thunder adds one die to the first switch of a round

- **GIVEN** a side holds Chains of Warding Thunder, and the opposing side holds a character it can switch to
- **WHEN** the opposing side switches for the first time this round
- **THEN** the switch costs one die more, and a second switch in the same round costs no more than its own cost

### Requirement: A depleted shield is answered by the card attached to its character

A hit that takes a standing character's shield to 0 SHALL call each card attached to that character that answers depletion, and the piercing DMG the card names SHALL reach every opposing character, the active one and those on standby alike.

#### Scenario: Aegis of Abyssal Flame answers the depletion of Abyss Lector's shield

- **GIVEN** Abyss Lector has 2 shield points and Aegis of Abyssal Flame attached, and the opposing side has an active character and one on standby
- **WHEN** a 3 Physical hit lands on Abyss Lector
- **THEN** her shield is gone and she stands at 9 HP, each opposing character takes 1 piercing DMG, and the Aegis is spent

#### Scenario: A hit that defeats the character leaves its Aegis with it

- **GIVEN** Abyss Lector has 2 shield points and Aegis of Abyssal Flame attached, and the opposing side's only character stands at 1 HP
- **WHEN** a 12 Physical hit defeats Abyss Lector
- **THEN** the Aegis is discarded with her, no piercing DMG reaches the opposing side, and the opposing side wins the duel

### Requirement: Shimenawa's Reminiscence reduces a side's Talent card or Elemental Skill from any character

Shimenawa's Reminiscence SHALL reduce, once per round, a Talent card or an Elemental Skill paid by any character on its side, whichever character carries the artifact. Its game text names the side ("you play a Talent card or a Character uses an Elemental Skill", `~/Esposter.noindex/genshin-parity/text/TextMap/TextMapEN.json`, text 455966544, on the card `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/GCGCardExcelConfigData.json` id 312014). The wiki's Equipment Card page reads "the character", so this reading is provisional.

#### Scenario: The artifact on a standby character reduces the active character's Elemental Skill

- **GIVEN** Shimenawa's Reminiscence is attached to Abyss Lector, who is standby, and Kujou Sara is active
- **WHEN** Sara pays for an Elemental Skill
- **THEN** it costs one Elemental Die less, and the artifact is used for the round

### Requirement: A Technique is an action its character's equipment gives, not a skill

A Technique that a character's equipment gives SHALL be used by that character, paying its dice as a skill is paid, and SHALL NOT be recorded as a used skill, so a rule that reduces a skill already used this Round does not read it.

#### Scenario: Ellin does not reduce a repeated Burning Assault

- **GIVEN** Spirit of Omen: Pyro Scorpion is equipped to Eremite, Ellin is on her side, and Burning Assault was used this Round
- **WHEN** Eremite uses Burning Assault again with one die
- **THEN** the use is unpayable, since it still costs 2 Matching dice

### Requirement: A character hears the DMG it takes, whichever hit lands it

A character still standing that loses HP or shield SHALL hear the DMG it takes through its cards and Passive skills, whether the damage is its side's active hit, a reaction's piercing or spread, or standby piercing. Spirit of Omen's Power is the card that needs it.

#### Scenario: Standby piercing takes the Eremite to 7 HP or less

- **GIVEN** Eremite stands on standby at 8 HP with Spirit of Omen's Power
- **WHEN** piercing DMG takes her to 6 HP
- **THEN** she gains 1 Energy

## Open

- [ ] **A card's damage bonus applies only to the skills it names** — no source yet: the game's text for Jueyun Guoba's Normal Attack limit is not checked here; the repo check at `packages/genshin-world/src/services/gcg/cards/jueyunGuoba.ts` line 15 reads `context.skill?.kind`, which is repo code, not game evidence.
- [ ] **An opponent deck is legal only when every talent card it holds has its character in the deck** — no source yet: no legality check was found in the deck build or read scripts.
- [ ] **While the opponent has declared its end, the side's prepared skills wait** — no source yet: the named source is repo code, which is not game evidence, and the wiki's rules page is not in `~/Esposter.noindex/cache/genshin-wiki`.
- [ ] **The card values and card behaviours in the scenarios match the game** — no source yet: the scenarios' card values are not yet checked against `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/GCGCardExcelConfigData.json`, and the wiki's card pages are not in the cache.
