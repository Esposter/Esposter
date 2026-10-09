---
title: Archive
description: Genshin's Archive as built. Its seven sections are the game's own codex tables, read from the dump with each entry's name in the game's text. A bag's items open their entries as they are taken in, the Archive waits on the quest it opens after, and its screen lists each section with a name or a "?" per entry. The sections whose doings are not built yet stay locked.
---

# Archive

The Archive is the game's record of what a player has met. It is seven sections, each one a codex table of the game: Equipment, Living Beings, Tutorials, Geography, Travel Log, Books and Materials. An entry is locked until its thing is first met, so the Archive is the player's journey written down. The world reads the codex tables into its own slices, opens an entry when a bag's item is first held, and lists every section on its screen with the names of what is open and a "?" for what is not.

## How it works

```mermaid
flowchart TD
  DUMP["The dump, outside the repository: the codex tables and the name tables they point at"] --> WRITE["genshin:assets archive"]
  WRITE --> SLICES["generated/archive: one slice per section"]
  WRITE --> WORDS["generated/archiveText: each name in each language"]
  BAG["A bag change: a drop picked up, a gathering point, a wish"] --> SET["setInventory in the world screen"]
  SET --> OPEN["openArchiveEntries: a weapon opens Equipment, any other item Materials"]
  OPEN --> PROGRESS["Archive progress: the opened ids of each section"]
  SLICES --> SCREEN["Archive screen: sections, their entries, a name or a ?"]
  WORDS --> SCREEN
  PROGRESS --> SCREEN
  DONE["Main quest 353 finished"] --> UNLOCK{"Unlocked the first time?"}
  UNLOCK -->|"yes"| LOAD["Slices and names read on demand"]
  LOAD --> MENU["Paimon menu's Archive entry enabled"]
  MENU --> SCREEN
```

## The sections

The `genshin:assets archive` writer reads each section's codex table from the dump, names each entry by the game's English text, and keeps only the entries whose name the English text holds. Each section is written compact as its own slice, and the names of every kept entry go into the world's own chunk per language, as the [achievements](/docs/genshin/achievements) do.

| Section       | Codex table                                                               | Named by                                                               | Opened by                                                                                               |
| :------------ | :------------------------------------------------------------------------ | :--------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| Equipment     | `WeaponCodexExcelConfigData`, then `ReliquaryCodexExcelConfigData` by set | the weapon's row; a set's equip affix                                  | a weapon, when it is in the bag                                                                         |
| Living Beings | `AnimalCodexExcelConfigData`, animal and monster rows                     | `AnimalDescribeExcelConfigData`, then `MonsterDescribeExcelConfigData` | a monster's first defeat opens its entry and counts its kills; an animal waits on the wildlife's strike |
| Tutorials     | `PushTipsCodexExcelConfigData`, tutorial rows                             | `PushTipsConfigData`'s title                                           | not yet: no tip is shown                                                                                |
| Geography     | `ViewCodexExcelConfigData`                                                | the view's own row                                                     | not yet: no viewpoint is taken in                                                                       |
| Travel Log    | `QuestCodexExcelConfigData`                                               | the parent main quest's title                                          | a main quest's finish opens its entry, by the quest id each entry names                                 |
| Books         | `BooksCodexExcelConfigData`                                               | the book's material                                                    | not yet: no book is read                                                                                |
| Materials     | `MaterialCodexExcelConfigData`                                            | the material's row                                                     | any bag item that is not equipment, by its item id                                                      |

The codex's own order is kept: each section's entries are sorted by the table's sort order, and the Equipment section lists its weapons before its sets. A codex row the game has left out is not kept.

## Opening entries

`openArchiveEntries` takes the progress and the bag's items and returns the progress with every item's entry opened. A weapon opens its Equipment entry by its id, a material opens its Materials entry by the same id, and an artifact opens none (see Notes). An entry already open stays open, and the progress given is not changed. The world screen's `setInventory` is the one way the bag changes, so a drop picked up, a gathering point taken and a wish's weapon all open their entries through it.

A defeated enemy opens its Living Beings entry and counts one more kill under it (`openArchiveEntry`, `countArchiveDefeat`). Each enemy kind carries its codex entry's id as `archiveEntryId`, so the count is kept by the entry, and the Living Beings entry shows it as "×N" once open.

## The unlock

The Archive opens once its quest is done, the Archon Quest Unexpected Power, main quest 353 in the dump. The Paimon menu's Archive entry is enabled only once that quest's completion is known to the world, so its slices and names are read the first time it unlocks, not with the world. A main quest finished on the [quests](/docs/genshin/quests) page is what completes it, so the entry opens once the quest page finishes that quest.

