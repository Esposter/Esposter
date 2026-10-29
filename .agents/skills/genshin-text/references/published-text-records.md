# Published text records

Read when a quest's, an achievement's, an Archive entry's or the card game's words are published as a record, or read back by the screen that shows them.

**A quest's words are the world's, never a `GameTextKey`**: `genshin:text quests` publishes every word a carried quest and its talks show as one record a language under `questText`, by the same text ids, and a host hands a talk or the quest screen the record of its language as its `textMap` (`openspec/specs/genshin/quests/design.md`).

**An achievement's title, description and category name are the world's too**: `genshin:assets achievements` publishes them as one record a language under `achievementText`, by their text ids, and `AchievementTextLoaderMap` fetches one language by its key (`openspec/specs/genshin/achievements/design.md`).

**An Archive entry's name is the world's too**: `genshin:assets archive` publishes every entry's name, and a weapon's description (`descriptionTextId`, from the weapon row), as one record a language under `archiveText` by its text id, through the same `buildTextChunks` as the achievements (`openspec/specs/genshin/archive/design.md`).

**The card game's names and descriptions are the world's too**: `genshin:text gcg` publishes the card game's words as one record per language, as `openspec/specs/genshin/game-text/design.md` sets out, and `GcgTextLoaderMap` fetches one language by its key (`openspec/specs/genshin/genius-invokation/README.md`).
