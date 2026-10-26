## Purpose

The game's wish, pulled by its published rules in one pure function over a random source. Four banner kinds with their base rates, soft and hard pity, the four-star guarantee every ten, the 50/50 and its guarantee, Capturing Radiance, the Epitomized Path, the beginners' wish's Noelle and twenty wishes, and the Starglitter or Stardust a draw returns. A wish ×1 or ×10 spends its Fates from the wallet, and its screen opens on F3. Nothing is bought with money.

## Requirements

### Requirement: Four banner kinds with their own counters

The wish SHALL offer four banner kinds, the character event, the weapon event, the standard and the beginners', each keeping its own pity counters from one wish to the next `packages/genshin-world/src/services/wish/InitialBannerKindWishPityMap.ts`.

#### Scenario: Counters kept per banner kind

- **GIVEN** a player has made wishes on the standard banner
- **WHEN** the player opens the character event banner
- **THEN** the character event banner's pity counters are its own `packages/genshin-world/src/services/wish/InitialBannerKindWishPityMap.ts`

#### Scenario: Second character event banner shares counters

- **GIVEN** a second character event banner is open
- **WHEN** its wishes are counted
- **THEN** they share the first character event banner's counters `packages/genshin-world/src/services/wish/makeWishes.ts`

### Requirement: Five-star guaranteed at its hard pity

A five-star SHALL be guaranteed on the ninetieth wish since the last five-star on the character and standard banners, and on the eightieth on the weapon banner `packages/genshin-world/src/services/wish/pullWish.ts`, `packages/genshin-world/src/services/wish/constants.ts`.

#### Scenario: Character banner guarantee

- **GIVEN** ninety wishes have passed since the last five-star on the character event banner
- **WHEN** the next wish is made
- **THEN** that wish is a five-star `packages/genshin-world/src/services/wish/pullWish.ts`

#### Scenario: Weapon banner guarantee

- **GIVEN** eighty wishes have passed since the last five-star on the weapon event banner
- **WHEN** the next wish is made
- **THEN** that wish is a five-star `packages/genshin-world/src/services/wish/pullWish.ts`

### Requirement: Soft pity raises the five-star chance

The five-star chance SHALL rise from the seventy-fourth wish since the last five-star on the character banner, and from the sixty-third on the weapon banner `packages/genshin-world/src/services/wish/constants.ts`.

#### Scenario: Character banner soft pity

- **GIVEN** seventy-four wishes have passed since the last five-star on the character event banner
- **WHEN** the five-star chance is read
- **THEN** it is higher than the base rate `packages/genshin-world/src/services/wish/pullWish.ts`

#### Scenario: Weapon banner soft pity

- **GIVEN** sixty-three wishes have passed since the last five-star on the weapon event banner
- **WHEN** the five-star chance is read
- **THEN** it is higher than the base rate `packages/genshin-world/src/services/wish/pullWish.ts`

### Requirement: Four-star guaranteed every tenth wish

A four-star or better SHALL be guaranteed on the tenth wish since the last one `packages/genshin-world/src/services/wish/pullWish.ts`.

#### Scenario: Four-star guarantee

- **GIVEN** nine wishes have passed since the last four-star or better
- **WHEN** the tenth wish is made
- **THEN** that wish is a four-star or better `packages/genshin-world/src/services/wish/pullWish.ts`

### Requirement: Featured five-star split by a half on character banners

A five-star on the character event banner SHALL be the promotional character half the time, and a miss SHALL guarantee the promotional character on the next five-star `packages/genshin-world/src/services/wish/BannerKindWishRatesMap.ts`, `packages/genshin-world/src/services/wish/pullFiveStar.ts`.

#### Scenario: Losing the 50/50

- **GIVEN** a five-star on the character event banner is not the promotional character
- **WHEN** the result is given
- **THEN** it is another five-star `packages/genshin-world/src/services/wish/pullFiveStar.ts`
- **AND** the next five-star on that banner is the promotional character `packages/genshin-world/src/services/wish/pullFiveStar.ts`

### Requirement: Capturing Radiance on the character banner

On a character event five-star, Capturing Radiance SHALL make it the promotional character for three in every hundred such five-stars, and for certain once the promotional character has come second three times running `packages/genshin-world/src/services/wish/constants.ts`, `packages/genshin-world/src/services/wish/pullFiveStar.ts`.

#### Scenario: Capturing Radiance triggers at random

