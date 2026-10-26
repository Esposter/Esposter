## Purpose

The game's expeditions as pure state. A character but the Traveler is sent to one of Mondstadt's places for 4, 8, 12 or 20 hours, kept by the moment it left so it returns while the page is closed, its items and Mora claimed into the bag and wallet, or forfeited by a recall. Two may be out at first, and Adventure Ranks 26, 31 and 36 each add one. Katheryne and the expedition screen are not built.

## Requirements

### Requirement: A character is sent to an open place for an offered length of time

A character other than the Traveler SHALL be sent to an open place for one of the four durations offered: 4, 8, 12 or 20 hours.

#### Scenario: A character is sent for eight hours

- **GIVEN** an open place and a character at rest
- **WHEN** the character is sent for 8 hours
- **THEN** the character is away for 8 hours

### Requirement: A send is refused for the Traveler, a character who is down, a closed place or past the limit

A send SHALL be refused for the Traveler, for a character who is down or already away, for a closed place, and for a send past the expedition limit.

#### Scenario: The Traveler cannot be sent

- **GIVEN** the Traveler at rest and an open place
- **WHEN** the Traveler is sent
- **THEN** the send is refused

#### Scenario: A character already away cannot be sent again

- **GIVEN** a character already away
- **WHEN** it is sent again
- **THEN** the send is refused

#### Scenario: A character who is down cannot be sent

- **GIVEN** a character who is down
- **WHEN** it is sent
- **THEN** the send is refused

#### Scenario: A closed place cannot be sent to

- **GIVEN** a place that is closed
- **WHEN** a character is sent to it
- **THEN** the send is refused

#### Scenario: A send past the expedition limit is refused

- **GIVEN** the expeditions out already at the limit
- **WHEN** another character is sent
- **THEN** the send is refused

### Requirement: A place opens once its rank, statue and quest conditions are met

A place SHALL open once its Adventure Rank, the statue it names and the quest it names are each met, and the lowest place SHALL open at Adventure Rank 14.

#### Scenario: A place below its Adventure Rank stays closed

- **GIVEN** a place whose rank is above the player's
- **WHEN** its state is read
- **THEN** the place is closed

#### Scenario: A place whose statue is not resonated stays closed

- **GIVEN** a place naming a statue the player has not resonated with
- **WHEN** its state is read
- **THEN** the place is closed

#### Scenario: A place whose named quest is unfinished stays closed

- **GIVEN** a place naming a quest not yet finished
- **WHEN** its state is read
- **THEN** the place is closed

#### Scenario: A place naming a quest with no finished record stays closed

- **GIVEN** a place naming a quest for which no finished record exists
- **WHEN** its state is read
- **THEN** the place is closed until such a record exists

### Requirement: The number of expeditions out rises with Adventure Rank

Two expeditions SHALL be out at once at first, and one more SHALL be allowed at each of Adventure Ranks 26, 31 and 36.

#### Scenario: A third expedition is refused below Adventure Rank 26

- **GIVEN** two expeditions out and an Adventure Rank below 26
- **WHEN** a third is sent
- **THEN** the send is refused

#### Scenario: A third expedition is allowed from Adventure Rank 26

- **GIVEN** two expeditions out and an Adventure Rank of 26
- **WHEN** a third is sent
- **THEN** the send is allowed

### Requirement: An expedition returns once its hours pass from the moment it left

An expedition SHALL return once its hours have passed from the moment it left, whether or not its screen is open, and not a moment earlier.

#### Scenario: An expedition returns while the screen is closed

- **GIVEN** an expedition away with the screen closed
- **WHEN** its hours pass
- **THEN** the expedition has returned

#### Scenario: An expedition has not returned a moment before its hours pass

- **GIVEN** an expedition away
- **WHEN** the moment one instant before its hours pass is read
- **THEN** the expedition has not returned

### Requirement: A claim puts the rewards into the bag and wallet or is refused whole

A claim SHALL put each rolled item into the bag and the Mora into the wallet, and SHALL be refused whole when an item would overflow the bag.

#### Scenario: A claim puts the rewards into the bag and wallet

- **GIVEN** a returned expedition
- **WHEN** it is claimed
- **THEN** its items go into the bag
- **AND** its Mora goes into the wallet
- **AND** the expedition leaves the list

