## Purpose

Genshin's Adventure Rank as built — the rank to 60 on the game's own table, held at the ascension quests' caps, the World Level its rank and quests open with its one lowering, and the enemies that World Level raises.

## Requirements

### Requirement: Rank follows Adventure EXP under the World Level cap

The player's Adventure Rank SHALL be the rank their Adventure EXP reaches, held at the rank cap set by the last open World Level.

#### Scenario: Rank holds at the cap while EXP keeps accruing

- **GIVEN** the open World Level caps the rank at 25
- **WHEN** Adventure EXP reaches the total for rank 25
- **THEN** the rank stays at 25
- **AND** further Adventure EXP still accrues toward rank 60's total

#### Scenario: Rank rises when the quest that lifts the cap is done

- **GIVEN** the rank is held at 25 by an unfinished ascension quest
- **WHEN** that ascension quest is completed
- **THEN** the rank rises to whatever the EXP reaches under the new cap

#### Scenario: Only World Level 0 open caps the rank at 20

- **GIVEN** World Level 0 is the only World Level open
- **WHEN** Adventure EXP passes the total for rank 20
- **THEN** the rank stays at 20

### Requirement: A World Level opens after the rank and quest it needs

A World Level SHALL open once the rank the World Level before it capped is reached and any quest its lock names is complete.

#### Scenario: World Level 1 opens at rank 20

- **GIVEN** the player is at rank 20
- **WHEN** the rank is reached
- **THEN** World Level 1 opens

#### Scenario: Rank without the quest keeps the World Level closed

- **GIVEN** the player reaches rank 25
- **AND** the first ascension quest is not done
- **WHEN** World Level 2 is checked
- **THEN** World Level 2 stays closed

### Requirement: Adventure EXP past rank 60 is paid as Mora

Adventure EXP past rank 60's total SHALL be paid as Mora at ten Mora for each point once the rank cap is 60.

#### Scenario: EXP past the total pays Mora at the cap of 60

- **GIVEN** the rank cap is 60
- **WHEN** an EXP gain passes rank 60's total
- **THEN** the excess is paid as Mora at ten for each point

### Requirement: Adventure EXP past rank 60 is not gained under a lower cap

Adventure EXP past rank 60's total SHALL not be gained while the cap is below 60.

#### Scenario: EXP past the total is not gained under a lower cap

- **GIVEN** the rank cap is below 60
- **WHEN** an EXP gain passes rank 60's total
- **THEN** the EXP past that total is not gained
- **AND** no Mora is paid

### Requirement: The World Level can be lowered from World Level 3

From World Level 3 the player SHALL be able to lower the World Level by one.

#### Scenario: Lowering the World Level by one

- **GIVEN** World Level 3 or higher is unlocked
- **WHEN** the player lowers the World Level
- **THEN** the World Level played at is one lower than the unlocked one

### Requirement: A lowered World Level can be restored

From World Level 3 the player SHALL be able to restore the World Level by one.

#### Scenario: Restoring a lowered World Level

- **GIVEN** the World Level has been lowered
- **WHEN** the player restores it
- **THEN** the World Level played at returns to the unlocked one

### Requirement: Each World Level change is followed by a 24 hour wait

Each World Level change SHALL be followed by a 24 hour wait before the next change.

#### Scenario: A change inside the wait is not made

- **GIVEN** a World Level change was made less than 24 hours ago
- **WHEN** the player tries to change the World Level again
- **THEN** the change is not made
- **AND** the change button is held until the wait ends

### Requirement: The info icon opens the World Level dialog

Clicking the info icon beside the World Level SHALL open the World Level dialog over the dimmed menu.

#### Scenario: Dialog opens at the end of the help text

- **GIVEN** the profile card shows the World Level
- **WHEN** the info icon is clicked
- **THEN** the World Level dialog opens over the dimmed menu
- **AND** the game's help text is shown with its end in view

### Requirement: The World Level dialog closes back to the menu

The dialog SHALL close back to the menu.

#### Scenario: Escape or the cross closes the dialog

