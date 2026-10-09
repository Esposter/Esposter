---
title: Expeditions
description: Proposal — the expeditions Katheryne sends out from the Adventurers' Guild, their screen, the other nations' places as their statues are placed, and the expedition bonus and talents. The sending, return, claim and recall of Mondstadt's places are built, on the expeditions page.
model: claude-haiku-5-5
---

# Expeditions

The sending, the return, the claim, the recall and the limit by rank are built, with Mondstadt's places ([expeditions](/docs/genshin/expeditions)). What remains is what a player meets: Katheryne's talk that sends a character, the expedition screen, the other nations' places, and what a character's expedition talent adds. The places open with the statues that cover them ([map unlocking](/docs/proposals/genshin/map-unlocking)), and the talents wait on the characters' kits ([character kits](/docs/proposals/genshin/character-kits)), so this page waits on both.

## Decisions

- **Katheryne sends, at any branch of the Adventurers' Guild.** A talk with her opens the expedition screen, where a character, a place and one of its durations are chosen. The rules behind the screen are built: a send is refused where the expedition is not open, the character is the Traveler, down or already away, the limit is reached, or the place is closed or offers no such hours.
- **Any character but the Traveler stays usable in the party while away.** The game sends them in name only, so the party reads nothing from an expedition.
- **The expedition bonus is a chance by level, not a talent.** `ExpeditionBonusExcelConfigData` gives a chance per level of the sent character: 20 percent from level 1, 40 from 21, 50 from 41, 60 from 51, 70 from 61, 80 from 71 and 90 from 81. The table does not say what a bonus gives, so the payload is open, and the earlier reading of this table as the talent's bonus is withdrawn.
- **A character's expedition talent adds to a send or to a reward.** A passive that shortens an expedition or adds to its reward applies when its character is sent. Which passives do this is read from the characters' kits once the [character kits](/docs/proposals/genshin/character-kits) are built, not from the bonus table.
- **Other nations' places open by their statues.** A nation's places join the slice once the region data holds its statues and their scene points, and each named statue condition is checked by `computeUnlockedStatuePointIds`.

## Scope and order

**Built:** the sending, return, claim, recall, the limit by rank, and Mondstadt's places ([expeditions](/docs/genshin/expeditions)).

**This adds, in order:**

1. **Katheryne's talk and the expedition screen.** Her talk opens the screen, which lists each open place with its durations and the characters free to go. Its layout waits on a recording.
2. **Each other nation's places**, as their statues join the region data, with the reward items of each named in the game text.
3. **The bonus and the expedition talents.** The bonus's payload is read from the game's own data once it is found, and the talents join the kits.

## Data and measures

- **Read from the game's tables:** `ExpeditionBonusExcelConfigData`, whose chance by level is the bonus above; and the characters' passives, once the kits name which of them shorten an expedition or add to its reward.
- **Not read:** `ExpeditionPathExcelConfigData` names the Adventurers' Guild's expedition missions, such as Swarm of Specters, each with its team's elements and a difficulty. A mission is not a place to send a character, so it has its own page if it is built.
- **Read from the wiki:** where the bonus's payload is described, if the tables do not give it.

## Key files

| File                                                               | Role after the change                                 |
| :----------------------------------------------------------------- | :---------------------------------------------------- |
| `packages/genshin-world/src/models/world/Resident.ts`              | Katheryne, through whom expeditions are sent          |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`           | Gains the expeditions' screen                         |
| `packages/genshin-world/src/services/expedition/sendExpedition.ts` | The send the screen calls, refused by the rules above |

## Sources

- [Expedition](https://genshin-impact.fandom.com/wiki/Expedition), Genshin Impact Wiki: Katheryne's talk that opens the screen, and the bonus, its payload where the tables do not give it.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the expedition bonus table and the characters' passives.
