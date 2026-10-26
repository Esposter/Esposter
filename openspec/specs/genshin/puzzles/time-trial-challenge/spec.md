## Purpose

A Time Trial Challenge as a timed state machine, solved by striking every target before its clock runs out. Built in the world package; not yet placed or started in the world.

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

- [ ] **A challenge is solved by striking every target before its clock runs out, as the game does** — no source yet: the frame-by-frame match of `~/Esposter.noindex/genshin-parity/captures/yt-B_l5b_KXt-o-time-trial-limit.mp4` (frames at 0 to 55 seconds) to the rule, and the wiki's Time Trial Challenge page, which is not in the genshin-wiki cache.
