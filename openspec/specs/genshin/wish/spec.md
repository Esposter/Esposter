## Purpose

The game's wish, pulled by its published rules in one pure function over a random source. Four banner kinds with their base rates, soft and hard pity, the four-star guarantee every ten, the 50/50 and its guarantee, Capturing Radiance, the Epitomized Path, the beginners' wish's Noelle and twenty wishes, and the Starglitter or Stardust a draw returns. A wish ×1 or ×10 spends its Fates from the wallet, and its screen opens on F3. Nothing is bought with money.

## Requirements

### Requirement: Four banner kinds with their own counters

The wish SHALL offer four banner kinds, the character event, the weapon event, the standard and the beginners', each keeping its own pity counters from one wish to the next.

#### Scenario: Counters kept per banner kind

- **GIVEN** a player has made wishes on the standard banner
- **WHEN** the player opens the character event banner
- **THEN** the character event banner's pity counters are its own

#### Scenario: Second character event banner shares counters

- **GIVEN** a second character event banner is open
- **WHEN** its wishes are counted
- **THEN** they share the first character event banner's counters

### Requirement: Five-star guaranteed at its hard pity

A five-star SHALL be guaranteed on the ninetieth wish since the last five-star on the character and standard banners, and on the eightieth on the weapon banner.

#### Scenario: Character banner guarantee

- **GIVEN** ninety wishes have passed since the last five-star on the character event banner
- **WHEN** the next wish is made
- **THEN** that wish is a five-star

#### Scenario: Weapon banner guarantee

- **GIVEN** eighty wishes have passed since the last five-star on the weapon event banner
- **WHEN** the next wish is made
- **THEN** that wish is a five-star

### Requirement: Soft pity raises the five-star chance

The five-star chance SHALL rise from the seventy-fourth wish since the last five-star on the character banner, and from the sixty-third on the weapon banner.

#### Scenario: Character banner soft pity

- **GIVEN** seventy-four wishes have passed since the last five-star on the character event banner
- **WHEN** the five-star chance is read
- **THEN** it is higher than the base rate

#### Scenario: Weapon banner soft pity

- **GIVEN** sixty-three wishes have passed since the last five-star on the weapon event banner
- **WHEN** the five-star chance is read
- **THEN** it is higher than the base rate

### Requirement: Four-star guaranteed every tenth wish

A four-star or better SHALL be guaranteed on the tenth wish since the last one.

#### Scenario: Four-star guarantee

- **GIVEN** nine wishes have passed since the last four-star or better
- **WHEN** the tenth wish is made
- **THEN** that wish is a four-star or better

### Requirement: Featured five-star split by a half on character banners

A five-star on the character event banner SHALL be the promotional character half the time, and a miss SHALL guarantee the promotional character on the next five-star.

#### Scenario: Losing the 50/50

- **GIVEN** a five-star on the character event banner is not the promotional character
- **WHEN** the result is given
- **THEN** it is another five-star
- **AND** the next five-star on that banner is the promotional character

### Requirement: Capturing Radiance on the character banner

On a character event five-star, Capturing Radiance SHALL make it the promotional character for three in every hundred such five-stars, and for certain once the promotional character has come second three times running.

#### Scenario: Capturing Radiance triggers at random

- **GIVEN** a character event five-star is drawn
- **WHEN** Capturing Radiance is checked
- **THEN** it makes the five-star the promotional character in three in every hundred such draws

#### Scenario: Certain after three second places

- **GIVEN** the promotional character has come second three times running
- **WHEN** the next character event five-star is drawn
- **THEN** Capturing Radiance makes it the promotional character

### Requirement: Epitomized Path charts a weapon

On the weapon banner with a course charted for one of its promotional weapons, a five-star that is not that weapon SHALL earn a Fate Point, and one Fate Point SHALL make the next five-star the charted weapon.

#### Scenario: Fate Point earned

- **GIVEN** a course is charted on the weapon banner
- **WHEN** a five-star that is not the charted weapon is drawn
- **THEN** one Fate Point is earned

#### Scenario: Charted weapon drawn

