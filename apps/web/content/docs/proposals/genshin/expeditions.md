---
title: Expeditions
description: Proposal — the expeditions Katheryne sends out from the Adventurers' Guild, their screen, the other nations' places as their statues are placed, and the expedition bonus and talents. The sending, return, claim and recall of Mondstadt's places are built, on the expeditions page.
model: claude-haiku-5-5
needs: [media-engine]
touches:
  [
    "packages/genshin-interface/src/components/ExpeditionScreen/**",
    "packages/genshin-world/src/components/Expedition/**",
  ]
---

# Expeditions

The sending, the return, the claim, the recall and the limit by rank are built, with Mondstadt's places ([expeditions](/docs/genshin/expeditions)). What remains is what a player meets: Katheryne's talk that sends a character, the expedition screen, the other nations' places, and what a character's expedition talent adds. The places open with the statues that cover them ([map unlocking](/docs/proposals/genshin/map-unlocking)), and the talents wait on the characters' kits ([character kits](/docs/proposals/genshin/character-kits)), so those two parts wait on them.

## Decisions

- **Katheryne sends, at any branch of the Adventurers' Guild.** A talk with her opens the expedition screen, where a character, a place and one of its durations are chosen. The rules behind the screen are built: a send is refused where the expedition is not open, the character is the Traveler, down or already away, the limit is reached, or the place is closed or offers no such hours.
- **Any character but the Traveler stays usable in the party while away.** The game sends them in name only, so the party reads nothing from an expedition.
- **The expedition bonus is a chance by level, not a talent.** `ExpeditionBonusExcelConfigData` gives a chance per level of the sent character: 20 percent from level 1, 40 from 21, 50 from 41, 60 from 51, 70 from 61, 80 from 71 and 90 from 81. The table does not say what a bonus gives, so the payload is open, and the earlier reading of this table as the talent's bonus is withdrawn.
- **A character's expedition talent adds to a send or to a reward.** A passive that shortens an expedition or adds to its reward applies when its character is sent. Which passives do this is read from the characters' kits once the [character kits](/docs/proposals/genshin/character-kits) are built, not from the bonus table.
- **The expedition screen is built now from a public clip.** Its layout is read off a published walkthrough of Katheryne's expedition screen, [How to Complete an Expedition and Send Characters Out on One](https://www.youtube.com/watch?v=fxIjhlV3vUA) (107 seconds), and its comparison is queued for the user's eyes. No recording is owed for it first; one of the English PC client re-measures it later without gating the build.
- **Until Katheryne stands in the world, the screen is reached through its fixture.** The game's menus hold no expeditions entry, so none is added. The residents' join writes no Katheryne into Mondstadt's region data, so her talk is wired once she is placed, as the forge's blacksmith waits on the scene group export.
- **Other nations' places open by their statues.** `checkIsExpeditionPlaceOpen` checks that a place's named statue is resonated, against the scene points `computeUnlockedStatuePointIds` maps the unlocked landmarks to, and a nation's places join the slice once its statues are placed.

## Scope and order

**Built:** the sending, return, claim, recall, the limit by rank, and Mondstadt's places ([expeditions](/docs/genshin/expeditions)).

**This adds, in order:**

```text
packages/
├── genshin-interface/src/components/ExpeditionScreen/
└── genshin-world/src/components/Expedition/Screen/Index.vue
```

1. **The expedition screen, built now from the public clip.**
   - Take the clip with `pnpm -C scripts genshin:parity clip https://www.youtube.com/watch?v=fxIjhlV3vUA --from 0 --to 107 --name expedition-screen`, then `pnpm -C scripts genshin:parity frames` over it, reading the frames to pick the ones that show the place list with a place's durations and the character list. Write each with `pnpm -C scripts genshin:parity frame <capture> --at <second> --name expedition-screen` into `references/expedition-screen/`, beside the SOURCE.txt it writes.
   - Build `ExpeditionScreen` in `ExpeditionScreen/` (`Index.vue` and `Index.fixture.ts`) inside `GameScreen` on those frames, props in and events out: each open place with its durations, the characters free to go, and each expedition away with its time left; it emits a send, a claim and a recall. Its words are the game's by text id, added to `GameTextKey` with `pnpm -C scripts genshin:text find` and `write`.
   - Its world wrapper `Index.vue`, with its own `Index.fixture.ts`, calls `sendExpedition`, `claimExpedition` and `recallExpedition` over Mondstadt's slice, and `ScreenKind` gains `Expedition`.
   - The proof: a `ParityReferenceMap` entry naming the chosen frame for `ExpeditionScreen`, which `ParityReferenceMap.test.ts` requires of every fixture, and a `compare` run whose comparison goes under the roadmap's Awaiting the user.
2. **Katheryne's talk**, once the residents' join places her in Mondstadt's region data; it opens the screen.
3. **Each other nation's places**, as their statues join the region data, with the reward items of each named in the game text.
4. **The bonus and the expedition talents.** The bonus's payload is read from the game's own data once it is found, and the talents join the kits.

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
