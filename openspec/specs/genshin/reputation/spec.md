## Purpose

Mondstadt's Reputation as the game's table gives it, a level reached by EXP carried up through each level's requirement, every level's reward and unlocks, its requests and weekly bounties paid in the nation's Reputation EXP and Mora, three of each kind claimed a week across nations, and the shop discount's rounding, with the keeper, the bounties' trails and the exploration thresholds not yet on a screen (`packages/genshin-world/src/services/reputation/readMondstadtReputation.ts`, `packages/genshin-world/src/services/reputation/constants.ts`).

## Requirements

### Requirement: Reputation levels rise as EXP carries past each requirement

Mondstadt's Reputation SHALL rise one level at a time as its EXP carries past each level's requirement, and SHALL stop earning EXP at its last level.

#### Scenario: EXP past a requirement raises the level

- **GIVEN** the Reputation is at a level with some EXP held
- **WHEN** enough Reputation EXP is gained to pass that level's requirement
- **THEN** the Reputation moves up to the next level
- **AND** the EXP beyond the requirement carries into the new level

#### Scenario: EXP short of a requirement holds the level

- **GIVEN** the Reputation is at a level
- **WHEN** gained EXP does not pass that level's requirement
- **THEN** the Reputation stays at its level with the EXP held

#### Scenario: The last level earns no further EXP

- **GIVEN** the Reputation is at its last level
- **WHEN** Reputation EXP is gained
- **THEN** the Reputation does not change

### Requirement: Each level pays its reward and opens its unlock

Each Reputation level SHALL pay its reward when reached and SHALL show the feature it unlocks in the game's own words on the reward page.

#### Scenario: Reaching a level pays its reward

- **GIVEN** a level has a reward
- **WHEN** the Reputation reaches that level
- **THEN** its reward is paid

#### Scenario: The reward page lists each level with its items and unlock

- **GIVEN** the reward page is opened on a level
- **WHEN** the page is shown
- **THEN** each level of the nation is listed with its items and the feature it unlocks
- **AND** the list scrolls when it is taller than the panel

#### Scenario: A level not yet reached shows as not achieved

- **GIVEN** the Reputation has not reached a level
- **WHEN** the reward page lists it
- **THEN** that level shows as not achieved

### Requirement: Requests and bounties pay Reputation EXP and Mora

Each request and each bounty SHALL pay the nation's Reputation EXP and Mora, with more of each at the harder difficulties.

#### Scenario: Claiming a request pays its EXP and Mora

- **GIVEN** a request is claimable
- **WHEN** the request is claimed
- **THEN** its Reputation EXP and Mora are paid

#### Scenario: A harder bounty pays more than an easier one

- **GIVEN** two bounties of the same kind differ in difficulty
- **WHEN** each is claimed
- **THEN** the harder one pays more Reputation EXP and more Mora (bounty rewards 2010101 and 2010102)

### Requirement: Requests and bounties are claimable three times a week across nations

Each kind of claim, requests and bounties counted apart, SHALL be limited to three claims a week across all nations, counted from the weekly reset.

#### Scenario: A fourth claim of a kind in the week is refused

- **GIVEN** three claims of a kind have been made this week across nations
- **WHEN** a further claim of that kind is attempted
- **THEN** the claim is refused until the weekly reset, and the keeper offers no further request until then

#### Scenario: A request taken before the limit pays past it

- **GIVEN** a request was taken while the week's request claims were under the limit
- **AND** three request claims have since been made this week across nations
- **WHEN** that request finishes
- **THEN** its reward pays and its claim is counted

#### Scenario: The weekly reset restarts the count

- **GIVEN** the weekly limit is reached for a kind
- **WHEN** the weekly reset passes
- **THEN** that kind can be claimed again up to the limit

#### Scenario: A claim at the reset counts toward the new week

- **GIVEN** a claim is made at the instant of the weekly reset
- **WHEN** the week's claims are counted
- **THEN** that claim counts toward the new week

### Requirement: The shop discount is 10 percent rounded down to five Mora

A Reputation discount SHALL take ten percent off a price and round the discounted price down to a multiple of five Mora.

#### Scenario: A discounted price rounds in the player's favour

- **GIVEN** a shop good has a price
- **WHEN** the Reputation discount is applied
- **THEN** the price is reduced by ten percent
- **AND** the result is rounded down to a multiple of five Mora

### Requirement: Each exploration threshold pays once

Each exploration threshold SHALL pay its reward once, and only for the thresholds a progress passes between its previous and its new percentage.

#### Scenario: Progress passing a threshold pays its reward

- **GIVEN** an exploration threshold lies between the previous and the new percentage
- **WHEN** the progress rises past it
- **THEN** the threshold's reward is paid

#### Scenario: A threshold already held pays nothing again

- **GIVEN** a threshold was paid earlier
- **WHEN** the progress rises again within the same range
- **THEN** no reward is paid for that threshold a second time

## Open

- [ ] **Requests and bounties are claimable three times a week** — no source yet: the wiki's Reputation page is not in the cache.
- [ ] **A Reputation discount is ten percent off, rounded down to five Mora** — no source yet: the wiki's Reputation page does not confirm it, and no cached game text states the percentage.
- [ ] **Reputation levels rise one at a time as EXP carries past each requirement, and stop at the last level** — the `Reputation` wiki page's Reputation Levels & Rewards table for Mondstadt (its EXP and EXP [total] columns) and its line that no Reputation EXP is obtained at the maximum level; the dump's `ExcelBinOutput/ReputationLevelExcelConfigData.json` holds each level's `nextLevelExp`. The carry itself has no source yet: it needs a recording of EXP gained past a level's requirement.
- [ ] **Each level pays its reward when reached and shows its unlock in the game's own words** — the dump's `ExcelBinOutput/ReputationLevelExcelConfigData.json` names each level's `rewardId`, read through `ExcelBinOutput/RewardExcelConfigData.json`, and the `Reputation` wiki page's Mondstadt table gives each level's items in English to check against. Each unlock's game words are the `nameTextMapHash` its function holds in `ExcelBinOutput/ReputationFunctionExcelConfigData.json`, resolved in `text/TextMap/TextMapEN.json`.
- [ ] **Each request and each bounty pays the nation's Reputation EXP and Mora** — the `Reputation` wiki page's Weekly Requests section gives each request 80 Reputation points and 20,000 Mora, which `ExcelBinOutput/RewardExcelConfigData.json` holds as reward 2010110. The wiki gives no bounty amounts, and its Weekly Bounties section links a `Bounties` page that is not in the cache; `RewardExcelConfigData.json` rows 2010101 and 2010102 hold the bounty amounts, and which bounty names which row is not checked here.
- [ ] **Each exploration threshold pays its reward once, for the thresholds a progress passes** — the `Reputation` wiki page's World Exploration table gives the thresholds at 20, 40 and 60 percent, each paying 200 Reputation and 20,000 Mora, which `ExcelBinOutput/ReputationExploreExcelConfigData.json` holds as rewards from 2010031 at 20 percent. The pays-once rule has no source yet: it needs a recording of exploration passing a threshold and then rising again within its range.
