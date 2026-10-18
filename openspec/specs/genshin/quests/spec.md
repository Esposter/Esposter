## Purpose

Genshin's quests as built. A quest is one of the game's five kinds, a run of steps each with its objectives (go to, talk to, defeat, collect, act on), and the talks it runs, all by the game's own ids. The Archon quests start from the prologue's first and every other quest from the talk that offers it, a talk ended, an item collected, an enemy defeated and a thing acted on advance the quests in progress, and a finished step or quest reaches the achievements, and a finished main quest the Travel Log. J opens the quest screen, laid out off the English client's still, which lists the quests in progress under the game's four lists, a series' quests under its row and each with how far it stands, and navigates to one, and a beam rises over the navigated objective. A reader writes the quests the world carries from the community's data dump.

## Requirements

### Requirement: A quest is one of five kinds, a run of steps with objectives

A quest SHALL be one of the game's five kinds, holding ordered steps, each with the objectives it asks of the Traveler: go to, talk to, defeat, collect or interact.

#### Scenario: Quest's steps read

- **GIVEN** a quest in the world
- **WHEN** its steps are read
- **THEN** each step lists its objectives in the order the game gives them
- **AND** each objective is one of go to, talk to, defeat, collect or interact

### Requirement: The Archon quests run in order and other quests start from their offering talk

The Archon quests SHALL run in order from the prologue's first, and every other quest SHALL start at its first shown step once the talk offering it has ended.

#### Scenario: Archon quests started

- **GIVEN** a new player's progress
- **WHEN** the quests start
- **THEN** the first unfinished Archon quest in order is started from its first step

#### Scenario: Offering talk ends

- **GIVEN** a talk that offers a quest ends
- **WHEN** the talk ends
- **THEN** the quest starts at its first shown step

#### Scenario: Offering talk repeated

- **GIVEN** a quest has already been started by its offering talk
- **WHEN** the same talk ends again
- **THEN** the quest is not started a second time

### Requirement: The Traveler's doings advance the quests in progress

A quest in progress SHALL advance when the Traveler's doing meets an objective of its current step: a talk ended, an item collected, an enemy defeated or a thing acted on.

#### Scenario: Objective met and counted

- **GIVEN** a step with an objective that asks for a count of enemies
- **WHEN** one of those enemies is defeated
- **THEN** the objective's count goes up by one, held at its own count

#### Scenario: Every objective of a step met

- **GIVEN** every objective of a step is met
- **WHEN** the last objective is met
- **THEN** the quest moves on to its next step with nothing met

#### Scenario: Event no objective names

- **GIVEN** a quest in progress
- **WHEN** a doing names none of its objectives
- **THEN** the quest stays where it was

### Requirement: A finished quest reaches the Travel Log when it is a main quest

A quest that its last step finishes SHALL be finished, and a finished main quest SHALL open its Travel Log entry.

#### Scenario: Last step finished

- **GIVEN** a quest whose last step is met
- **WHEN** the step is finished
- **THEN** the quest is finished

#### Scenario: Main quest finished

- **GIVEN** a finished main quest
- **WHEN** it is finished
- **THEN** its Travel Log entry opens

### Requirement: J opens the quest screen with the game's lists and progress

J SHALL open the quest screen, which lists the quests in progress and the game's four lists, each quest with how far it stands, and Q and E SHALL step between its tabs.

#### Scenario: Quest screen opened

- **GIVEN** the world is in play with no screen over it
- **WHEN** the player presses J
- **THEN** the quest screen opens with the quests in progress under its first tab
- **AND** each quest shows how far its objective stands

#### Scenario: Stepping between tabs

- **GIVEN** the quest screen is open
- **WHEN** the player presses Q or E
- **THEN** the screen steps to the previous or next tab

### Requirement: The navigate button sets or cancels the navigated quest with F

The quest screen's navigate button SHALL navigate to the selected quest when F is pressed, and SHALL cancel the navigation of the quest already navigated to.

#### Scenario: Navigating to the selected quest

- **GIVEN** a quest is selected on the quest screen and no quest is navigated to
- **WHEN** the player presses F
- **THEN** the selected quest becomes the one navigated to

#### Scenario: Cancelling navigation

- **GIVEN** a quest is already navigated to
- **WHEN** the player presses F on that quest
- **THEN** the navigation is cancelled

### Requirement: A navigated objective is marked by a beam from 50 metres off

A navigated objective SHALL have a beam rising over its target, shown once the camera is 50 metres or more away from it.

#### Scenario: Camera 50 metres away

- **GIVEN** a quest navigated to with its target placed
- **WHEN** the camera is 50 metres or more away from the target
- **THEN** the beam rises over the target

#### Scenario: Target no region in reach places

- **GIVEN** a quest whose target no region in reach places
- **WHEN** its distance is shown
- **THEN** no distance is shown for it

### Requirement: A quest's words come from the game's own text by its text id

A quest's titles and words SHALL come from the game's own text, referenced by its text id.

#### Scenario: Quest title shown

- **GIVEN** a quest with a title text id
- **WHEN** the quest is listed
- **THEN** the title is the game's own text for that id in the player's language

### Requirement: The world carries only the quests its inventory lists

The world SHALL carry only the prologue's first two quests and The Seventh Samurai, read by their ids from the game's data.

#### Scenario: Carried quests read

- **GIVEN** the world's quest inventory
- **WHEN** the quests are read
- **THEN** only the quests in the inventory are read from the game's data

### Requirement: A go-to step does not move until its place is placed

A go-to step SHALL stay where it is until the region data places its trigger.

#### Scenario: Prologue's first step

- **GIVEN** the prologue starts at Wanderer's Trail's first step, which asks to reach a place
- **WHEN** the player is in the world
- **THEN** the step stays where it is until its place is placed

### Requirement: The Seventh Samurai is offered from the start

The Seventh Samurai SHALL be offered from the start by Xavier, and its filming step SHALL be left out so the quest goes from its first talk to its next.

#### Scenario: Xavier's offer

- **GIVEN** the player is in the world
- **WHEN** Xavier's talk offers the quest
- **THEN** the quest is offered from the start
- **AND** its filming step is left out

### Requirement: Quest progress is kept in the save

Quest progress SHALL be kept in the save so that a reload resumes the quests in progress.

#### Scenario: Reload with quests in progress

- **GIVEN** quests are in progress
- **WHEN** the game is reloaded
- **THEN** each quest resumes at the step it was on