- **GIVEN** a character event five-star is drawn
- **WHEN** Capturing Radiance is checked
- **THEN** it makes the five-star the promotional character in three in every hundred such draws `packages/genshin-world/src/services/wish/constants.ts`

#### Scenario: Certain after three second places

- **GIVEN** the promotional character has come second three times running
- **WHEN** the next character event five-star is drawn
- **THEN** Capturing Radiance makes it the promotional character `packages/genshin-world/src/services/wish/pullFiveStar.ts`

### Requirement: Epitomized Path charts a weapon

On the weapon banner with a course charted for one of its promotional weapons, a five-star that is not that weapon SHALL earn a Fate Point, and one Fate Point SHALL make the next five-star the charted weapon `packages/genshin-world/src/services/wish/pullFiveStar.ts`.

#### Scenario: Fate Point earned

- **GIVEN** a course is charted on the weapon banner
- **WHEN** a five-star that is not the charted weapon is drawn
- **THEN** one Fate Point is earned `packages/genshin-world/src/services/wish/pullFiveStar.ts`

#### Scenario: Charted weapon drawn

- **GIVEN** a player holds one Fate Point toward the charted weapon
- **WHEN** the next five-star is drawn
- **THEN** that five-star is the charted weapon `packages/genshin-world/src/services/wish/pullFiveStar.ts`
- **AND** the Fate Points are reset `packages/genshin-world/src/services/wish/pullFiveStar.ts`

#### Scenario: No course charted

- **GIVEN** no course is charted on the weapon banner
- **WHEN** a five-star is drawn
- **THEN** no Fate Point is earned `packages/genshin-world/src/services/wish/pullFiveStar.ts`

### Requirement: Beginners' wish limited to twenty wishes

The beginners' wish SHALL take Acquaint Fates, hold no four-star or five-star weapons, guarantee Noelle on its eighth wish, and end after its twentieth wish `packages/genshin-world/src/services/wish/constants.ts`, `packages/genshin-world/src/services/wish/pullWish.ts`, `packages/genshin-world/src/services/wish/checkIsWishSetOffered.ts`.

#### Scenario: Noelle on the eighth wish

- **GIVEN** seven wishes have been made on the beginners' wish
- **WHEN** the eighth wish is made
- **THEN** the wish is Noelle `packages/genshin-world/src/services/wish/pullWish.ts`

#### Scenario: Ten wishes cost eight Acquaint Fates

- **GIVEN** the wallet holds at least eight Acquaint Fates
- **WHEN** the player makes a ten-wish set
- **THEN** eight Acquaint Fates are spent `packages/genshin-world/src/services/wish/getWishCost.ts`

#### Scenario: Refused after the twentieth wish

- **GIVEN** the twentieth wish on the beginners' wish has been made
- **WHEN** another wish is offered
- **THEN** the wish is refused `packages/genshin-world/src/services/wish/checkIsWishSetOffered.ts`

### Requirement: Draws return Starglitter or Stardust by duplicate count

A draw SHALL return nothing for a new character, and SHALL return Starglitter or Stardust for a duplicate by its rarity `packages/genshin-world/src/services/wish/getWishReturn.ts`.

#### Scenario: New character returns nothing

- **GIVEN** the drawn character is not yet held
- **WHEN** the draw is made
- **THEN** nothing is returned `packages/genshin-world/src/services/wish/getWishReturn.ts`

#### Scenario: Duplicate five-star while constellations incomplete

- **GIVEN** the drawn five-star is a duplicate whose constellations are not complete
- **WHEN** the draw is made
- **THEN** ten Masterless Starglitter are returned `packages/genshin-world/src/services/wish/constants.ts`

#### Scenario: Duplicate five-star with constellations complete

- **GIVEN** the drawn five-star is a duplicate whose six constellations are complete
- **WHEN** the draw is made
- **THEN** twenty-five Masterless Starglitter are returned `packages/genshin-world/src/services/wish/constants.ts`

#### Scenario: Three-star weapon return

- **GIVEN** a three-star weapon is drawn
- **WHEN** the draw is made
- **THEN** fifteen Masterless Stardust are returned `packages/genshin-world/src/services/wish/constants.ts`

### Requirement: A wish set spends Fates from the wallet

A wish ×1 or ×10 SHALL spend its Fates from the wallet, and SHALL be refused when the wallet cannot pay for it `packages/genshin-world/src/services/wish/makeWishes.ts`, `packages/genshin-world/src/services/wish/checkIsWishSetOffered.ts`.