#### Scenario: A claim whose items would overflow the bag is refused

- **GIVEN** a returned expedition whose items would overflow the bag
- **WHEN** it is claimed
- **THEN** the claim is refused
- **AND** the expedition stays on the list

### Requirement: A recall forfeits the reward

Recalling an expedition SHALL take its character off the list and give no reward.

#### Scenario: A recalled expedition gives nothing

- **GIVEN** an expedition away
- **WHEN** it is recalled
- **THEN** its character is taken off the list
- **AND** no reward is given

### Requirement: Each reward item's count is drawn between its least and most

Each reward item's count SHALL be drawn between its least and its most by the game's random source.

#### Scenario: A rolled count lies between the least and the most

- **GIVEN** an expedition's reward preview
- **WHEN** its reward is rolled
- **THEN** each item's count lies between its least and its most

### Requirement: Expeditions are held for the session and a reload empties them

Expeditions SHALL be held for the session only, so that a reload of the page empties the list.

#### Scenario: A reload empties the expedition list

- **GIVEN** an expedition away
- **WHEN** the page is reloaded
- **THEN** the expedition is no longer on the list

### Requirement: Katheryne's talk opens the expedition screen

Talking to Katheryne SHALL open the expedition screen, and a send SHALL be refused when the expedition rules refuse it.

#### Scenario: Talking to Katheryne opens the expedition screen

- **GIVEN** the player is at a branch of the Adventurers' Guild
- **WHEN** the player talks with Katheryne
- **THEN** the expedition screen opens with its places and the characters free to go

#### Scenario: A send the rules refuse is refused

- **GIVEN** the expedition screen is open
- **WHEN** the player sends a character the rules refuse
- **THEN** the send is refused and the character stays at home

### Requirement: A character on expedition stays usable in the party

Every character except the Traveler SHALL stay usable in the party while on expedition.

#### Scenario: A character on expedition stays in the party

- **GIVEN** a character is away on an expedition
- **WHEN** the player sets the party
- **THEN** the character can be chosen for the party

### Requirement: A place opens once its statue is resonated

An expedition place SHALL be open only once its named statue has been resonated.

#### Scenario: A place opens when its statue is resonated

- **GIVEN** a place's named statue has not been resonated
- **WHEN** the player resonates that statue
- **THEN** the place is open for expeditions

#### Scenario: A place whose statue is not resonated stays closed

- **GIVEN** a place's named statue has not been resonated
- **WHEN** the player looks at the expedition screen
- **THEN** the place is not open for expeditions

### Requirement: The expedition bonus chance follows the sent character's level

The chance of an expedition bonus SHALL rise with the level of the character sent, as the game's bonus table gives it.

#### Scenario: A level 1 character has a 20 percent bonus chance

- **GIVEN** a character at level 1 is sent on an expedition
- **WHEN** the expedition is set
- **THEN** its bonus chance is 20 percent

#### Scenario: A level 21 character has a 40 percent bonus chance

- **GIVEN** a character at level 21 is sent on an expedition
- **WHEN** the expedition is set
- **THEN** its bonus chance is 40 percent

#### Scenario: A level 81 character has a 90 percent bonus chance

- **GIVEN** a character at level 81 is sent on an expedition
- **WHEN** the expedition is set
- **THEN** its bonus chance is 90 percent

### Requirement: An expedition talent applies to the expedition its character is sent on

A character's expedition talent SHALL apply to the expedition on which that character is sent.

#### Scenario: A talent that shortens expeditions shortens the one it is sent on

- **GIVEN** a character with a talent that shortens expeditions is sent out
- **WHEN** the expedition is set
- **THEN** its duration is shorter than the place's usual duration

#### Scenario: A talent that adds to a reward adds to the one it is sent on

- **GIVEN** a character with a talent that adds to expedition rewards is sent out
- **WHEN** the expedition is claimed
- **THEN** its reward is larger than the place's usual reward

## Open

- [ ] **Two expeditions out at first** — no source yet: the wiki's Expedition page is not cached and the dump holds no base limit.
- [ ] **A recall forfeits the reward** — no source yet: no test holds `recallExpedition`.
- [ ] **A reload empties the expedition list** — no source yet: no test holds the session-only list.
