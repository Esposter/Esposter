## Purpose

Genshin's investigation spots as built: the daily cap of a hundred investigations, after which no more spawn, read as a pure, tested rule.

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

The investigation count SHALL be the one kept from the game's daily reset at four in the morning in the game's time zone.

#### Scenario: Investigations before the reset do not count toward the new day

- **GIVEN** investigations were made before the daily reset
- **WHEN** the game day begins at the reset
- **THEN** the count the cap compares is taken from the reset onward

## Open

- [ ] **The daily cap is one hundred investigations** — no source yet: no decoded table or cached wiki page holds the cap, since the Investigation page is not in `{data-root}/cache/genshin-wiki/`, and the dump's ManualTextMap, Gadget and Quest tables and its English text name no cap.
- [ ] **The reset is read in the game's time zone, `Asia/Shanghai`** — no source yet: the English text gives the reset as "4:00 AM ({TIMEZONE})" without naming the zone; the English text holds only the placeholder "{TIMEZONE}", and every offset it gives is UTC+8 (`{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`, line 67895, a store notice, among them), which names no zone.
- [ ] **The Mysterious Conch spots near Takashi are exempt from the cap** — no source yet: the Investigation wiki page's note that they "do not count towards the daily cap", which is not in `{data-root}/cache/genshin-wiki/`; the built rule has no exemption, and `design.md` names the gap; the English text names the "Mysterious Conch" (`{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`, line 200916) but no exemption.
