## Purpose

Genshin's daily commissions as built. Every region's daily tasks are read from the game's tables, one record a region (`scripts/src/services/genshinAssets/commissions/buildCommissions.ts`), and four are dealt a day from the areas reached (`~/Esposter/genshin-parity/text/TextMap/TextMap_MediumEN.json`, key `1812726784`), and a finished one is claimed for the reward of the rank it was dealt at (`packages/genshin-world/src/services/commission/claimCommissionReward.ts`). Katheryne gives the day's bonus from the game's score previews (`~/Esposter/genshin-parity/text/ExcelBinOutput/RewardPreviewExcelConfigData.json`) once the four are claimed (`packages/genshin-world/src/services/commission/takeKatheryneBonus.ts`), and an Encounter Point claims one unfinished. The scene swap, the handbook's tab and the kept day are not yet built.

## Requirements

### Requirement: Daily commissions

Daily commissions SHALL open at Adventure Rank 12 and deal four tasks a day from the areas the player has reached.

#### Scenario: Below Adventure Rank 12 no commissions are dealt

- **GIVEN** the player's Adventure Rank is 11
- **WHEN** the day's commissions are dealt
- **THEN** no commission is dealt

#### Scenario: At Adventure Rank 12 four tasks are dealt, none whose place a quest holds

- **GIVEN** the player's Adventure Rank is 12 or more
- **WHEN** the day's commissions are dealt
- **THEN** four tasks are dealt
- **AND** none of them is a task whose place a quest in progress holds

### Requirement: Each dealt commission

Each dealt commission SHALL keep the rank it was dealt at, and its reward SHALL be paid for that rank.

#### Scenario: A commission claimed after the player rises pays for the rank it was dealt at

- **GIVEN** a commission was dealt at Adventure Rank 12
- **WHEN** the player has since reached a higher rank and claims it
- **THEN** the reward is the band the dealt rank falls in

### Requirement: A finished commission

A finished commission SHALL be claimed free, an unfinished one SHALL be claimed for one Encounter Point, and a claimed commission SHALL not be claimed again.

#### Scenario: A finished commission is claimed without spending a point

- **GIVEN** a dealt scene commission has reached its finish count
- **WHEN** the player claims it
- **THEN** its reward is paid
- **AND** no Encounter Point is spent

#### Scenario: An unfinished commission is claimed for one Encounter Point

- **GIVEN** a dealt scene commission has not reached its finish count
- **WHEN** the player claims it
- **THEN** its reward is paid
- **AND** one Encounter Point is spent

#### Scenario: A claimed commission pays nothing when claimed again

- **GIVEN** a commission has already been claimed
- **WHEN** the player claims it again
- **THEN** nothing is paid

### Requirement: A player

A player SHALL claim at most four commissions a day, whichever way each was made (`~/Esposter/genshin-parity/text/TextMap/TextMap_MediumEN.json`, key `1812726784`).

#### Scenario: A fifth claim in one day is refused

- **GIVEN** four claims have been made today
- **WHEN** the player attempts a fifth claim
- **THEN** the claim is refused

#### Scenario: Katheryne's bonus is given once the day's four are claimed

- **GIVEN** four claims have been made today and Katheryne's bonus is not yet given
- **WHEN** the player talks to Katheryne
- **THEN** Katheryne's bonus is drawn for the band the player's rank falls in at that moment, and the day records it as given (the game's text, `~/Esposter/genshin-parity/text/TextMap/TextMap_MediumEN.json`, key `1812726784`)

#### Scenario: A claim does not draw Katheryne's bonus

- **GIVEN** three claims have been made today
- **WHEN** the player makes the fourth claim
- **THEN** the claim pays its reward only, and Katheryne's bonus remains to be given (the game's text, `~/Esposter/genshin-parity/text/TextMap/TextMap_MediumEN.json`, key `33283106`)

#### Scenario: Katheryne gives the bonus once a day

- **GIVEN** Katheryne's bonus has been given today
- **WHEN** the player talks to Katheryne again
- **THEN** nothing more is given

### Requirement: Katheryne's bonus

Katheryne's bonus SHALL give the same Primogems and Adventure EXP in every band, and its Mora and Companionship EXP SHALL rise with the band (`~/Esposter/genshin-parity/text/ExcelBinOutput/RewardPreviewExcelConfigData.json`, rows `2001` to `2012`: Primogem `201` at 20 and Adventure EXP `102` at 500 in every band, Mora `202` from 3875 to 13175 and Companionship EXP `105` from 35 to 100).

#### Scenario: The Adventure Treasure Pack is not paid by the bonus

- **GIVEN** Katheryne's bonus is drawn
- **WHEN** its items are listed
- **THEN** the Adventure Treasure Pack is not among them (item `107004` is at count `0` in every band of `~/Esposter/genshin-parity/text/ExcelBinOutput/RewardPreviewExcelConfigData.json`)

### Requirement: Each reward item

Each reward item SHALL draw its count from its range, and a draw of zero SHALL give nothing.

#### Scenario: An item whose draw is zero is not given

- **GIVEN** a claimed reward includes an item whose draw comes to zero
- **WHEN** the claim is made
- **THEN** none of that item is given

## Open

- [ ] **Daily commissions open at Adventure Rank 12** — no source yet: the wiki's Commission page is not in `~/Esposter/cache/genshin-wiki/`, and no system open UI in `~/Esposter/genshin-parity/text/ExcelBinOutput/SystemOpenUIConfigData.json` names the commissions.
- [ ] **An unfinished commission is claimed for one Encounter Point** — no source yet: the game's text gives Encounter Points' use in place of a commission but no per-commission cost, and its one-per-commission line (`~/Esposter/genshin-parity/text/TextMap/TextMap_MediumEN.json`, key `2417337778`) is for Long-Term Encounter Points.
