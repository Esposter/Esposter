## Purpose

The game's bosses as pure rules in genshin-world. A normal boss stays defeated until its Trounce Blossom is claimed and comes back five seconds after the claim. A week's weekly-boss claims are counted from the Monday 04:00 reset on the server's clock, the count pricing each claim 30 resin for the first three and 60 after. The fights, the blossom's offer and the boss's rewards are the proposal's still. The rules are built as pure services that the world does not yet call (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`, `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`).

## Requirements

### Requirement: A normal boss returns only after its blossom is claimed

A normal boss SHALL stay defeated until its Trounce Blossom is claimed, and SHALL return five seconds after a claim.

#### Scenario: Unclaimed boss stays defeated

- **GIVEN** a normal boss is defeated and its Trounce Blossom is not claimed
- **WHEN** time passes
- **THEN** the boss stays defeated until the player teleports away

#### Scenario: Claimed boss returns five seconds later

- **GIVEN** a normal boss is defeated and its Trounce Blossom is claimed
- **WHEN** the claim is made
- **THEN** the boss returns five seconds after the claim

### Requirement: The weekly reset falls on Monday at 04:00

The weekly reset SHALL fall on Monday at 04:00 on the server's clock (id 800001, `14400;360000`).

#### Scenario: Moment before the reset belongs to the week before

- **GIVEN** a moment just before Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the week before
#### Scenario: Moment at or after the reset belongs to the new week

- **GIVEN** a moment at or after Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the new week
### Requirement: The first three weekly claims of a week are priced at 30 resin

The first three weekly-boss claims of each week SHALL cost 30 resin each, every later claim SHALL cost 60 resin, and the count SHALL cover all weekly bosses together (the export's weekly discount row, `CONST_VALUE_WEEKLY_BOSS_RESIN_DISCOUNT_PARAM`, gives three claims at 0.5).

#### Scenario: First claim of the week costs 30 resin

- **GIVEN** no weekly-boss claim has been made this week
- **WHEN** the player claims a weekly boss
- **THEN** the claim costs 30 resin
#### Scenario: Fourth claim of the week costs 60 resin

- **GIVEN** three claims have been made this week, for any weekly bosses
- **WHEN** the next claim is made
- **THEN** the claim costs 60 resin

#### Scenario: Claim at the reset counts toward the new week

- **GIVEN** a claim is made at exactly Monday 04:00
- **WHEN** it is the week's first claim
- **THEN** it counts toward the new week
## Open

- [ ] **A normal boss stays defeated until the player teleports away** — no source yet: the wiki's Normal Bosses page is not in the wiki cache.
- [ ] **A claimed normal boss returns five seconds after its claim** — no source yet: the wiki's Normal Bosses page is not in the wiki cache, and no respawn row in the game's exports holds the five seconds.
- [ ] **The weekly reset is read on the server's UTC+8 clock** — no source yet: no row of the game's exports names the zone, and the wiki's Domains page is not in the wiki cache.
- [ ] **A fourth weekly claim costs 60 resin, and the first three cost 30 each** — no source yet: the export's weekly discount row gives three claims at 0.5 but no base price of 60, and the wiki's Weekly Bosses page is not in the wiki cache.
- [ ] **The first three weekly claims count across every weekly boss together** — no source yet: the export's weekly discount row does not say the cheap claims count across bosses, and the wiki's Weekly Bosses page is not in the wiki cache.
- [ ] **A normal boss stays defeated until its Trounce Blossom is claimed** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A moment before Monday 04:00 belongs to the week before** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A moment at or after Monday 04:00 belongs to the new week** — no source yet: game data or a snapshot that holds this behaviour
- [ ] **A claim made at exactly Monday 04:00 counts toward the new week** — no source yet: game data or a snapshot that holds this behaviour
