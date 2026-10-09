---
title: Resident schedules
description: The world's residents keep the game's day and night. Each resident has a day spot, from six in the morning to seven at night, and a night spot, or else keeps the day spot through the night; a resident the game shows only by day is marked absent at night. The clock picks the spot at each frame, and a change of spot waits while the resident is in view, so nobody is seen to jump at the turn of the hour.
---

# Resident schedules

The game's people keep hours. A resident stands at one spot in the day and another at night, and some are seen only at one time. The [dialogue](/docs/genshin/dialogue) page's residents are placed in a region's data with a day spot, a night spot, or one of the two, and this page is the rule that picks the spot the world shows at the clock's minute.

## How it works

```mermaid
flowchart TD
  CLOCK["The world's clock, in minutes past midnight"] --> PERIOD{"From six to seven?"}
  PERIOD -->|"yes"| DAY["The day spot"]
  PERIOD -->|"no"| NIGHT["The night spot, or the day spot when none is kept"]
  PERIOD -->|"no, absent at night"| ABSENT["Absent"]
  DAY --> TARGET["The spot the clock gives, or absent"]
  NIGHT --> TARGET
  ABSENT --> TARGET
  TARGET --> SHOWN{"Different from the spot shown, and in view?"}
  SHOWN -->|"yes"| HELD["The spot shown holds"]
  SHOWN -->|"no"| MOVED["The spot the clock gives is shown"]
```

- **Two spots by the hour.** `computeResidentSpot` returns the day spot from six in the morning until seven at night and the night spot the rest of the day. A resident with no night spot keeps their day spot through the night, and is absent at night only when the data sets `absentAtNight`. A resident with no day spot is absent in the day, so is neither drawn nor offered as a talk then.
- **Held while in view.** `computeShownResidentSpot` keeps the spot a resident stands at while the spot the clock now gives differs and the resident is in view, and moves them once they are out of view. An absence is treated as a spot, so a resident who appears or disappears at the turn does so out of view too.
- **Read each frame.** `useResidentSpots` runs each frame in the world: it reads the clock's minute, tests each resident's ground point against the camera's frustum in world coordinates, and replaces its map of shown spots only when one changed. A resident is placed the first frame they are in the data, and one whose region leaves reach is dropped, so they are placed afresh on return.
- **Consumers read the shown spot.** The world screen's prompts list a resident at their shown spot, and the quest's navigation marker points at it, so a resident absent at this hour is neither a prompt nor a marker.

## Where the residents come from

`pnpm -C scripts genshin:assets residents` writes the residents of each region the official map fitted to the scene into its region data, from the scene's NPC birth records. Each record is placed in the region of the nearest mapped point, carried into the region's own axes round Windrise's oak, and filed under the area of the nearest landmark. The NPC's name is the text id of its row in the game's NPC table, and its talk is the lowest-numbered talk the dialog table has it speak in. An NPC with no talk is left out, since the schema needs one.

```mermaid
flowchart TD
  BIRTH["The scene's NPC birth records"] --> REGION{"Within reach of a mapped point of a fitted region?"}
  REGION -->|"no"| OUT["Left out, counted"]
  REGION -->|"yes"| FIRST{"First record of this NPC in the region?"}
  FIRST -->|"no"| REPEAT["Left out, counted"]
  FIRST -->|"yes"| TALK{"The NPC has a name and a talk?"}
  TALK -->|"no"| SKIP["Left out, counted"]
  TALK -->|"yes"| DAY["A resident, its place the day spot"]
  DAY --> DATA["The region's residents in its data"]
```

The records give one place for most residents, so most have a day spot and no night spot, and stand at their day spot through the night. Most of the game's people stand in one place day and night, so absence is recorded only where the data says so, as `absentAtNight`. A resident the records place more than once in a region is the same NPC at nearly the same spot rather than a day and a night, so only its first place is kept. The wiki gives a resident's daytime and nighttime location as gallery pictures captioned by the hour, not as text naming a place, so no record is matched to a night spot from it.

## Key files

| File                                                                       | Role                                                                              |
| :------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| `packages/genshin-world/src/models/world/Resident.ts`                      | A resident with an optional day spot, night spot and explicit absence at night    |
| `packages/genshin-world/src/models/world/ResidentSpot.ts`                  | One spot: its ground point and the way it faces                                   |
| `packages/genshin-world/src/services/resident/computeResidentSpot.ts`      | The spot the clock gives at a minute, or none                                     |
| `packages/genshin-world/src/services/resident/computeShownResidentSpot.ts` | The spot shown, held while the resident is in view across a change                |
| `packages/genshin-world/src/composables/useResidentSpots.ts`               | The shown spot of each resident, read each frame from the clock and the camera    |
| `packages/genshin-world/src/components/World/Windrise/Index.vue`           | Holds the residents' spots and exposes them to the world screen                   |
| `packages/genshin-world/src/components/World/Screen/Index.vue`             | Lists the residents at their shown spot as talk prompts                           |
| `packages/genshin-world/src/services/quest/findQuestTargetPosition.ts`     | A quest target resident's shown spot, for the navigation marker                   |
| `scripts/src/services/genshinAssets/residents/writeResidents.ts`           | `genshin:assets residents`, joining the birth records to names, talks and regions |
| `scripts/src/services/genshinAssets/residents/joinResidents.ts`            | The join: one resident per NPC per region, and what was left out                  |
| `packages/genshin-world/src/data/regions/mondstadt.json`                   | Mondstadt's residents, written by the generator beside its landmarks              |

## Sources

- [NPC](https://genshin-impact.fandom.com/wiki/NPC), Genshin Impact Wiki: open-world residents with their daytime and nighttime locations.