- **GIVEN** a player holds one Fate Point toward the charted weapon
- **WHEN** the next five-star is drawn
- **THEN** that five-star is the charted weapon
- **AND** the Fate Points are reset

#### Scenario: No course charted

- **GIVEN** no course is charted on the weapon banner
- **WHEN** a five-star is drawn
- **THEN** no Fate Point is earned

### Requirement: Beginners' wish limited to twenty wishes

The beginners' wish SHALL take Acquaint Fates, hold no four-star or five-star weapons, guarantee Noelle on its eighth wish, and end after its twentieth wish.

#### Scenario: Noelle on the eighth wish

- **GIVEN** seven wishes have been made on the beginners' wish
- **WHEN** the eighth wish is made
- **THEN** the wish is Noelle

#### Scenario: Ten wishes cost eight Acquaint Fates

- **GIVEN** the wallet holds at least eight Acquaint Fates
- **WHEN** the player makes a ten-wish set
- **THEN** eight Acquaint Fates are spent

#### Scenario: Refused after the twentieth wish

- **GIVEN** the twentieth wish on the beginners' wish has been made
- **WHEN** another wish is offered
- **THEN** the wish is refused

### Requirement: Draws return Starglitter or Stardust by duplicate count

A draw SHALL return nothing for a new character, and SHALL return Starglitter or Stardust for a duplicate by its rarity.

#### Scenario: New character returns nothing

- **GIVEN** the drawn character is not yet held
- **WHEN** the draw is made
- **THEN** nothing is returned

#### Scenario: Duplicate five-star while constellations incomplete

- **GIVEN** the drawn five-star is a duplicate whose constellations are not complete
- **WHEN** the draw is made
- **THEN** ten Masterless Starglitter are returned

#### Scenario: Duplicate five-star with constellations complete

- **GIVEN** the drawn five-star is a duplicate whose six constellations are complete
- **WHEN** the draw is made
- **THEN** twenty-five Masterless Starglitter are returned

#### Scenario: Three-star weapon return

- **GIVEN** a three-star weapon is drawn
- **WHEN** the draw is made
- **THEN** fifteen Masterless Stardust are returned

### Requirement: A wish set spends Fates from the wallet

A wish ×1 or ×10 SHALL spend its Fates from the wallet, and SHALL be refused when the wallet cannot pay for it.

#### Scenario: Ten-wish set spends its Fates

- **GIVEN** the wallet holds enough Fates for a ten-wish set
- **WHEN** the player makes a ten-wish set
- **THEN** its Fates are spent from the wallet
- **AND** each return is added to the wallet

#### Scenario: Set the wallet cannot pay for

- **GIVEN** the wallet holds fewer Fates than the set costs
- **WHEN** the player makes the set
- **THEN** the set is refused
- **AND** the wish button for it is disabled

### Requirement: Fates bought only with Primogems

Fates SHALL be bought only with Primogems, at one hundred and sixty Primogems for one Fate, and never with money.

#### Scenario: Buying a Fate

- **GIVEN** the wallet holds at least one hundred and sixty Primogems
- **WHEN** the player buys one Fate of the banner's kind
- **THEN** one hundred and sixty Primogems are taken
- **AND** one Fate of the banner's kind is added

#### Scenario: Primogems short

- **GIVEN** the wallet holds fewer than one hundred and sixty Primogems
- **WHEN** the player tries to buy a Fate
- **THEN** the purchase is refused

### Requirement: Wish screen opens on F3

The wish screen SHALL open from the F3 key or from the Paimon menu.

#### Scenario: F3 opens the wish screen

- **GIVEN** the player is in the world
- **WHEN** the player presses F3
- **THEN** the wish screen opens

### Requirement: Results shown highest rarity first

A set's results SHALL be shown highest rarity first, with a character ahead of a weapon of the same rarity.

#### Scenario: Ten-wish results order

- **GIVEN** a ten-wish set produces five-stars, four-stars and three-stars
- **WHEN** the results are shown
- **THEN** the five-stars come first, then the four-stars, then the three-stars
- **AND** a character comes ahead of a weapon of the same rarity
