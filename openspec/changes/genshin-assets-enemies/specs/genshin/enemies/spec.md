## MODIFIED Requirements

### Requirement: A defeated enemy drops Mora, Character EXP and materials by its level band

An enemy whose health reaches zero SHALL be defeated and drop Character EXP by its level band, and the Mora and materials its drop family gives by that band when its kind is on a drop family.

#### Scenario: A defeated common enemy drops its family's Mora and materials

- **GIVEN** a common enemy at a level whose kind is on a drop family
- **WHEN** it is defeated
- **THEN** it drops Character EXP and the Mora and materials its family's table gives, by its level's band

#### Scenario: A defeated enemy with no drop family drops no Mora or materials

- **GIVEN** a common enemy at a level whose kind is on no drop family
- **WHEN** it is defeated
- **THEN** it drops its band's Character EXP and no Mora and no materials
