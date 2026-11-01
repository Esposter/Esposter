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

## Open

- [ ] **A challenge is solved by striking every target before its clock runs out, as the game does** — contradicted by `{data-root}/genshin-parity/captures/yt-B_l5b_KXt-o-time-trial-limit.mp4` at about 0 s: the banner reads "Open the chest in 45s" with the clock at 42 s, and "Challenge Completed" shows with the chest's rewards at about 44 s; the wiki's Time Trial Challenge page is cited in the design's Sources.
