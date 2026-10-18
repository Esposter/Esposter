## ADDED Requirements

### Requirement: Kept Commission Day

The game SHALL keep the day's four commissions with the instant they were dealt, and SHALL deal the day's four again when that instant is before the latest daily reset.

#### Scenario: the day's four survive a reload before the daily reset

- **GIVEN** a day's four commissions dealt after the latest daily reset
- **WHEN** the player reloads the game before the next daily reset
- **THEN** the same four commissions are kept

#### Scenario: a day dealt before the daily reset is dealt again

- **GIVEN** a day's four commissions dealt before the latest daily reset
- **WHEN** the player opens the commissions
- **THEN** four new commissions are dealt for the day

### Requirement: Scene Task Replaces Area Groups

A scene task SHALL replace its area's enemies and objects with its own while it is open, and SHALL restore the area's own when the task is done and the area reloads.

#### Scenario: a scene task replaces its area's enemies while it is open

- **GIVEN** a scene task open in an area
- **WHEN** the player is in that area
- **THEN** the task's camps stand in place of the area's own enemies

#### Scenario: the area's own enemies return when the scene task is done

- **GIVEN** a scene task that has been finished in an area
- **WHEN** the area reloads
- **THEN** the area's own enemies and objects stand again

### Requirement: Quest Blocks Commission Place

A commission SHALL NOT be dealt at a place that a quest in progress holds.

#### Scenario: a commission is not dealt where a quest in progress stands

- **GIVEN** a quest in progress holding a commission's place
- **WHEN** the day's commissions are dealt
- **THEN** that commission is not dealt at that place

### Requirement: Quest Task Finishes With Its Quest

A quest task SHALL finish when its quest completes.

#### Scenario: a quest task finishes with its quest

- **GIVEN** a quest task whose quest is in progress
- **WHEN** that quest completes
- **THEN** the quest task is finished

#### Scenario: a quest task stays unfinished while its quest is in progress

- **GIVEN** a quest task whose quest is in progress
- **WHEN** the player looks at the commission
- **THEN** the quest task is not finished

### Requirement: Commissions Handbook Tab

The Adventurer Handbook's Commissions tab SHALL list the day's four with each one's preferred region, using the game's own words for each title and description.

#### Scenario: the Commissions tab lists the day's four with the preferred region

- **GIVEN** a day with four commissions dealt
- **WHEN** the player opens the Commissions tab of the Adventurer Handbook
- **THEN** the four commissions are listed with their preferred regions

### Requirement: Region Pool Joins At Quest

A region's commissions SHALL join the deal once that region's quest is done.

#### Scenario: a region's commissions join the deal once its quest is done

- **GIVEN** a region whose quest is done
- **WHEN** the day's commissions are dealt
- **THEN** that region's commissions may be dealt

#### Scenario: a region's commissions do not join the deal before its quest is done

- **GIVEN** a region whose quest is not done
- **WHEN** the day's commissions are dealt
- **THEN** none of that region's commissions are dealt

### Requirement: Claim Routing

A commission claim SHALL send its Mora to the player's wallet, its items to the bag, its Adventure EXP to the Adventure Rank, and its Companionship EXP to the friendship grant.

#### Scenario: a claim sends its Mora, items and Companionship EXP where they are kept

- **GIVEN** a commission whose reward is ready to claim
- **WHEN** the player claims the commission
- **THEN** the Mora is added to the wallet, the items go to the bag, the Adventure EXP goes to the Adventure Rank, and the Companionship EXP is granted through the friendship grant

#### Scenario: a claim past the day's four is refused

- **GIVEN** the day's four commissions are already claimed
- **WHEN** the player claims a further commission
- **THEN** no Mora, items or Companionship EXP are granted
- **AND** the claim is not recorded

### Requirement: Quest Earns Encounter Points

A finished Archon quest or Story quest SHALL earn four Encounter Points, held up to the storage, which falls by one Encounter Point for each daily commission finished that day. Points earned before the latest daily reset SHALL NOT be held.

#### Scenario: a finished Archon quest earns four Encounter Points

- **GIVEN** no Encounter Points held and no commission finished
- **WHEN** an Archon quest completes
- **THEN** four Encounter Points are held

#### Scenario: the storage shrinks by one for each daily commission finished

- **GIVEN** two of the day's commissions finished
- **WHEN** a Story quest completes
- **THEN** two Encounter Points are held, not four

#### Scenario: Encounter Points earned before the daily reset are gone

- **GIVEN** Encounter Points held from before the latest daily reset
- **WHEN** the player reads them after that reset
- **THEN** none are held

### Requirement: Claim Spends A Point From The Points Held

An unfinished commission's claim SHALL spend one Encounter Point from the whole points within the half points held, and a claim that routing refuses SHALL spend none.

#### Scenario: an unfinished claim spends a point and keeps the half

- **GIVEN** three half points held and an unfinished commission
- **WHEN** the commission is claimed
- **THEN** one Encounter Point is spent, leaving one half point held

#### Scenario: a claim the bag cannot take spends no point

- **GIVEN** two half points held, an unfinished commission and a bag with no room for its item
- **WHEN** the commission is claimed
- **THEN** the claim is refused and both half points stay held
