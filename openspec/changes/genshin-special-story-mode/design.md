# Special Story Mode

A story quest's step can restrict the player while it is the active step. The Paimon menu is the restriction every restricted step shares, so this change locks it and leaves the rest of each restriction to the export.

## How it works

```mermaid
flowchart TD
  OPEN["Paimon menu requested in the world"] --> ACTIVE["Active quest steps read"]
  ACTIVE --> RESTRICTED{"Any active step restricted?"}
  RESTRICTED -->|"no"| MENU["The Paimon menu opens"]
  RESTRICTED -->|"yes"| SHUT["Nothing opens; the world stays as it was"]
```

The restriction is a field on the quest step, present only on a restricted step. Its absence means no restriction, so the step model reads it as optional.

## Decisions

- **Keyed to the active step's restriction, not the quest's kind.** The wiki lists the restricted quests by step, and the game's `QuestKind.Story` covers story quests that restrict nothing. The quest table marks 203 steps across 103 quests with a restriction, so the step is the unit.
- **The Paimon menu is the one lock built now, and its entries go with it.** The wiki says the Paimon menu is not accessible in this mode, and its entries (Party Setup among them) are reached only from inside it. The Map shortcut is not locked: the wiki names Map for some steps only, and the quest table's step mark does not say which, so the map and transport restrictions wait on the export rather than being guessed.
- **The table's restriction is taken as the wiki's Special Story Mode.** Provisional: the wiki lists the restricted quests by step, and this change reads the same step-level mark from the game's quest table, without yet checking the two lists match one for one.

## Key files

The work changes these existing files:

| File                                                                         | Role after the change                                                                     |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `scripts/src/services/genshinText/readQuestSteps.ts`                         | Reads a restricted step's ban group off its sub quest, and notes a group it does not know |
| `scripts/src/services/genshinText/readQuestBanType.ts`                       | Finds the ban group string in a sub quest by its value, since its key is scrambled        |
| `packages/genshin-world/src/models/quest/QuestBanType.ts`                    | The four ban groups a step can carry, each the dump's own string                          |
| `packages/genshin-world/src/models/quest/QuestStep.ts`                       | Carries the optional restriction on a step, absent when the step has none                 |
| `packages/genshin-world/src/services/quest/checkIsSpecialStoryModeActive.ts` | Whether a quest in progress is on a restricted step                                       |
| `packages/genshin-world/src/services/screen/getNextScreenKind.ts`            | Keeps the Paimon menu shut from the world while the lock holds                            |
| `packages/genshin-world/src/components/World/Session/Index.vue`              | Passes the lock from the quests in progress into the screen's next kind                   |

## Notes

- The quest table's restriction names are the game's own ban-group keys; the groups' contents are not in the excel tables, so the field stores the key and the lock reads only whether one is present.
- A restricted step the wiki does not list is not this change's to explain; it is checked against the wiki when the dataset ships.
