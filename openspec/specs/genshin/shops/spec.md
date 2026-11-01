## Purpose

The game's shop goods read from its shop table into slices and bought by one rule, with a buy limit restocked on its refresh and nothing for Genesis Crystals. Paimon's Bargains' screen, with its Fates and its rotation's characters and weapons, and the Mondstadt grocery's Mora-priced general goods are built; the rotation's materials and the other shops are not yet built.

## Requirements

### Requirement: A good is offered only at its Adventure Rank

A shop good SHALL be offered only once the player's Adventure Rank reaches its rank.

#### Scenario: A good below the player's rank is refused

- **GIVEN** a good requires a higher Adventure Rank than the player has
- **WHEN** the player tries to buy it
- **THEN** the purchase is refused

### Requirement: A good is offered only within its dates

A shop good SHALL be offered only within its dates.

#### Scenario: A good outside its dates is refused

- **GIVEN** a good is outside its sale dates
- **WHEN** the player tries to buy it
- **THEN** the purchase is refused

### Requirement: A buy limit counts purchases since the last refresh

A good with a buy limit SHALL be sold up to that limit between refreshes.

#### Scenario: A good at its limit is sold out until its refresh

- **GIVEN** a good's purchases since its refresh have reached its limit
- **WHEN** the player tries to buy it
- **THEN** the purchase is refused until the refresh

#### Scenario: A refresh restores the buy limit

- **GIVEN** a good has reached its limit
- **WHEN** its refresh passes
- **THEN** the good can be bought up to its limit again

### Requirement: A buy limit of zero means no limit

A limit of zero SHALL mean no limit.

#### Scenario: A good with a limit of zero has no limit

- **GIVEN** a good's buy limit is zero
- **WHEN** the player buys it repeatedly
- **THEN** no purchase is refused for its limit

### Requirement: Refreshes happen at four in the morning game time

Daily and monthly refreshes SHALL happen at four in the morning in the game's time, and a monthly refresh SHALL fall on the first of the month.

#### Scenario: A purchase before the monthly refresh counts to the month before

- **GIVEN** a purchase is made on the first of a month before four in the morning
- **WHEN** the monthly buy limit is counted
- **THEN** the purchase counts toward the month before

### Requirement: A purchase takes every cost from the wallet or the bag and gives the good

A purchase SHALL take each cost of a good, from the wallet for a currency and from the bag for an item, and SHALL give the good.

#### Scenario: A purchase takes the costs and gives the item

- **GIVEN** the player holds every cost of a good
- **WHEN** the player buys the good
- **THEN** each cost is taken from the wallet or the bag
- **AND** the good's item is given to the player

### Requirement: A purchase is refused when the player holds too few of any one cost

A purchase SHALL be refused when the player holds too few of any one cost.

#### Scenario: A purchase the wallet cannot pay is refused

- **GIVEN** the player does not hold one of a good's costs
- **WHEN** the player buys the good
- **THEN** the purchase is refused and the wallet is unchanged

#### Scenario: A good giving an item the shop does not trade in is refused

- **GIVEN** a good gives an item that is not a currency the shop trades in
- **WHEN** the player buys the good
- **THEN** the purchase is refused

### Requirement: A Mora-priced good costs its Mora price

A good priced in Mora SHALL cost the Mora amount.

#### Scenario: A general good costs its Mora price

- **GIVEN** a general good of the Mondstadt grocery is priced in Mora
- **WHEN** the player buys it
- **THEN** the good costs its Mora amount from the wallet

## Open

- [ ] **Refreshes happen at four in the morning in the game's time** — no source yet: the monthly refresh's hour, since shop 102 (`{data-root}/genshin-dump-backup-6.6/ExcelBinOutput/ShopExcelConfigData.json`, monthly on day 1) names no hour and the refresh policy has no monthly row; the daily rows of `{data-root}/genshin-dump-backup-6.6/ExcelBinOutput/RefreshPolicyExcelConfigData.json` (line 20, and line 45) and its weekly row (line 50) give 14400 seconds, four in the morning, and the cached "Paimon's Bargains" page says only that it resets on the first of the month. A monthly row's time in the policy table, or a recording of the monthly reset, would settle it.
- [ ] **Paimon's Bargains draws the 2021 reference's grid without its tab row, art, currency icons or sold-out band** — the reference (`"paimons-bargains-screen"`, `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`) is a 2021 near build whose tabs, rotation and Fates' costs are not the current build's, so the tab row is not drawn. The Fates' icons, the portraits and the weapon art are not shipped, so the cards are plain and the currency icons are placeholder diamonds. The 2021 build's sold-out band, "Obtained the maximum possible amount of Stella Fortuna", has no text key, so the screen does not draw it. The balances at the head's right are the current build's, and the reference shows none there.