## The screen

`components/Archive/Screen` lists the seven sections down the left, each with how many of its entries are open over how many it has, and the selected section's entries on the right in the codex's order. Q and E step between the sections as the quest and achievement tabs do. An entry reads its name once open, and a "?" until then. The section titles are the game's own, its manual text ids for each codex tab.

## Notes

- **A monster is named by its description.** A monster row's own name hash resolves to no text in any language; its name sits under the monster description table, which the dump lacks and which is fetched from AnimeGameData beside the others.
- **Only the world's enemies are counted.** A monster the world places opens and counts its entry. The living beings of the wildlife are not struck yet, so their entries stay locked.
- **An artifact set never opens yet.** A bag artifact carries no set id, so "every piece held" cannot be counted, and the Equipment section lists the sets as locked for good until the bag keeps the set with each artifact.
- **A tutorial is named by its push tip's title.** The push tips codex joins the push tips table, which the dump lacks and which is fetched from AnimeGameData; only the tutorial kind is written, not the monsters' tips.
- **Entries show a name only.** Descriptions and the pictures of viewpoints wait for their own pages, since they are not part of the names chunk.
- **The unlock quest is the wiki's.** The Archive waits on Unexpected Power as the Archive's wiki page describes, and the dump's main quest table names that quest under id 353.

## Parity

The Archive screen has no parity measure yet. Its places follow the achievements' grid rather than the English client's, and its look waits on the `archive-screen.mkv` recording the roadmap still owes.

## Key files

| File                                                                      | Role                                                                             |
| :------------------------------------------------------------------------ | :------------------------------------------------------------------------------- |
| `packages/genshin-world/src/models/archive/ArchiveSection.ts`             | The seven sections, each the game's own codex table                              |
| `packages/genshin-world/src/models/archive/ArchiveEntry.ts`               | One entry with its table id and its name's text id, with its schema              |
| `packages/genshin-world/src/models/archive/ArchiveProgress.ts`            | The opened ids of each section                                                   |
| `packages/genshin-world/src/services/archive/openArchiveEntries.ts`       | Opens the entries of a bag's items                                               |
| `packages/genshin-world/src/services/archive/readArchiveEntries.ts`       | The slices of every section, imported on demand and checked                      |
| `packages/genshin-world/src/services/archive/ArchiveTextLoaderMap.ts`     | The names in each language, imported on demand                                   |
| `packages/genshin-world/src/services/archive/constants.ts`                | The main quest the Archive opens after                                           |
| `packages/genshin-world/src/components/Archive/Screen/Index.vue`          | The Archive screen the Paimon menu opens                                         |
| `packages/genshin-world/src/components/World/Screen/Index.vue`            | `setInventory`, the unlock and the names' load, and the screen's slot            |
| `scripts/src/services/genshinAssets/archive/writeArchive.ts`              | The writer: each section's entries into its slice                                |
| `scripts/src/services/genshinAssets/archive/toArchiveEntries.ts`          | A candidate kept only when its name is in the English text, in the codex's order |
| `scripts/src/services/genshinAssets/archive/readLivingBeingCandidates.ts` | The animal rows and their names                                                  |
| `scripts/src/services/genshinAssets/archive/writeArchiveText.ts`          | Every entry's name in every language                                             |
| `scripts/src/services/genshinText/writeTextChunks.ts`                     | The one writer of a per-language chunk, shared with the achievements' text       |
| `scripts/src/services/genshinAssets/archive/readTutorialCandidates.ts`    | The tutorial push tips, each named by its title                                  |
| `packages/genshin-world/src/models/archive/ArchiveKills.ts`               | The defeats of each Living Being, by its entry's id                              |
| `packages/genshin-world/src/services/archive/countArchiveDefeat.ts`       | One more defeat counted under a Living Being's entry                             |
| `packages/genshin-world/src/services/archive/openArchiveEntry.ts`         | One entry of a section opened, idempotently                                      |

## Sources

- [Archive](https://genshin-impact.fandom.com/wiki/Archive), Genshin Impact Wiki: the Archive's unlock after Unexpected Power, its sections, and entries opened when first obtained or defeated.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the weapon, reliquary, animal, animal describe, books, material, view, quest and push tip codex tables, and the weapon, material, equip affix, reliquary set and main quest tables their names come from; the monster describe and push tips tables, which the dump lacks and which are fetched beside it.