#### Scenario: Ten-wish set spends its Fates

- **GIVEN** the wallet holds enough Fates for a ten-wish set
- **WHEN** the player makes a ten-wish set
- **THEN** its Fates are spent from the wallet `packages/genshin-world/src/services/wish/makeWishes.ts`
- **AND** each return is added to the wallet `packages/genshin-world/src/services/wish/makeWishes.ts`

#### Scenario: Set the wallet cannot pay for

- **GIVEN** the wallet holds fewer Fates than the set costs
- **WHEN** the player makes the set
- **THEN** the set is refused `packages/genshin-world/src/services/wish/checkIsWishSetOffered.ts`
- **AND** the wish button for it is disabled `packages/genshin-world/src/components/Wish/Screen/Index.vue`

### Requirement: Fates bought only with Primogems

Fates SHALL be bought only with Primogems, at one hundred and sixty Primogems for one Fate, and never with money `packages/genshin-world/src/services/wish/buyWishFate.ts`, `packages/genshin-world/src/services/wish/constants.ts`.

#### Scenario: Buying a Fate

- **GIVEN** the wallet holds at least one hundred and sixty Primogems
- **WHEN** the player buys one Fate of the banner's kind
- **THEN** one hundred and sixty Primogems are taken `packages/genshin-world/src/services/wish/buyWishFate.ts`
- **AND** one Fate of the banner's kind is added `packages/genshin-world/src/services/wish/buyWishFate.ts`

#### Scenario: Primogems short

- **GIVEN** the wallet holds fewer than one hundred and sixty Primogems
- **WHEN** the player tries to buy a Fate
- **THEN** the purchase is refused `packages/genshin-world/src/services/wish/buyWishFate.ts`

### Requirement: Wish screen opens on F3

The wish screen SHALL open from the F3 key or from the Paimon menu `packages/genshin-engine/src/input/InputActionBindingMap.ts`, `packages/genshin-world/src/services/hud/constants.ts`.

#### Scenario: F3 opens the wish screen

- **GIVEN** the player is in the world
- **WHEN** the player presses F3
- **THEN** the wish screen opens `packages/genshin-world/src/services/screen/InputActionScreenKindMap.ts`

### Requirement: Results shown highest rarity first

A set's results SHALL be shown highest rarity first, with a character ahead of a weapon of the same rarity `packages/genshin-world/src/services/wish/sortWishResults.ts`.

#### Scenario: Ten-wish results order

- **GIVEN** a ten-wish set produces five-stars, four-stars and three-stars
- **WHEN** the results are shown
- **THEN** the five-stars come first, then the four-stars, then the three-stars `packages/genshin-world/src/services/wish/sortWishResults.ts`
- **AND** a character comes ahead of a weapon of the same rarity `packages/genshin-world/src/services/wish/sortWishResults.ts`

### Requirement: An event banner is offered only within its window

An event banner SHALL be offered to the player only while the server's time is inside its window, and SHALL NOT be offered between windows `packages/genshin-world/src/services/wish/getOpenEventBanners.ts`.

#### Scenario: A banner is offered inside its window

- **GIVEN** an event banner whose window holds the server's time
- **WHEN** the player opens the wish screen
- **THEN** the banner is offered beside the beginners' and standard banners `packages/genshin-world/src/services/wish/createBanners.ts`

#### Scenario: A banner is not offered between windows

- **GIVEN** an event banner whose window has ended
- **WHEN** the player opens the wish screen
- **THEN** the banner is not offered `packages/genshin-world/src/services/wish/getOpenEventBanners.ts`

#### Scenario: An event banner page is read into its window and featured items

- **GIVEN** a wiki banner page for a weapon event from the twenty-third of September to the thirteenth of October
- **WHEN** the page is read
- **THEN** its window runs from the twenty-third of September at eleven in the morning to the thirteenth of October at six in the evening, at the Asia server's offset `scripts/src/services/genshinAssets/wish/parseWishPage.ts`
- **AND** its featured items are the two five-stars and the five four-stars named on the page `scripts/src/services/genshinAssets/wish/parseWishPage.ts`

### Requirement: Two character event banners run side by side and share counters

Two character event banners SHALL run side by side in their windows, and SHALL share the character banners' counters `packages/genshin-world/src/services/wish/getOpenEventBanners.ts`, `packages/genshin-world/src/services/wish/InitialBannerKindWishPityMap.ts`.

