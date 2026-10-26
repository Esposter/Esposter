## Purpose

Clorinde's kit as built, with her five strikes, her charged attack, Last Lightfall's five strikes and her plunges, and what is left of Hunter's Vigil's Night Vigil stance, her Bond of Life and her constellations, the sixth's crit buff included (`packages/genshin-world/src/services/kit/characters/clorindeKit.ts`, which leaves Constellations 1, 2 and 4 unbuilt).

## Requirements

### Requirement: Normal attack chain

Clorinde's normal attacks SHALL be five strikes, the fourth striking three boxes in front of her and the fifth striking a single circle (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/attack.go` line 20).

#### Scenario: Strike chain plays five strikes in order

- **GIVEN** Clorinde is the character on the field
- **WHEN** the player presses the attack button repeatedly
- **THEN** her five strikes play in order
- **AND** the fourth strike hits three boxes in front of her (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/attack.go` line 20)

### Requirement: Charged attack

Clorinde's charged attack SHALL hit a circle round her (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/charge.go` lines 15 and 42 to 44) and SHALL cost 20 stamina (`~/Esposter/cache/genshin-wiki/Category_Clorinde_Talents.json`, Attribute Scaling's `stamina=20`).

#### Scenario: Charged attack hits the circle round her

- **GIVEN** Clorinde has 20 stamina
- **WHEN** the player holds the attack button to charge
- **THEN** the charged attack hits the circle round her at 38 frames, in an animation of 68 frames (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/charge.go` lines 14 and 19)
- **AND** 20 stamina is spent

### Requirement: Last Lightfall

Last Lightfall SHALL strike five times at 97, 103, 109, 115 and 121 frames of its 128-frame animation (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/burst.go` lines 15 and 23), and SHALL be refused without the energy it costs.

#### Scenario: Last Lightfall strikes five times

- **GIVEN** Clorinde has enough energy
- **WHEN** the player casts Last Lightfall
- **THEN** its five strikes land at 97, 103, 109, 115 and 121 frames (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/burst.go` line 15)

#### Scenario: Last Lightfall is refused without enough energy

- **GIVEN** Clorinde has less energy than the burst costs
- **WHEN** the player casts Last Lightfall
- **THEN** it does not cast

### Requirement: Hunter's Vigil press

Pressing Hunter's Vigil SHALL play its 33-frame animation (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/skill.go` line 31) and start a 16-second cooldown (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/skill.go` line 27), dealing no damage.

#### Scenario: Pressing Hunter's Vigil plays its animation

- **GIVEN** Clorinde is the character on the field
- **WHEN** the player presses Hunter's Vigil
- **THEN** its 33-frame animation plays and a 16-second cooldown starts (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/skill.go` lines 27 and 31)
- **AND** no damage is dealt

#### Scenario: A press during the cooldown does nothing

- **GIVEN** Hunter's Vigil was pressed less than 16 seconds ago (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/skill.go` line 27)
- **WHEN** the player presses it again
- **THEN** it does not cast

### Requirement: Poise from normal attacks and plunges

Clorinde's normal attacks and plunges SHALL deal poise, as the wiki gives it (`~/Esposter/cache/genshin-wiki/Category_Clorinde_Talents.json`, Advanced Properties: normal attacks 24.234 to 94.2, Low Plunge 100, High Plunge 150), and her plunges SHALL land as their action starts, provisional until a recording settles it.

#### Scenario: A normal attack deals poise

- **GIVEN** Clorinde is the character on the field
- **WHEN** one of her normal attacks hits an enemy
- **THEN** the enemy takes that hit's poise, which the wiki gives per hit (`~/Esposter/cache/genshin-wiki/Category_Clorinde_Talents.json`, Advanced Properties)

#### Scenario: A plunge lands as its action starts

- **WHEN** the player plunges from the air
- **THEN** the plunge lands as its action starts, a provisional timing

### Requirement: Sixth constellation raises her crit after Hunter's Vigil

From her sixth constellation, Hunter's Vigil SHALL raise Clorinde's CRIT Rate by 10% and her CRIT DMG by 70% for 12 seconds (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/cons.go` lines 19, 121 and 131).

#### Scenario: Hunter's Vigil raises her crit from the sixth constellation

- **GIVEN** Clorinde has six constellations
- **WHEN** the player uses Hunter's Vigil
- **THEN** her CRIT Rate and CRIT DMG are raised for 12 seconds (`~/Esposter/cache/gcsim-v2.47.2/internal/characters/clorinde/cons.go` line 19)

#### Scenario: Below the sixth constellation Hunter's Vigil raises no crit

- **GIVEN** Clorinde has five constellations
- **WHEN** the player uses Hunter's Vigil
- **THEN** her CRIT Rate and CRIT DMG are unchanged

## Open

- [ ] **Clorinde's normal attacks and plunges deal no poise** — contradicted by `~/Esposter/cache/genshin-wiki/Category_Clorinde_Talents.json`: wiki gives normal attacks poise 24.234 to 94.2, plunges 100 and 150.
- [ ] **Her plunges land as their action starts** — no source yet: no Clorinde plunge recording is in `~/Esposter/genshin-parity/captures/`, and gcsim's clorinde package holds plunge damage tables but no plunge timing.
