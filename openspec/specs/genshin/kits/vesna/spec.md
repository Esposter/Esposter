## Purpose

Vesna's kit as built: her six strikes, charged attack, plunges, The Art of Victory and For the Tsaritsa!, with the timings and hitmarks provisional and Armed for Action not built.

## Requirements

### Requirement: Vila Blade Dance's six strikes

Vesna's six strikes SHALL land on provisional timings on the enemies within reach.

#### Scenario: Six strikes in sequence

- **WHEN** the player uses normal attack six times in a row
- **THEN** the six strikes land in order on provisional timings, the third with two hits

### Requirement: Vesna's charged attack and plunges

Vesna's charged attack and plunges SHALL land on the enemies within reach at provisional timings.

#### Scenario: Charged attack lands on the enemies in reach

- **WHEN** the player uses Vesna's charged attack
- **THEN** its one hit lands on the enemies within reach at a provisional timing

#### Scenario: Plunge lands on the enemies in reach

- **WHEN** the player starts a plunge attack
- **THEN** the plunge lands on the enemies within reach at a provisional timing

### Requirement: The Art of Victory

Vesna's skill SHALL deal its one hit on the enemies within reach.

#### Scenario: The Art of Victory deals one hit

- **WHEN** the player presses Vesna's skill
- **THEN** one Anemo hit lands on the enemies within reach

### Requirement: For the Tsaritsa!

Vesna's burst SHALL deal its one Spirit Blade hit on the enemies within reach.

#### Scenario: For the Tsaritsa! deals one hit

- **WHEN** the player casts Vesna's burst
- **THEN** one Anemo hit lands on the enemies within reach

### Requirement: Armed for Action not yet built

Vesna's Armed for Action form SHALL NOT take effect.

#### Scenario: Armed for Action does nothing

- **WHEN** the player uses Vesna's strikes while Armed for Action is active
- **THEN** the strikes deal Physical damage, as they do outside the form

## Open

- [ ] **The Art of Victory deals one Anemo hit** — no source yet: the Art of Victory page in `{data-root}/cache/genshin-wiki/Category_Vesna_Talents.json` gives its damage as "AoE Anemo DMG", and its one Skill DMG row is a single scaling value, not a stated hit count; no wiki page states the hit count.
- [ ] **Vesna's strikes deal Physical damage outside Armed for Action** — no source yet: the cached Vila Blade Dance page names no element for them, and gcsim has no Vesna folder. Checked the cache's Category_Vesna_Talents.json entries: Vila Blade Dance's infobox and advanced properties name no element, and The Art of Victory's Armed for Action text names Anemo only inside that form; no cached page says Physical.
