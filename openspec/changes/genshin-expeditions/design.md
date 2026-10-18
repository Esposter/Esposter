# Expeditions

The [expeditions](../../specs/genshin/expeditions/design.md) page holds the sending, the return, the claim, the recall and the limit by rank, with Mondstadt's places. What remains is what a player meets: Katheryne's talk that sends a character, the expedition screen, the other nations' places, and what a character's expedition talent adds. The places open with the statues that cover them ([map unlocking](../genshin-map-unlocking/design.md)), and the talents wait on the characters' kits ([character kits](../genshin-character-kits/design.md)), so those two parts wait on them.

## Decisions

- **Katheryne sends, at any branch of the Adventurers' Guild.** A talk with her opens the expedition screen, where a character, a place and one of its durations are chosen. A send is refused by the rules the [expeditions](../../specs/genshin/expeditions/design.md) page holds.
- **Any character but the Traveler stays usable in the party while away.** The game sends them in name only, so the party reads nothing from an expedition.
- **The expedition bonus is a character's Utility Passive, and its chance follows the sent character's level.** `ExpeditionBonusExcelConfigData` gives the chance by level: 20 percent from level 1, 40 from 21, 50 from 41, 60 from 51, 70 from 61, 80 from 71 and 90 from 81. The table is read as the chance for a sent character who holds the bonus, which the dump does not state outright. The wiki's [Exploration Talents](https://genshin-impact.fandom.com/wiki/Exploration_Talents) page, in its Expedition Bonuses section, says a character whose Utility Passive is an expedition bonus either takes less time to complete an expedition or receives additional materials from one. Neither source names those materials or their counts, so the bonus is built as its chance and its kind, and no item is paid until a source names it.
- **A character's expedition talent adds to a send or to a reward.** A passive that shortens an expedition or adds to its reward applies when its character is sent. Which passives do this is read from the characters' kits once the [character kits](../genshin-character-kits/design.md) are built, not from the bonus table.
- **The expedition screen is drawn from a public clip.** Its layout is read off a published walkthrough of Katheryne's expedition screen, [How to Complete an Expedition and Send Characters Out on One](https://www.youtube.com/watch?v=fxIjhlV3vUA) (107 seconds), and its comparison is queued for the user's eyes. No recording is owed for it first; one of the English PC client re-measures it later without gating the build.
- **Katheryne's talk opens the screen once she is placed.** The game's menus hold no expeditions entry, so none is added. The dump's births hold none of her, so the residents' join places her at the Adventurers' building point (resident 1512, provisional); her talk opens the screen through `checkIsExpeditionTalk`, and the screen's loader reads the places and limit steps as it opens.
- **Other nations' places open by their statues.** A place is open once its named statue is resonated, and a nation's places join the slice once its statues are placed.
- **The screen is an NPC screen kind.** It opens from a talk, not from the Paimon menu, so `ScreenKind.Expedition` joins `NPC_SCREEN_KINDS` beside the crafting bench and the forge, which hold the same way.
- **The pins and the panel's description come from the session, not the expedition record.** The record holds no pin position and no place description, so the screen takes each place's pin position as a prop and draws an empty description until the record carries one. Mondstadt's six pins are placed at their positions in the 26-second frame.
- **Mondstadt's places open from the save's statues.** The screen reads the save's statue regions through `computeUnlockedStatuePointIds`, so a place opens once its named statue is resonated. Only Mondstadt's statue is placed, so the other nations' places are not joined yet.
- **Words come from the game's own text keys, reusing one where no expedition key carries it.** The no-bonus line reuses `COOKING_QTE_NO_BONUS_DESC`, the title and limit use `UI_EXPLORE_PAGETITLE` and `UI_EXPLORE_LINELEFT`, and the remaining-time label has no key yet.

## Scope and order

**This adds, in order:**

```text
packages/
├── genshin-interface/src/components/ExpeditionScreen/
└── genshin-world/src/components/Expedition/Screen/Index.vue
```

1. **The expedition screen, built now from the public clip.**
   - Take the clip with `pnpm -C scripts recreation clip --directory ~/Esposter/genshin-parity/captures https://www.youtube.com/watch?v=fxIjhlV3vUA --from 0 --to 107 --name expedition-screen`, then `pnpm -C scripts genshin:parity frames` over it, reading the frames to pick the ones that show the place list with a place's durations and the character list. Write each with `pnpm -C scripts genshin:parity frame <capture> --at <second> --name expedition-screen` into `references/expedition-screen/`, beside the SOURCE.txt it writes.
   - Build `ExpeditionScreen` in `ExpeditionScreen/` (`Index.vue` and `Index.fixture.ts`) inside `GameScreen` on those frames, props in and events out: each open place with its durations, the characters free to go, and each expedition away with its time left; it emits a send, a claim and a recall. Its words are the game's by text id, added to `GameTextKey` with `pnpm -C scripts genshin:text find` and `write`.
   - Its world wrapper `Index.vue`, with its own `Index.fixture.ts`, calls `sendExpedition`, `claimExpedition` and `recallExpedition` over Mondstadt's slice, and `ScreenKind` gains `Expedition`.
   - The proof: a `ParityReferenceMap` entry naming the chosen frame for `ExpeditionScreen`, which `ParityReferenceMap.test.ts` requires of every fixture, and a `compare` run whose comparison goes under the roadmap's Manual verification.
2. **Katheryne's talk**, once the residents' join places her in Mondstadt's region data; it opens the screen.
3. **Each other nation's places**, as their statues join the region data, with the reward items of each named in the game text.
4. **The bonus and the expedition talents.** The bonus's items and counts are read from the game's own data once they are found, and the talents join the kits.

## Data and measures

- **Read from the game's tables:** `ExpeditionBonusExcelConfigData`, whose chance by level is the bonus above; and the characters' passives, once the kits name which of them shorten an expedition or add to its reward.
- **Not read:** `ExpeditionPathExcelConfigData` names the Adventurers' Guild's expedition missions, such as Swarm of Specters, each with its team's elements and a difficulty. A mission is not a place to send a character, so it has its own page if it is built.
- **Read from the wiki:** the bonus's kind, on the Exploration Talents page the decision above cites. Its items and counts are not on any page read so far.

## Key files

| File                                                               | Role after the change                                 |
| :----------------------------------------------------------------- | :---------------------------------------------------- |
| `packages/genshin-world/src/models/world/Resident.ts`              | Katheryne, through whom expeditions are sent          |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`           | Gains the expeditions' screen                         |
| `packages/genshin-world/src/services/expedition/sendExpedition.ts` | The send the screen calls, refused by the rules above |

## Sources

- [Expedition](https://genshin-impact.fandom.com/wiki/Expedition), Genshin Impact Wiki: Katheryne's talk that opens the screen, and the rules the sends follow.
- [Exploration Talents](https://genshin-impact.fandom.com/wiki/Exploration_Talents), Genshin Impact Wiki: the kind of expedition bonus, in its Expedition Bonuses section.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the expedition bonus table and the characters' passives.
