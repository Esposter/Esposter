## Purpose

A Time Trial Challenge as a timed state machine, solved by striking every target before its clock runs out. Built in the world package and placed in the world, each marker starting its challenge once the character reaches it.

## Requirements

### Requirement: A challenge's clock starts when it is started at its marker

A time trial challenge SHALL start its clock when it is started from its marker.

#### Scenario: Challenge started at its marker

- **GIVEN** an idle time trial challenge at its marker
- **WHEN** the challenge is started
- **THEN** its clock starts running

### Requirement: A challenge is solved when its last target is struck

A running challenge SHALL be solved when its last target is struck before its clock runs out.

#### Scenario: Last target struck in time

- **GIVEN** a running challenge with one target left
- **WHEN** that target is struck
- **THEN** the challenge is solved

### Requirement: A challenge fails when its clock runs out first

A running challenge SHALL fail when its clock runs out before its last target is struck.

#### Scenario: Clock runs out

- **GIVEN** a running challenge with targets still to strike
- **WHEN** its clock runs out
- **THEN** the challenge fails

## Sources

- [Time Trial Challenge](https://genshin-impact.fandom.com/wiki/Time_Trial_Challenge), Genshin Impact Wiki, cached at `{data-root}/cache/genshin-wiki/Page_Time_Trial_Challenge.json`, line 11: a challenge gives its reward for "completing the task within an allocated time limit"; its Aiming type blows up X barrels or bubbles and its Battling type defeats all opponents, each "within X second(s)" (lines 64 and 69), and its Traversing type collects particles rather than striking targets (line 75).
