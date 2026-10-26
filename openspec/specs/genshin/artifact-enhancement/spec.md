## Purpose

An artifact rolled, enhanced and locked as the game does it: a drop's main and minor affixes drawn by the game's pools and the wiki's weights, Artifact EXP fed from materials and fodder at a Mora a point with its chance of double or five times, a minor affix added or raised at every fourth level, and the locks that keep a fodder safe. A set's bonus that waits on combat is a module of its set's answering the kits' events, Instructor's, The Exile's, Traveling Doctor's, Berserker's and Lucky Dog's and Adventurer's four-pieces built.

## Requirements

### Requirement: A new artifact's main affix comes from its slot

A new artifact's main affix SHALL be drawn from the attributes its slot may carry, in proportion to the game's weights. (a Plume's depot 2000 holds only flat ATK, in `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/ReliquaryMainPropExcelConfigData.json`).

#### Scenario: Plume of Death rolls flat ATK

- **GIVEN** a Plume of Death drops
- **WHEN** its main affix is drawn
- **THEN** the main affix is flat ATK

#### Scenario: Attribute without weight is never drawn

- **GIVEN** an attribute has no weight for a slot
- **WHEN** main affixes are drawn for that slot many times
- **THEN** that attribute is never the main affix

### Requirement: Minor affixes come from the rarity's pool without repeats

A new artifact's minor affixes SHALL be drawn from its rarity's pool, never repeating its main affix or an attribute it already holds.

#### Scenario: Plume may roll percentage ATK but not flat ATK

- **GIVEN** a Plume of Death with flat ATK as its main affix
- **WHEN** its minor affixes are drawn
- **THEN** it may roll ATK% as a minor affix
- **AND** it never rolls flat ATK as a minor affix

#### Scenario: Starting minor affixes match the drop

- **GIVEN** a drop gives its piece a starting count of minor affixes
- **WHEN** the artifact is created
- **THEN** it starts with that many minor affixes

#### Scenario: Minor affix value is one of its tiers

- **GIVEN** a minor affix is drawn
- **WHEN** its value is set
- **THEN** the value is one of the tiers of that affix

### Requirement: Enhancing costs Mora per EXP point and the recovered share is free

The Mora an enhancement costs SHALL be one for each point of EXP its materials give and each fodder's base EXP, and the recovered share of a fodder's levelling SHALL cost nothing.

#### Scenario: Recovered share of a fodder costs no Mora

- **GIVEN** a fodder is fed to an artifact
- **WHEN** the enhancement is priced
- **THEN** the fodder's recovered share of its levelling adds no Mora cost

#### Scenario: Insufficient Mora refuses the enhancement

- **GIVEN** the player's wallet holds less Mora than the enhancement costs
- **WHEN** the enhancement is confirmed
- **THEN** the enhancement is refused
- **AND** the bag is left as it was

### Requirement: Each enhancement's EXP has a chance of a bonus

Each enhancement's EXP SHALL be multiplied by five one time in a hundred, by two nine times in a hundred, and otherwise left as it is.

#### Scenario: Five-times bonus

- **GIVEN** an enhancement's bonus draw lands on the five-times share
- **WHEN** the EXP is applied
- **THEN** the artifact gains five times the EXP fed

#### Scenario: Two-times bonus

- **GIVEN** an enhancement's bonus draw lands on the two-times share
- **WHEN** the EXP is applied
- **THEN** the artifact gains twice the EXP fed

#### Scenario: Mora is charged before the bonus

- **GIVEN** an enhancement earns a five-times bonus
- **WHEN** the Mora is charged
- **THEN** the charge is the figure before the bonus is applied

### Requirement: Levels follow the table and EXP past the top is lost

An artifact's level SHALL rise as far as its EXP reaches the table's costs, and EXP beyond its highest level SHALL be lost. (each level's `exp` in `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/ReliquaryLevelExcelConfigData.json`).

#### Scenario: EXP past the highest level is wasted

- **GIVEN** an artifact at its highest level
- **WHEN** further EXP is fed
- **THEN** the artifact stays at its highest level
- **AND** the EXP beyond it is lost

### Requirement: Every fourth level adds or raises a minor affix

Each fourth level an artifact passes SHALL add a minor affix to an artifact holding fewer than four, or raise one of its four minor affixes. (`addPropLevels` 5, 9, 13, 17 and 21 in `~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/ReliquaryExcelConfigData.json`).

#### Scenario: Fewer than four minor affixes gains one

- **GIVEN** an artifact with three minor affixes
- **WHEN** it passes a fourth level
- **THEN** it gains one further minor affix from those it lacks

#### Scenario: Four minor affixes raises one

- **GIVEN** an artifact with four minor affixes
- **WHEN** it passes a fourth level
- **THEN** one of its minor affixes is raised by a tier, chosen evenly

### Requirement: A locked artifact is never used as fodder

A locked artifact SHALL never be used as fodder for another artifact.

#### Scenario: Locked artifact refused as fodder

- **GIVEN** an artifact is locked
- **WHEN** the player feeds it as fodder
- **THEN** the feed is refused

#### Scenario: Worn artifact is not offered as fodder

- **GIVEN** an artifact is worn by a character
- **WHEN** the fodder list is shown
- **THEN** the worn artifact is not in it

### Requirement: Instructor's four-piece gives the team Elemental Mastery on a reaction

A reaction the Instructor's wearer triggers on the field SHALL give every deployed member of the team the bonus's Elemental Mastery for its seconds, restarted rather than stacked. (`~/Esposter.noindex/genshin-parity/text/TextMap/TextMap_MediumEN.json`, affix 2100071: EM 120 for 8s).

#### Scenario: Reaction on the field gives the team the buff

- **GIVEN** the Instructor's wearer is on the field
- **WHEN** the wearer triggers a reaction
- **THEN** every deployed team member gains the bonus's Elemental Mastery for its seconds

#### Scenario: Repeated reaction restarts the buff

- **GIVEN** the Elemental Mastery buff is active
- **WHEN** another reaction is triggered by the wearer
- **THEN** the buff restarts rather than stacking

#### Scenario: Summon's reaction after the wearer leaves gives nothing

- **GIVEN** the wearer has left the field
- **WHEN** the wearer's summon triggers a reaction
- **THEN** no Elemental Mastery is given

### Requirement: The Exile's four-piece regenerates the others' energy after a burst

A burst the wearer of The Exile's four-piece uses SHALL start a field that gives every other deployed member energy at three ticks, two seconds apart. (`~/Esposter.noindex/genshin-parity/text/TextMap/TextMap_MediumEN.json`, affix 2100091: 2 Energy every 2s for 6s).

#### Scenario: Burst starts the energy field

- **GIVEN** The Exile's wearer uses a burst
- **WHEN** the field's ticks come
- **THEN** each other deployed member gains two energy at each of the three ticks
- **AND** that energy is not raised by Energy Recharge

#### Scenario: A running field starts no second one

- **GIVEN** an energy field is still ticking
- **WHEN** any wearer uses another burst
- **THEN** no second field starts (gcsim ``~/Esposter.noindex/cache/gcsim-v2.47.2/internal/artifacts/exile/exile.go`, lines 50 to 54`).

### Requirement: Traveling Doctor's four-piece heals its wearer as its burst is used

A burst the wearer of Traveling Doctor's four-piece uses SHALL restore the wearer twenty percent of its Max HP, raised by the wearer's Healing Bonus. (`~/Esposter.noindex/genshin-parity/text/TextMap/TextMap_MediumEN.json`, affix 2100131: 20% of Max HP).

#### Scenario: Burst restores the wearer

- **GIVEN** Traveling Doctor's wearer uses a burst
- **WHEN** the burst is used
- **THEN** the wearer is restored twenty percent of its Max HP

#### Scenario: Incoming Healing Bonus raises the restore

- **GIVEN** the wearer has an Incoming Healing Bonus
- **WHEN** the restore is applied
- **THEN** the restore is raised by that bonus

### Requirement: Berserker's four-piece raises CRIT Rate at low HP

While the wearer of Berserker's four-piece has HP below seventy percent of its Max HP, the wearer SHALL gain 24% CRIT Rate. (`~/Esposter.noindex/genshin-parity/text/TextMap/TextMap_MediumEN.json`, affix 2100051).

#### Scenario: Low HP adds the CRIT Rate

- **GIVEN** the wearer's HP is below seventy percent of its Max HP
- **WHEN** its hits are priced
- **THEN** the wearer's CRIT Rate includes the bonus's 24%

#### Scenario: Healthy HP adds nothing

- **GIVEN** the wearer's HP is seventy percent of its Max HP or more
- **WHEN** its hits are priced
- **THEN** no CRIT Rate is added by the bonus

### Requirement: Adventurer's four-piece restoration

The wearer of four Adventurer's pieces SHALL have HP restored by 6% of its maximum each second for 5 seconds when a chest is opened. (`~/Esposter.noindex/genshin-parity/text/TextMap/TextMap_MediumEN.json`, affix 2100101: 30% over 5s, 6% of Max HP a second).

#### Scenario: a chest opened by a four-piece wearer restores HP for five seconds

- **GIVEN** a character wearing four Adventurer's pieces with HP below its maximum
- **WHEN** a chest is opened in the world
- **THEN** the character's HP is restored by 6% of its maximum each second

#### Scenario: the restoration stops after five seconds

- **GIVEN** a character whose HP is being restored by Adventurer's four-piece bonus
- **WHEN** five seconds pass after the chest was opened
- **THEN** the restoration stops

#### Scenario: a chest opened in the world reaches the combat

- **GIVEN** a character wearing four Adventurer's pieces is in combat
- **WHEN** a chest is opened in the world
- **THEN** the restoration reaches that character's combat

#### Scenario: a wearer of fewer than four pieces is not restored

- **GIVEN** a character wearing two Adventurer's pieces
- **WHEN** a chest is opened in the world
- **THEN** the character's HP is not restored by the set's bonus

### Requirement: Restoration applies only to the wearer

The Adventurer's four-piece restoration SHALL apply only to the character wearing the set.

#### Scenario: another party member without the set is not restored

- **GIVEN** a party in which one character wears four Adventurer's pieces and another wears none
- **WHEN** a chest is opened in the world
- **THEN** only the character wearing the set has its HP restored

## Open

- [ ] **Each enhancement's EXP is multiplied by five at one in a hundred and by two at nine in a hundred** — no source yet: the wiki's Artifact EXP page is not in the cache, and no dump table holds the chance.
- [ ] **Enhancing costs one Mora per EXP point, and a fodder's recovered share costs none** — no source yet: the wiki's Artifact EXP page is not in the cache.
- [ ] **EXP past the highest level is lost** — no source yet: the wiki's Artifact page is not in the cache.
- [ ] **The main affix weights are the wiki's, and each minor affix tier is as likely as the next** — no source yet: the Artifact/Distribution page is not in the cache.
- [ ] **A locked artifact is never fodder** — no source yet: no cached wiki page or capture shows a lock refusing fodder.
- [ ] **Instructor's buff restarts rather than stacks, and gives nothing for a summon's reaction after the wearer leaves** — no source yet: the wiki's Instructor page is not in the cache.
- [ ] **The Exile's energy is not raised by Energy Recharge** — no source yet: the wiki's The Exile page is not in the cache, and the game's text says only that the effect cannot stack.
- [ ] **Traveling Doctor's restore is raised by the Healing Bonuses** — no source yet: the wiki's Healing Bonus page is not in the cache.
