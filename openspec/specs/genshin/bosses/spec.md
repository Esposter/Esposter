## Purpose

The game's bosses as pure rules in genshin-world. A normal boss stays defeated until its Trounce Blossom is claimed and comes back five seconds after the claim. A week's weekly-boss claims are counted from the Monday 04:00 reset on the server's clock, the count pricing each claim 30 resin for the first three and 60 after. The fights, the blossom's offer and the boss's rewards are the proposal's still. The rules are built as pure services that the world calls: the enemies' respawn check reads the boss rule, and the claim composable reads the weekly count (`packages/genshin-world/src/services/bosses/computeBossRespawnTime.ts`, `packages/genshin-world/src/services/weekly/countWeeklyClaims.ts`).

## Requirements

### Requirement: A normal boss stays defeated until its blossom is claimed

A normal boss SHALL stay defeated until its Trounce Blossom is claimed. The wiki's Normal Boss page says an unclaimed blossom keeps the boss defeated unless the player teleports out of the area (`{data-root}/cache/genshin-wiki/Page_Normal_Boss.json`, wikitext line 16).

#### Scenario: Unclaimed boss stays defeated

- **GIVEN** a normal boss is defeated and its Trounce Blossom is not claimed
- **WHEN** time passes
- **THEN** the boss stays defeated until the player teleports away

### Requirement: A normal boss returns five seconds after its blossom is claimed

A normal boss SHALL return five seconds after a claim.

#### Scenario: Claimed boss returns five seconds later

- **GIVEN** a normal boss is defeated and its Trounce Blossom is claimed
- **WHEN** the claim is made
- **THEN** the boss returns five seconds after the claim

### Requirement: The weekly reset falls on Monday at 04:00

The weekly reset SHALL fall on Monday at 04:00 on the server's clock.

#### Scenario: Moment before the reset belongs to the week before

- **GIVEN** a moment just before Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the week before

#### Scenario: Moment at or after the reset belongs to the new week

- **GIVEN** a moment at or after Monday 04:00 on the server's clock
- **WHEN** the week is worked out
- **THEN** the moment belongs to the new week

### Requirement: The first three weekly claims of a week are priced at 30 resin

The first three weekly-boss claims of each week SHALL cost 30 resin each.

Every later claim SHALL cost 60 resin, and the count SHALL cover all weekly bosses together. The wiki's Weekly Boss page prices the first three claims, for any weekly bosses the player chooses, at 30 resin and each later one at 60 (`{data-root}/cache/genshin-wiki/Page_Weekly_Boss.json`, wikitext line 5), and its Domain page says the same (`{data-root}/cache/genshin-wiki/Page_Domain.json`, wikitext line 50).

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

- [ ] **A claimed normal boss returns five seconds after its claim** — no source yet: the wiki's Normal Boss page says the boss returns "in roughly 5 seconds" (`{data-root}/cache/genshin-wiki/Page_Normal_Boss.json`, wikitext line 16), and no respawn row in the game's exports holds a figure; a recording of a claimed boss's respawn would settle the exact five seconds.
- [ ] **The weekly reset is read on the server's UTC+8 clock** — no source yet: the wiki's Reset page says the reset follows "the player's server's time zone" with no offset (`{data-root}/cache/genshin-wiki/Page_Reset.json`, wikitext line 3), and the game's text writes that zone as a placeholder (`{data-root}/genshin-dump-backup-6.6/TextMap/TextMap_MediumEN.json`, line 9072); a capture of the in-game "Query Server Time Zone" screen on an Asia-server account would settle it.
