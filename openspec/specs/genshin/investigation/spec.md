## Purpose

Genshin's investigation spots as built — the daily cap of a hundred investigations, after which no more spawn, read as a pure, tested rule. The spots, their places and the artifacts, ingredients, ores or Mora they give are the proposal's still.

## Requirements

### Requirement: Investigation spots stop spawning at a daily cap of one hundred

Investigation spots SHALL keep spawning only while fewer than one hundred investigations have been made in the game day, and SHALL spawn no more once the cap is reached.

#### Scenario: Spots spawn below the cap

- **GIVEN** fewer than one hundred investigations have been made in the game day
- **WHEN** the spawn rule is checked
- **THEN** more spots spawn

#### Scenario: No spot spawns at the cap

- **GIVEN** one hundred investigations have been made in the game day
- **WHEN** the spawn rule is checked
- **THEN** no more spots spawn

### Requirement: The game day starts at the daily reset

The investigation count SHALL be the one kept from the game's daily reset at four in the morning in the game's time zone (the English text gives the reset as "4:00 AM ({TIMEZONE})").

#### Scenario: Investigations before the reset do not count toward the new day

- **GIVEN** investigations were made before the daily reset
- **WHEN** the game day begins at the reset
- **THEN** the count the cap compares is taken from the reset onward

## Open

- [ ] **The daily cap is one hundred investigations** — no source yet: no decoded table or cached wiki page holds the cap, since the Investigation page is not in `~/Esposter.noindex/cache/genshin-wiki/`.
- [ ] **The reset is read in the game's time zone, `Asia/Shanghai`** — no source yet: the English text gives the reset as "4:00 AM ({TIMEZONE})" without naming the zone.
- [ ] **The Mysterious Conch spots near Takashi are exempt from the cap** — no source yet: the Investigation wiki page's note that they "do not count towards the daily cap", which is not in `~/Esposter.noindex/cache/genshin-wiki/`; the built rule has no exemption, and `design.md` names the gap.