#### Scenario: Two character banners are offered together and share the character banners' counters

- **GIVEN** two character event banners whose windows both hold the server's time
- **WHEN** the player opens the wish screen
- **THEN** both banners are offered `packages/genshin-world/src/services/wish/getOpenEventBanners.ts`
- **AND** a draw on either banner advances the same counters `packages/genshin-world/src/services/wish/makeWishes.ts`

### Requirement: The wish history lists every draw

The wish history SHALL list each draw's kind, item and time, and SHALL keep the draws of the last year, dropping the older ones `packages/genshin-world/src/services/wish/appendWishHistory.ts`, `packages/genshin-world/src/services/wish/constants.ts`.

#### Scenario: A draw appears in the history with its kind, item and time

- **GIVEN** a draw the player has made
- **WHEN** the player opens the history
- **THEN** the draw is listed with its kind, its item and its time `packages/genshin-world/src/services/wish/toWishHistoryCells.ts`

#### Scenario: History keeps draws within the year and drops the older

- **GIVEN** a draw made within the last year and a draw made more than a year ago
- **WHEN** the player opens the history
- **THEN** the draw within the year is listed and the older draw is not `packages/genshin-world/src/services/wish/appendWishHistory.ts`

### Requirement: A new character joins the roster and a repeat draw returns Starglitter

A character drawn for the first time SHALL join the player's roster, and a repeat draw SHALL count a copy and return its Starglitter `packages/genshin-world/src/services/wish/getNewCharacters.ts`.

#### Scenario: A new character joins the roster

- **GIVEN** a character the player has never drawn
- **WHEN** the player draws it
- **THEN** the character joins the player's roster `packages/genshin-world/src/services/wish/getNewCharacters.ts`

#### Scenario: A repeat draw returns Starglitter

- **GIVEN** a character the player already holds
- **WHEN** the player draws it again
- **THEN** the character's copy count rises by one `packages/genshin-world/src/services/wish/makeWishes.ts`
- **AND** the draw returns its Starglitter `packages/genshin-world/src/services/wish/getWishReturn.ts`

### Requirement: The beginners' wish draws Noelle only on its eighth wish

The beginners' wish SHALL draw Noelle as its featured four-star on the eighth wish only `packages/genshin-world/src/services/wish/pullWish.ts`.

#### Scenario: Noelle is drawn only on the eighth beginners' wish

- **GIVEN** a player on the beginners' wish
- **WHEN** the player makes the eighth wish
- **THEN** Noelle is among the four-stars the wish can draw `packages/genshin-world/src/services/wish/pullWish.ts`
- **AND** on every other wish Noelle is not drawn `packages/genshin-world/src/services/wish/pullWish.ts`

### Requirement: A Fate costs earned Primogems only

A Fate SHALL cost only earned Primogems, and a purchase with money SHALL NOT be offered `packages/genshin-world/src/services/wish/buyWishFate.ts`.

#### Scenario: Fates are paid only in earned Primogems

- **GIVEN** a player holding earned Primogems
- **WHEN** the player buys a Fate
- **THEN** the price is taken in earned Primogems `packages/genshin-world/src/services/wish/buyWishFate.ts`

### Requirement: A schedule naming an item the names do not hold fails the build

A schedule build SHALL fail when a banner names an item that joins none of the names, rather than dropping the item `scripts/src/services/genshinAssets/wish/toWishScheduleEvent.ts`.

#### Scenario: A schedule naming an unknown item fails the build

- **GIVEN** a banner page that names an item the names do not hold
- **WHEN** the schedule is built
- **THEN** the build fails and names the item `scripts/src/services/genshinAssets/wish/toWishScheduleEvent.ts`

## Open

- [ ] **The rule values match the game's published rules: the pity counts and soft-pity starts, Capturing Radiance's 3% and three second places, the four-star guarantee, Noelle on the eighth beginners' wish, the twenty wishes, the Acquaint Fates, the Starglitter and Stardust returns, and 160 Primogems per Fate** — no source yet: the wiki pages the design cites are not cached, and the dump holds no gacha table.
- [ ] **The weapon event window (11:00 on 23 September to 18:00 on 13 October, at the Asia offset) and its two five-stars and five four-stars match the wiki's banner page** — no source yet: the banner page is not cached, and no fixture holding it was checked.
