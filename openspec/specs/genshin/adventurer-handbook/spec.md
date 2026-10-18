## Purpose

Genshin's Adventurer Handbook as built — F1's screen, an open book with the game's six tabs down its left edge in the English client's order, each named in the game's own words, and its Experience page measured off the wiki's screenshot of the English client.

## Requirements

### Requirement: Six tabs listed in the English client's order

The Adventurer Handbook SHALL list its six tabs down its left edge in the English client's order, each named in the game's own words.

#### Scenario: Tabs read top to bottom

- **GIVEN** the Adventurer Handbook is open
- **WHEN** its tabs are read from top to bottom
- **THEN** they are Experience, Commissions, Domains, Enemies, Guide and Embattle

### Requirement: F1 opens the handbook on its Experience tab

The Adventurer Handbook SHALL open with F1 on its Experience tab, and its close button SHALL return the player to the world.

#### Scenario: F1 opens the handbook in the open world

- **GIVEN** the player is in the open world
- **WHEN** F1 is pressed
- **THEN** the Adventurer Handbook opens at its Experience tab

#### Scenario: Close button returns to the world

- **GIVEN** the Adventurer Handbook is open
- **WHEN** its close button is pressed
- **THEN** the world is shown again

#### Scenario: No investigations yet leaves the page empty

- **GIVEN** the world has no investigations yet
- **WHEN** the Experience tab is open
- **THEN** its investigation list is empty

### Requirement: The Experience page shows the chapter and its commissions

The Experience page SHALL show the chapter's investigation panel and bar, its rewards and its commissions, with each reward tile coloured by its rarity.

#### Scenario: Layout of the Experience page

- **GIVEN** the Experience tab is open
- **WHEN** the page is read
- **THEN** the investigation panel is on the left
- **AND** the chapter's commissions are listed down the right

#### Scenario: Reward tile takes its rarity's colours

- **GIVEN** a commission offers a reward
- **WHEN** it is shown
- **THEN** its tile takes the colours of the reward's rarity
- **AND** the reward's count is shown on the strip across its foot

#### Scenario: Commission row shows its progress

- **GIVEN** a commission is listed on the Experience page
- **WHEN** the row is shown
- **THEN** it shows the commission's title, its progress, its rewards and its tick