- **GIVEN** the World Level dialog is open
- **WHEN** Escape is pressed or the cross is clicked
- **THEN** the dialog closes back to the menu
- **AND** focus returns to the info icon

### Requirement: Enemies stand at the level of the World Level played at

Each camp's enemies SHALL stand at a level set by the World Level played at.

#### Scenario: Camp enemies at World Level 0 stand at their camp level

- **GIVEN** the World Level played at is 0
- **WHEN** a camp at level 1 is met
- **THEN** its enemy stands at level 1

#### Scenario: Camp enemies rise at World Level 1

- **GIVEN** the World Level played at is 1
- **WHEN** a camp at level 1 is met
- **THEN** its enemy stands at level 9

### Requirement: Changing the World Level respawns every camp

A change of World Level SHALL respawn every camp at its new level.

#### Scenario: Changing the World Level respawns every camp

- **GIVEN** camps are spawned at one World Level
- **WHEN** the World Level is changed
- **THEN** every camp is cleared and spawned again at the new level

### Requirement: Adventure EXP Source Grant

The Adventure Rank SHALL rise by the Adventure EXP that each source gives once that source's page adds it through the shared grant (the first source built).

#### Scenario: spent resin adds five Adventure EXP for each point spent

- **GIVEN** a player with a known Adventure EXP
- **WHEN** the player spends three Original Resin
- **THEN** the player's Adventure EXP rises by fifteen

#### Scenario: a source whose page is not built adds no Adventure EXP

- **GIVEN** an Adventure EXP source whose page has not been built
- **WHEN** that source's doing happens in the world
- **THEN** the player's Adventure EXP does not change

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

The game SHALL keep each claimed rank reward with the player's progress across reloads (the `claimedRanks` the save keeps).

#### Scenario: a claimed rank reward stays claimed after a reload

- **GIVEN** a player who has claimed a rank reward
- **WHEN** the player reloads the game
- **THEN** that reward remains claimed

### Requirement: System Rank Gates

The Paimon menu SHALL not draw a system's entry until the player reaches the rank that opens that system and has finished the main quests it opens after.

#### Scenario: a system's entry is not drawn below its rank

- **GIVEN** a system that opens at a rank above the player's
- **WHEN** the player opens the Paimon menu
- **THEN** that system's entry is not drawn

#### Scenario: a system's entry is drawn at its rank

- **GIVEN** a system that opens at a rank the player has reached, and whose quests the player has finished
- **WHEN** the player opens the Paimon menu
- **THEN** that system's entry is drawn

#### Scenario: a system's entry waits on its quest

- **GIVEN** a system that opens after a main quest the player has not finished
- **WHEN** the player opens the Paimon menu
- **THEN** that system's entry is not drawn

## Open

- [ ] **Ten Mora for each point of Adventure EXP past rank 60** — no source yet: the game's text converts the EXP to Mora (text 365981086 in `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`) but gives no rate, and the wiki's Adventure Rank page is not in the cache.
- [ ] **Five Adventure EXP for each point of Original Resin spent** — no source yet: the Original Resin wiki page is not on disk, and no game text on disk gives the resin's Adventure EXP rate.
- [ ] **Katheryne gives a reached rank's reward once, at a branch of the Adventurers' Guild** — no source yet: the Adventure Rank wiki page and its Adventurers' Guild Rewards page are not on disk
- [ ] **A camp's enemy stands at its camp level under World Level 0** — no source yet: the wiki's enemy level ranges are not in the cache, and no enemy name plate at World Level 0 is on disk.
- [ ] **A camp at level 1 stands at level 9 under World Level 1** — no source yet: the wiki's enemy level ranges are not in the cache, and the enemies' name plates at World Levels 1, 5 and 9 are not on disk.
- [ ] **The option to lower the World Level opens after World Level 5** — contradicted by `{data-root}/genshin-parity/captures/yt-P13s7kSmVOE-world-level-dialog-2024.mp4`: the option shows from World Level 5; text 2955635938 says World Level 3.
