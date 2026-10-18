## ADDED Requirements

### Requirement: Adventure EXP Source Grant

The Adventure Rank SHALL rise by the Adventure EXP that each source gives once that source's page adds it through the shared grant.

#### Scenario: spent resin adds five Adventure EXP for each point spent

- **GIVEN** a player with a known Adventure EXP
- **WHEN** the player spends three Original Resin
- **THEN** the player's Adventure EXP rises by fifteen

#### Scenario: a source whose page is not built adds no Adventure EXP

- **GIVEN** an Adventure EXP source whose page has not been built
- **WHEN** that source's doing happens in the world
- **THEN** the player's Adventure EXP does not change

### Requirement: Mora Past Rank 60

The Adventure Rank SHALL pay ten Mora for each point of Adventure EXP gained once the player is at rank 60.

#### Scenario: a gain at rank 60 pays ten Mora for each point

- **GIVEN** a player at Adventure Rank 60
- **WHEN** the player gains Adventure EXP
- **THEN** the player's Mora rises by ten for each point gained

### Requirement: Katheryne Rank Rewards

Katheryne SHALL give a reached rank's reward to the player once, when the player talks to her at a branch of the Adventurers' Guild.

#### Scenario: Katheryne gives a reached rank's reward once

- **GIVEN** a player who has reached a rank whose reward is unclaimed
- **WHEN** the player talks to Katheryne at a branch of the Adventurers' Guild
- **THEN** the rank's reward is given and marked as claimed

#### Scenario: Katheryne gives nothing for a rank not yet reached

- **GIVEN** a rank the player has not reached
- **WHEN** the player talks to Katheryne at a branch of the Adventurers' Guild
- **THEN** no reward for that rank is given

#### Scenario: Katheryne gives nothing for a reward already claimed

- **GIVEN** a rank reward the player has already claimed
- **WHEN** the player talks to Katheryne at a branch of the Adventurers' Guild
- **THEN** no reward is given again

### Requirement: Claimed Rewards Kept

The game SHALL keep each claimed rank reward with the player's progress across reloads.

#### Scenario: a claimed rank reward stays claimed after a reload

- **GIVEN** a player who has claimed a rank reward
- **WHEN** the player reloads the game
- **THEN** that reward remains claimed

### Requirement: System Rank Gates

The Paimon menu SHALL keep a system's entry disabled until the player reaches the rank that opens that system.

#### Scenario: a system's entry stays disabled below its rank

- **GIVEN** a system that opens at a rank above the player's
- **WHEN** the player opens the Paimon menu
- **THEN** that system's entry is disabled

#### Scenario: a system's entry enables at its rank

- **GIVEN** a system that opens at a rank the player has reached
- **WHEN** the player opens the Paimon menu
- **THEN** that system's entry is enabled
