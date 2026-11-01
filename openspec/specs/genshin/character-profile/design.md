# Character profile

The character screen's Profile tab lists a character's stories down its left, `Character Details`, the five character stories, the pet's story and `Vision` in the game's order (`{data-root}/genshin-parity/text/ExcelBinOutput/FetterStoryExcelConfigData.json`, Jean's rows 4201 to 4208, which give `Character Details`, `Character Story 1` to `5` and `Vision`), and then its voice-overs in the order the game lists them (`{data-root}/genshin-parity/text/ExcelBinOutput/FettersExcelConfigData.json`). It shows the chosen entry's title and text down its right. A story or voice-over opens at the Friendship Level its fetter names (`{data-root}/genshin-parity/text/ExcelBinOutput/FetterStoryExcelConfigData.json`, line 39: a `FETTER_COND_FETTER_LEVEL` of 2 on Jean's second story). One that waits on another condition, a quest for instance (`FETTER_COND_FINISH_QUEST` on 88 story rows of that file), stays locked whatever the level. The locked list shows the game's unlock line (`{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`, line 168534) in place of a story's title, or its title alone when no level opens it.

## How it works

```mermaid
flowchart LR
  OPEN["Profile tab opened for a character"] --> LOAD["Its profile record, fetched from the hosted game data, and the Friendship Levels"]
  LOAD --> LEVEL["The level its total Companionship EXP has reached"]
  LEVEL --> LIST{"Open at its Friendship Level?"}
  LIST -->|"yes"| PANEL["The chosen story's title and text beside the list"]
  LIST -->|"no"| LOCKED["Locked: the unlock line in the list, or its title alone"]
```

`pnpm -C scripts genshin:assets profile` builds each playable character's stories, voice-overs and namecard from the dump, in every language, and publishes them to the hosted game data as one index a language, each character keyed by its id ([hosted game data](../hosted-game-data/design.md)) (`scripts/src/services/genshinAssets/profile/buildProfilePublication.ts`). The characters it covers are the ones in the `stats/characters` record that the stats step published (the same file, line 27). The panel reads the record of its character in the language the screen is in, so a reader downloads only that one record.

## Decisions

- **Stories are the fetter story table's rows, one each.** (`{data-root}/genshin-parity/text/ExcelBinOutput/FetterStoryExcelConfigData.json`.) A character's rows are taken in the order the table gives them, by fetter id (`scripts/src/services/genshinAssets/profile/selectFetterStoryRows.ts`, lines 10 to 11), and each title and text is the game's own string by its text id, read from the language's text map and English where that map lacks one (`scripts/src/services/genshinAssets/profile/toProfileStory.ts`). The row between the fifth story and Vision is the pet's story where the character has a pet: Lyney's fetter 84206, titled "Rosseland", whose text names the cat that Lyney and Lynette adopted (`{data-root}/genshin-parity/text/ExcelBinOutput/FetterStoryExcelConfigData.json`, line 14962; `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`, line 72716). Jean's row 4207 in the same slot is a daily schedule.
- **Voice-overs are the fetters table's rows, read as stories.** Each row's title is its voice title's text id and its text the line it speaks, so one conversion serves both. The rows the game hides are left out (the rows that carry `isHiden`, `{data-root}/genshin-parity/text/ExcelBinOutput/FettersExcelConfigData.json`; `scripts/src/services/genshinAssets/profile/buildProfilePublication.ts`, line 40), and the rest keep the table's order by fetter id after the stories (`scripts/src/services/genshinAssets/profile/selectFetterStoryRows.ts`, lines 10 to 11).
- **A story or voice-over opens at its Friendship Level.** Its open conditions name the level, and one with no open conditions opens at once (`packages/genshin-world/src/services/profile/checkProfileStoryUnlocked.test.ts`, "opens a story with no level at once"). One whose conditions name anything besides a level, a quest for instance, stays locked whatever the level, with a level among them or none (the same file, "keeps a story locked whatever the level when another condition applies").
- **A locked story with a level to open at shows the game's unlock line,** `Lv. {0} unlocks: {1}`, with that level and its title, and no text. This is the game's own line by its text id (`{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json`, line 168534, text id 2616170868), so nothing is phrased here. A locked story with no Friendship Level among its conditions shows its title alone (`packages/genshin-world/src/services/profile/toCharacterProfileEntries.test.ts`, "lists a story that another condition locks by its title alone when no level opens it").
- **The tab sits in the character menu's panel** (`packages/genshin-world/src/components/Character/Screen/Index.vue`), widened from the characters' row's left edge (`packages/genshin-interface/src/components/CharacterMenu/Index.vue`, lines 398 to 401) so the list and the text share it. The reference is the game's separate Profile / Story page with its own header, and that page is not built; the tab's layout and colours are provisional until the user compares them.
- **The namecard is the namecard material the character's card pays,** read from the card rows of `{data-root}/genshin-parity/text/ExcelBinOutput/FetterCharacterCardExcelConfigData.json` through each row's reward in `{data-root}/genshin-parity/text/ExcelBinOutput/RewardExcelConfigData.json` to the item of the namecard kind in `{data-root}/genshin-parity/text/ExcelBinOutput/MaterialExcelConfigData.json`, by its icon's name (`scripts/src/services/genshinAssets/profile/getNamecardIconNameMap.ts`, `NAMECARD_MATERIAL_TYPE` in `scripts/src/services/genshinAssets/shared/constants.ts`). Every playable character with a card row is paid exactly one, and the name is not always the avatar icon's with a prefix swapped: Xinyan's is "UI_NameCardPic_Xinyan", Yae Miko's "UI_NameCardIcon_Yae1" and Momoka's "UI_NameCardIcon_Kirara". The Traveler and the stats record's placeholder avatars have no card row, so no namecard. The writer stores it per character; the panel shows the namecard's name once the Friendship holds it (the level-10 rows of the same card table; `packages/genshin-world/src/services/profile/readCharacterProfile.test.ts`), and its art is not drawn yet.
- **The Friendship Level is read from the save's Companionship EXP,** through the [companionship](../companionship/design.md) level table (`{data-root}/genshin-parity/text/ExcelBinOutput/AvatarFettersLevelExcelConfigData.json`; `packages/genshin-world/src/services/profile/readCharacterProfile.ts`), once the screen is given the save's companionship slice.
- **The Profile tab's reference frame** is a frame of the English client's profile page; its sizes and colours in the character menu's panel stand until the user compares them.

## Notes

- **Not drawn yet.** The reference's `Voice:` line with the voice actor, the player's UID, the namecard's art, and the character's model in the middle of the page. The model waits on [characters](../characters/README.md), the rest on their own pages.
- **The `Friendship` text** is written with the other game text (`packages/genshin-text/src/generated/text/English.json`, line 140; the game's text id 3501231455 in `{data-root}/genshin-parity/text/TextMap/TextMap_MediumEN.json` reads "Friendship"), but no place in this frame shows it, so nothing draws it yet.

## Key files

| File                                                                        | Role                                                                                         |
| :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinAssets/profile/buildProfilePublication.ts`     | Builds each character's profile in every language from the dump, one index a language        |
| `scripts/src/services/genshinAssets/profile/toProfileStory.ts`              | A story row's open conditions and its text in one language                                   |
| `scripts/src/models/genshinAssets/profile/ExcelFetterVoiceRow.ts`           | A voice-over row of the fetters table, read as a story row                                   |
| `scripts/src/services/genshinAssets/profile/getNamecardIconNameMap.ts`      | The namecard each character's card pays, read from the card, reward and material tables      |
| `packages/genshin-world/src/services/profile/readCharacterProfile.ts`       | Reads a character's profile record, its Friendship Level and its namecard's name text id     |
| `packages/genshin-world/src/services/profile/checkProfileStoryUnlocked.ts`  | The unlock rule                                                                              |
| `packages/genshin-world/src/services/profile/toCharacterProfileEntries.ts`  | Turns the stories and voice-overs into the panel's entries, locked ones with the unlock line |
| `packages/genshin-world/src/components/Character/Profile/Index.vue`         | The wrapper that loads the profile for the screen's character                                |
| `packages/genshin-world/src/components/Character/Screen/Index.vue`          | Opens the Profile tab for the chosen character                                               |
| `packages/genshin-interface/src/components/CharacterMenu/Profile/Index.vue` | The list, the chosen story's text and the namecard's name plate                              |

## Open

- [ ] **The Profile tab's reference frame is a frame of the English client's profile page** — no source yet: the frame file `yt-2I_vWTyHqHg-profile-2s.png`, which is not under `{data-root}/genshin-parity/references/`, and the cached clip `{data-root}/genshin-parity/captures/yt-2IPBviDPFB8.mp4` carries another video id.
