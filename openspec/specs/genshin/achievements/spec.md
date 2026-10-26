## Purpose

Genshin's achievements as built. Each is a counter of one doing the game's table names, a quest or a parent quest finished, counted to its count and paid in Primogems once finished, its tier before it chained by the table. The Achievements screen lists the categories with how many of each are finished and opens from the Paimon menu. The reader publishes the table and every title in fifteen languages from the community's data dump to the game data (`scripts/src/services/genshinAssets/achievements/buildAchievementText.ts`), and the other trigger types wait on the pages that record their doings.

## Requirements

### Requirement: Achievements list under their categories

The achievement list SHALL show every kept achievement under its category in the game's order, each with its count and the Primogems it pays (`packages/genshin-world/src/components/Achievement/Screen/Index.vue`, which sorts by `orderId`).

#### Scenario: Category lists its achievements in order

- **GIVEN** the Achievements screen is open
- **WHEN** a category is selected
- **THEN** its achievements are listed in the game's order
- **AND** each shows its title, its description, its count when that is more than one, and its Primogems (`packages/genshin-world/src/components/Achievement/Screen/Index.vue`)

#### Scenario: Hidden achievement reads as a question mark

- **GIVEN** a hidden achievement is not yet finished
- **WHEN** its category is listed
- **THEN** the achievement reads "?" in place of its title and description (`packages/genshin-world/src/components/Achievement/Screen/Index.vue`)
- **AND** it shows its real title and description once it is finished

### Requirement: Titles and descriptions follow the chosen language

Each achievement and category name SHALL be shown in the language the player has chosen, with English where that language lacks a text (`packages/genshin-world/src/services/achievement/AchievementTextLoaderMap.ts`; `scripts/src/services/genshinText/buildTextChunks.ts`).

#### Scenario: Words show in the chosen language

- **GIVEN** the player has chosen a language
- **WHEN** the Achievements screen opens
- **THEN** every title, description and category name is shown in that language
- **AND** only that language's words are fetched (`packages/genshin-world/src/services/data/createTextLoaderMap.ts`)

#### Scenario: Missing text falls back to English

- **GIVEN** the chosen language has no text for an achievement
- **WHEN** the achievement is shown
- **THEN** its English text is shown instead (`scripts/src/services/genshinText/buildTextChunks.ts`)

### Requirement: A finished quest counts toward matching achievements

A finished quest or parent quest SHALL count once toward each watched achievement that names it, up to that achievement's count (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`; `packages/genshin-world/src/services/quest/getFinishedQuestEvents.ts`).

#### Scenario: Finished quest raises a matching achievement

- **GIVEN** an achievement that watches a quest and is not yet at its count
- **WHEN** that quest is finished
- **THEN** the achievement's progress rises by one (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`)

#### Scenario: Finished achievement is not counted again

- **GIVEN** an achievement that is already finished
- **WHEN** the doing it watches happens again
- **THEN** its progress does not move (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`)

#### Scenario: Tier waits for the tier before it

- **GIVEN** an achievement whose tier before it is not yet finished
- **WHEN** a doing names it
- **THEN** its progress does not move yet (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`)

#### Scenario: Achievement naming a missing quest stays at zero

- **GIVEN** an achievement names a sub-quest that the game data does not carry
- **WHEN** the doing happens
- **THEN** its progress stays at zero (`~/Esposter.noindex/genshin-parity/text/ExcelBinOutput/QuestExcelConfigData.json`: 207 of the 541 sub-quest ids the kept quest triggers name are absent from it)

#### Scenario: Unwatched trigger type does not move

- **GIVEN** an achievement whose trigger type is not watched yet
- **WHEN** any doing happens
- **THEN** that achievement does not move (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`)

### Requirement: Finishing an achievement pays its Primogems once

An achievement SHALL be finished when its progress reaches its count, and SHALL pay its Primogems once at that moment (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`).

#### Scenario: Reaching the count finishes and pays

- **GIVEN** an achievement one count short of finished
- **WHEN** a doing counts it
- **THEN** it is finished
- **AND** its finish moment is recorded
- **AND** its Primogems are paid (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`)

#### Scenario: Further doings pay nothing more

- **GIVEN** an achievement that is already finished
- **WHEN** further doings occur
- **THEN** no Primogems are paid again (`packages/genshin-world/src/services/achievement/advanceAchievements.ts`)

### Requirement: A completed category lists its namecard as earned

A category SHALL list its namecard as earned once every achievement of it is finished, and a category with no end SHALL list none (`packages/genshin-world/src/services/achievement/computeAchievementNamecardItemIds.ts`; `scripts/src/services/genshinAssets/achievements/toAchievementCategory.ts`).

#### Scenario: Completed category earns its namecard

- **GIVEN** every achievement of a category is finished
- **WHEN** the category is checked
- **THEN** its namecard is listed as earned (`packages/genshin-world/src/services/achievement/computeAchievementNamecardItemIds.ts`)

#### Scenario: Category with no end earns no namecard

- **GIVEN** a category with no end
- **WHEN** all of its achievements are finished
- **THEN** no namecard is listed (`scripts/src/services/genshinAssets/achievements/toAchievementCategory.ts`)

#### Scenario: Earned namecard is on the profile

- **GIVEN** a namecard is listed as earned
- **WHEN** the player's profile is shown
- **THEN** the namecard is among the profile's held namecards, the ones the player may equip (`packages/genshin-world/src/services/profile/computeProfileNamecardItemIds.ts`)

### Requirement: The Achievements screen lists category progress

The Achievements screen SHALL list every category with how many of its achievements are finished, and SHALL step between categories with Q and E (`packages/genshin-world/src/components/Achievement/Screen/Index.vue`).

#### Scenario: Screen opens from the Paimon menu

- **GIVEN** the Paimon menu is open
- **WHEN** Achievements is chosen (`packages/genshin-world/src/services/menu/constants.ts`; the Paimon menu grid in `~/Esposter.noindex/genshin-parity/references/paimon-menu.png` shows Achievements)
- **THEN** the screen opens with its categories listed down the left
- **AND** each category shows how many of its achievements are finished over how many it has (`packages/genshin-world/src/components/Achievement/Screen/Index.vue`)

#### Scenario: Q and E step between categories

- **GIVEN** the Achievements screen is open with a category selected
- **WHEN** E is pressed
- **THEN** the next category is selected (`packages/genshin-world/src/components/Achievement/Screen/Index.vue`)
- **AND** pressing Q selects the previous category

## Open

- [ ] **Other trigger types wait on the pages that record their doings** — no source yet: the composables already emit chest, monster and other doings (`packages/genshin-world/src/composables/useWorldChests.ts`, `useWorldCombat.ts`), so this is out of date.
