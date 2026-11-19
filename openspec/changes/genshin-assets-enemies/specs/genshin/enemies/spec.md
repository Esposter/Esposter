## MODIFIED Requirements

### Requirement: A defeated enemy drops Mora, Character EXP and materials by its level band

An enemy whose health reaches zero SHALL be defeated and drop Character EXP by its level band, and the Mora and materials its drop family gives by that band when its kind is on a drop family.

#### Scenario: A defeated common enemy drops by its level band

- **GIVEN** a common enemy at a level whose kind is on a drop family
- **WHEN** it is defeated
- **THEN** it drops Character EXP and the Mora and materials its family's table gives, by its level's band (the family is the first Drops Table the kind's wiki article lists, and the family's table is its row of the wiki's Enemies table, `{cache-root}/genshin-wiki/Page_Module:Drops_Table%2Fdata.json`, both published as `enemies/dropFamilies` and `enemies/dropFamilyKinds`; `packages/genshin-world/src/services/enemy/constants.ts`'s `COMMON_ENEMY_MORA_SHARES` through `ELITE_ENEMY_CHARACTER_EXPERIENCES` hold the band shares, and `computeEnemyDrops` in `packages/genshin-world/src/services/enemy/computeEnemyDrops.ts` takes the band)

#### Scenario: A defeated enemy with no drop family drops no Mora or materials

- **GIVEN** a common enemy at a level whose kind is on no drop family
- **WHEN** it is defeated
- **THEN** it drops its band's Character EXP and no Mora and no materials
