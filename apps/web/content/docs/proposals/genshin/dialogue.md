---
title: Dialogue
description: Proposal — Genshin's dialogue, still to come. F on a resident begins their talk with the world's controls held, a talk's words are loaded in the reader's language with the Traveler's name and gender filled in, a resident offers each talk open to them with its mark, and narration is drawn on its black screen. The replies' marks are traced, and the screen's look and timings are measured. The talk graph, its runner, the dialogue screen with auto-play and skip, and residents in region data are built, as the dialogue page describes.
model: claude-opus-5-5
---

# Dialogue

The talk graph, its pure runner, the dialogue screen and the talk host that runs one over the world, with auto-play and skip, are built. So is a resident placed in a region's data with the talk F begins: see [dialogue](/docs/genshin/dialogue). What remains joins a talk to the world, loads its words, and measures the screen against the game's.

## Decisions

- **F on a resident begins their talk.** The [interaction](/docs/proposals/genshin/interaction) prompts list each resident in reach as a talk, named in the reader's language and standing on the ground at their spot. F on one mounts the talk host over the world. While a talk runs, the world holds its controls, so the F and Space that move the talk on never also act or jump, and the HUD hides as the game's does. The talk's end gives them back.
- **A quest's talk takes the resident's place while its step is open.** When the current step of a quest in progress asks for a talk with a resident, F on that resident runs the quest's talk rather than their own. Its end is the talk-to event the quest's progress waits on ([quests](/docs/genshin/quests)).
- **A resident offers every talk open to them, each with its mark.** In the game, a character with a quest to give or advance offers it as a reply beside their own chat, drawn with the mark of a quest or a story quest. The first line of a resident's talk offers each open quest talk as a reply with that mark.
- **A talk's words are loaded with it.** The reader writes a text map for each language, holding every word the carried quests and residents show (`generated/questText`). The host loads the reader's language once, as [game text](/docs/genshin/game-text) loads its chunk, and hands it to the talk host.
- **The Traveler's name and gender are filled in.** A line holding the player's nickname or a word per gender is shown through `fillLinePlaceholders`, filled from the player's own name and twin once the world has a player profile, and from the game's own title for the Traveler until then.
- **Narration is drawn as the game draws it.** A line the game shows on a black screen is read with its role, and it is drawn centred on black with no speaker.
- **Voices are not played from the game.** Nothing of the game's audio ships, so a voiced line is shown and timed as an unvoiced one.

## Measures owed

These need a recording of the English PC client's dialogue at 1080 high, found among published recordings first ([parity](/docs/genshin/parity)):

- **The line's reveal rate and auto-play's hold**, read off the line's darkness frame by frame (`frames`, then `luma` over the line's band), into `TALK_REVEAL_MS_PER_CHARACTER` and `TALK_AUTO_PLAY_HOLD_MS`.
- **The band, the speaker's name, the line and the replies**: their sizes, places, colours and fades, measured as the login's interface is.
- **The replies' marks**, traced from the wiki's files of the game's own (`Icon Dialogue Talk White.png`, `Icon Dialogue Quest.png`, `Icon Dialogue Story Quest.png`) into paths of our own, and the auto-play and skip buttons' glyphs beside them.

## Key files

| File                                                                 | Role after the change                                                      |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/Dialogue/Talk/Index.vue`      | Fills the placeholders, draws narration and offers the open quest talks    |
| `packages/genshin-world/src/components/World/Screen/Index.vue`       | Mounts the talk host when F begins a talk, and holds the controls under it |
| `packages/genshin-world/src/services/dialogue/constants.ts`          | The reveal and auto-play timings, once measured                            |
| `packages/genshin-interface/src/components/DialogueScreen/Index.vue` | The replies' traced marks, and the measured look                           |

## Sources

- [Template:DIcon](https://genshin-impact.fandom.com/wiki/Template:DIcon), Genshin Impact Wiki: the marks a dialogue choice is drawn with, a quest's and a story quest's among them.
- [NPC](https://genshin-impact.fandom.com/wiki/NPC), Genshin Impact Wiki: the world's characters, those met in the open world and those met only in quests.
- [AnimeGameData](https://gitlab.com/Dimbreath/AnimeGameData), the community's per-patch dump: the dialog table's roles, among them the black screen a narration is shown on.
