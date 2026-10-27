## Purpose

Genshin's mining outcrops as built — the Adventure Rank that opens them, and the rule that a mined outcrop is gone until the next day's draw at 04:00 in the game's time zone, read as pure, tested functions (`packages/genshin-world/src/services/leyLine/checkIsMiningOutcropStanding.ts`, with `packages/genshin-world/src/services/leyLine/checkIsMiningOutcropStanding.test.ts` and `packages/genshin-world/src/services/leyLine/checkIsMiningOutcropOpen.test.ts` beside it). Their places, their draw and the reputation search that marks them are the proposal's still.

## Requirements

### Requirement: Opened at Adventure Rank 30

Mining outcrops SHALL be drawn for a player at Adventure Rank 30 or above.

#### Scenario: Below rank 30

- **WHEN** a player is below Adventure Rank 30
- **THEN** no mining outcrop is drawn

#### Scenario: Rank 30

- **WHEN** a player reaches Adventure Rank 30
- **THEN** mining outcrops are drawn

### Requirement: Mined outcrop returns at the next 04:00

A mined outcrop SHALL come back at the first 04:00 in UTC+8 strictly after the mining.

#### Scenario: Mined before the day's draw

- **WHEN** an outcrop is mined at 03:59 in UTC+8
- **THEN** it comes back at 04:00 the same day

#### Scenario: Mined at the day's draw

- **WHEN** an outcrop is mined at 04:00 in UTC+8
- **THEN** it comes back at 04:00 the next day

### Requirement: Standing until its respawn

An outcrop never mined SHALL stand, a mined outcrop SHALL be gone until its respawn, and it SHALL stand again from that respawn.

#### Scenario: Mined outcrop before its respawn

- **WHEN** a mined outcrop is checked before its respawn
- **THEN** it is gone

#### Scenario: Mined outcrop after its respawn

- **WHEN** a mined outcrop is checked at or after its respawn
- **THEN** it stands again

### Requirement: Not yet placed in the world

Mining outcrops SHALL not be placed, drawn, mined or marked in the world yet.

#### Scenario: Entering a region

- **WHEN** a player enters a region
- **THEN** no mining outcrop is drawn

## Open

- [ ] **Adventure Rank 30 opens the mining outcrops** — no source yet: the Mining Outcrop wiki page, which the note says gives Magical Crystal Chunks' absence before Adventure Rank 30, is not on disk; whether the outcrops themselves are withheld below the rank is unchecked, and the rank is only the code's constant.
