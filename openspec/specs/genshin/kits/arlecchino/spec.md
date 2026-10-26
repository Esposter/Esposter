## Purpose

Arlecchino's kit as built: her six strikes, charged attack, collision and two plunges, All Is Ash's Spike and Cleave and Balemoon Rising, with Constellation 6's CRIT on her Normal Attacks and Balemoon Rising built, and Bond of Life, the Blood-Debt Directive, her HP-debt heal, Constellations 1, 2 and 4 and Constellation 6's added DMG not built.

## Requirements

### Requirement: Arlecchino's six strikes deal physical damage at their hitmarks

Arlecchino's six strikes SHALL deal physical damage (`attack.go:123`), each strike's reach SHALL be its offset from her body plus its radius, and her fourth strike SHALL deal two hits at 24 and 35 frames (`attack.go:18`).

#### Scenario: The fourth strike lands two hits

- **GIVEN** Arlecchino performs her fourth strike
- **WHEN** its animation plays through
- **THEN** it deals its first hit at 24 frames and its second at 35 frames (`attack.go:18`)

#### Scenario: A strike reaches its offset and radius

- **GIVEN** Arlecchino performs a strike with an offset hitbox
- **WHEN** the strike is checked for enemies in reach
- **THEN** enemies within the offset plus the radius are struck

### Requirement: Arlecchino's charged attack costs 25 stamina and strikes at 37 frames

Arlecchino's charged attack SHALL strike at 37 frames of its 60 frame animation (`charge.go:14`, `:17`) and SHALL cost 25 stamina (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`, group 9631 index 7).

#### Scenario: The charged attack costs stamina when performed

- **GIVEN** Arlecchino has at least 25 stamina (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`, group 9631 index 7)
- **WHEN** she performs her charged attack
- **THEN** 25 stamina is spent (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`, group 9631 index 7)

### Requirement: Arlecchino's plunges land at 47 and 48 frames with their poise

Arlecchino's low and high plunges SHALL land at 47 and 48 frames with poise of 100 and 150, and her collision SHALL be queued 41 frames into a plunge (`plunge.go:21`, `:22`, `:27`, `:32`, `:23`).

#### Scenario: The high plunge carries more poise than the low plunge

- **GIVEN** Arlecchino performs a low plunge and then a high plunge
- **WHEN** each plunge lands
- **THEN** the high plunge carries the greater poise

### Requirement: Balemoon Rising strikes once at 110 frames and costs 60 energy

Balemoon Rising SHALL strike once at 110 frames of its 146 frame animation (`burst.go:13`, `:20`), SHALL cost 60 energy (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`, group 9639 index 5) and SHALL have a cooldown of 15 seconds (`burst.go:55`).

#### Scenario: Balemoon Rising is refused without enough energy

- **GIVEN** Arlecchino has less than 60 energy (`~/Esposter.noindex/genshin-dump-backup-6.6/ExcelBinOutput/ProudSkillExcelConfigData.json`, group 9639 index 5)
- **WHEN** she tries to use Balemoon Rising
- **THEN** the burst is not used

#### Scenario: Balemoon Rising strikes at 110 frames

- **GIVEN** Arlecchino uses Balemoon Rising
- **WHEN** the animation reaches 110 frames (`burst.go:13`)
- **THEN** it strikes once

#### Scenario: Balemoon Rising goes on cooldown

- **GIVEN** Arlecchino has just used Balemoon Rising
- **WHEN** the burst is checked again within 15 seconds (`burst.go:55`)
- **THEN** it is not available

### Requirement: Balemoon Rising resets her skill's cooldown

Balemoon Rising SHALL reset Arlecchino's skill cooldown 107 frames after it starts (`burst.go:43`), so the skill is ready again at that point.

#### Scenario: her burst resets her skill's cooldown 107 frames after it starts

- **GIVEN** Arlecchino's skill is on cooldown
- **WHEN** Balemoon Rising's animation reaches 107 frames (`burst.go:43`)
- **THEN** her skill's cooldown is zero

### Requirement: Arlecchino's skill has a cooldown of 30 seconds

Arlecchino's elemental skill SHALL have a cooldown of 30 seconds (`skill.go:67`).

#### Scenario: The skill cannot be used again within its cooldown

- **GIVEN** Arlecchino has just used her skill
- **WHEN** she tries to use it again within 30 seconds (`skill.go:67`)
- **THEN** the skill is not available

### Requirement: Constellation 6 raises her Normal Attack and Balemoon Rising CRIT for 20 seconds after All Is Ash

From Constellation 6, Arlecchino's Normal Attacks and Balemoon Rising SHALL have 10% more CRIT Rate and 70% more CRIT DMG for 20 seconds after she uses All Is Ash, and that bonus SHALL start at most once every 15 seconds (`cons.go:99`, `:102`, `:103`, `:105`, `:107` to `:110`).

#### Scenario: A Normal Attack gains CRIT after All Is Ash

- **GIVEN** Arlecchino has Constellation 6 and has just used All Is Ash
- **WHEN** she lands a Normal Attack within 20 seconds
- **THEN** the strike has 10% more CRIT Rate and 70% more CRIT DMG (`cons.go:102`, `:103`)

#### Scenario: Balemoon Rising gains CRIT while the bonus runs

- **GIVEN** Arlecchino has Constellation 6 and her bonus is running
- **WHEN** Balemoon Rising strikes
- **THEN** the strike has 10% more CRIT Rate and 70% more CRIT DMG (`cons.go:102`, `:103`)

#### Scenario: The bonus starts at most once every 15 seconds

- **GIVEN** the bonus started less than 15 seconds ago
- **WHEN** Arlecchino uses All Is Ash again
- **THEN** the bonus is not restarted, and runs out 20 seconds after it first started

#### Scenario: Below Constellation 6 no CRIT is gained

- **GIVEN** Arlecchino has Constellation 5 and has just used All Is Ash
- **WHEN** she lands a Normal Attack
- **THEN** the strike gains no CRIT from Constellation 6
