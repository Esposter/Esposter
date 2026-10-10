---
title: Dialogue
description: Proposal — Genshin's dialogue, still to come. The Traveler's name and gender filled into a talk's lines, the speaker's role and narration read from the dialog table, the replies' marks traced, a resident's standing talk offered beside the quest talks open to them, and the screen's look and timings measured. The talk graph, its runner, the dialogue screen with auto-play and skip, F on a resident beginning their talk and the quests' words loaded with it are built, as the dialogue page describes.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/components/Dialogue/Talk/**"]
---

# Dialogue

The talk graph, its pure runner, the dialogue screen and the talk host that runs one over the world, with auto-play and skip, are built. So is a resident placed in a region's data with the talk F begins, the quests' words loaded with it, and the world's screen for a talk: see [dialogue](/docs/genshin/dialogue). What remains fills the player into a talk's lines, reads the speaker's role and narration, draws the replies' marks, and measures the screen against the game's.

## Decisions

- **F on a resident begins their talk.** The [interaction](/docs/proposals/genshin/interaction) prompts list each resident in reach whose talk the world holds as a talk, named in the reader's language and standing on the ground at their spot. F on one sets that talk and opens `ScreenKind.Dialogue`, and the world screen mounts `DialogueTalk` over the world with the talks' text map while it is open; the talk's `end` sets the world back. Until residents' own talks are served, the talks the world holds are its quests' talks.
- **A quest's talk takes the resident's place while its step is open.** When the current step of a quest in progress asks for a talk with a resident, F on that resident runs the quest's talk rather than their own. Its end is the talk-to event the quest's progress waits on ([quests](/docs/genshin/quests)).
- **A resident offers every talk open to them, each with its mark.** In the game, a character with a quest to give or advance offers it as a reply beside their own chat, drawn with the mark of a quest or a story quest. The first line of a resident's talk offers each open quest talk as a reply with that mark.
- **A talk's words are loaded with it.** The reader publishes a text map for each language, holding every word the carried quests and residents show (the `questText` records). The host loads the reader's language once, as [game text](/docs/genshin/game-text) loads its chunk, and hands it to the talk host.
- **The Traveler's name and gender are filled in.** A line holding the player's nickname or a word per gender is shown through `fillLinePlaceholders`, filled from the player's own name and twin once the world has a player profile. Until then the nickname is the game's own title for the Traveler (`GameTextKey.Traveler`, itself filled as the login fills it) and the gender is `TravelerGender.Female`, since the world plays the female twin (`TRAVELER_CHARACTER_ID`), as the login does (`LOGIN_TRAVELER_GENDER`).
- **Narration is drawn as the game draws it.** A line the game shows on a black screen is read with its role, and it is drawn centred on black with no speaker. The dialog table's black-screen roles (`TALK_ROLE_BLACK_SCREEN`, `TALK_ROLE_NEED_CLICK_BLACK_SCREEN` and their `CONSEQUENT_` forms) name no speaker, so a spoken line whose `speakerTextId` is empty is a narration, as `SpokenTalkLine` already reads it, and the schema gains no field.
- **The speaker's role is the NPC's manual title.** The role drawn under the name is the manual text map's `NPC_TITLE_<npc id>`, the npc id being the dialog's `talkRole.id` (`genshin:text find "^Waitress, Good Hunter$"` gives `NPC_TITLE_1419` and `NPC_TITLE_15241`, Sara's). The dialog's own `talkTitleTextMapHash` resolves to no text, so it is not the role. An NPC with no `NPC_TITLE_` key has no role.
- **Voices are not played from the game.** Nothing of the game's audio ships, so a voiced line is shown and timed as an unvoiced one.

## Still to build

1. **The player filled into a talk's lines.** In `packages/genshin-world/src/components/Dialogue/Talk/Index.vue`, every word read from `textMap` (the line, each reply and the speaker's name) passes through `fillLinePlaceholders` from `genshin-text`, with the nickname `fillLinePlaceholders(gameText[GameTextKey.Traveler], "", TravelerGender.Female)` (as `components/Login/Screen/Index.vue` fills the Traveler's title) and `TravelerGender.Female`. `lineLength` counts the filled line, so the reveal times what is shown. The proof is `components/Dialogue/Talk/Index.browser.test.ts`, on the pattern of `components/Gcg/Session/Index.browser.test.ts`: a one-line talk whose text is `{NICKNAME}, {M#he}{F#she} said.` with a `startProgress` holding it whole renders the Traveler's title followed by `, she said.`, and no `{` survives.
2. **The speaker's role and narration from the dialog table.** `scripts/src/services/genshinText/readTalk.ts` sets a spoken line's `speakerRoleTextId` to `NPC_TITLE_<talkRole.id>` where the manual text map (`readManualTextMap`) holds that key, `""` otherwise, and `buildQuests.ts` publishes those keys' words into each language's quest text beside the lines (a handful of strings in the chunk the quests already load, no new file). `readTalk.test.ts` gains a case: an NPC dialog whose role id has a manual title carries it, and a `TALK_ROLE_BLACK_SCREEN` dialog has an empty speaker and role. `DialogueScreen` then draws a spoken line with no speaker centred over black, its fixture gaining a `narration` variant. Needs the dump and the manual text map (`game-exports`).
3. **The replies' marks**, traced from the wiki's files with `pnpm -C scripts genshin:parity trace "File:Icon Dialogue Talk White.png"`, then `Icon Dialogue Quest.png` and `Icon Dialogue Story Quest.png`, each into a path of `DialogueChoiceIcon`'s mark in `DialogueScreen`, at the place the screen already keeps beside each reply.
4. **The reveal and auto-play timings off a public 60 frames a second clip.** `pnpm -C scripts genshin:parity clip https://www.youtube.com/watch?v=9I7XyJ2Z5RI --from 0 --to 30 --name dialogue-npc-60` (an English PC client's NPC talks at 1080p60), then `genshin:parity frames` over the first line's first second and `luma` over its band: the frames from the line's first ink to its last give `TALK_REVEAL_MS_PER_CHARACTER`, written as a provisional constant naming the clip, and a line whole in its first frame at 60 frames a second sets it to 0, the game then showing a line whole. Auto-play's hold waits on `dialogue-auto-skip.mkv`, since no published clip found shows auto-play on.
5. **A resident's standing talk offered beside their quest talks**, once residents hold standing talks: no resident does yet (`components/World/Session/Index.vue` merges none), so this waits on the residents' talks being read from the scene groups the other machine is exporting.

## Measures owed

These need a recording of the English PC client's dialogue at 1080 high, found among published recordings first ([parity](/docs/genshin/parity)):

- **Whether the world runs on around a talk**: the sky, the clouds and the residents behind the speaker moving or still, read by eye.
- **The line's reveal rate and auto-play's hold**, read off the line's darkness frame by frame (`frames`, then `luma` over the line's band), into `TALK_REVEAL_MS_PER_CHARACTER` and `TALK_AUTO_PLAY_HOLD_MS`. The published recording of the dialogue choices shows each line whole in one 30 frames a second frame, so the reveal waits on the recording the [dialogue](/docs/genshin/dialogue) page says is owed.
- **The band's gradient, the selected reply's look and the fades**: the speaker's name, the line and the replies are sized and placed off one published frame, and their fades are not yet read.
- **A backdrop with the dialogue off**: `compare`'s backdrop draws the game's own line and replies, so the overlay cannot be scored until the scene is shot without them.
- **The speaker's role line** (the title under the name, "Waitress, Good Hunter" in the published frame), which the talk's schema does not hold: its text id comes from the dialog table.
- **The replies' marks**, traced from the wiki's files of the game's own (`Icon Dialogue Talk White.png`, `Icon Dialogue Quest.png`, `Icon Dialogue Story Quest.png`) into paths of our own, and the auto-play and skip buttons' glyphs beside them.

## Key files

| File                                                                 | Role after the change                                                      |
| :------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/Dialogue/Talk/Index.vue`      | Fills the placeholders, draws narration and offers the open quest talks    |
| `packages/genshin-world/src/components/World/Session/Index.vue`      | Mounts the talk host when F begins a talk, and holds the controls under it |
| `packages/genshin-world/src/services/dialogue/constants.ts`          | The reveal and auto-play timings, once measured                            |
| `packages/genshin-interface/src/components/DialogueScreen/Index.vue` | The replies' traced marks, and the measured look                           |

## Sources

- [Template:DIcon](https://genshin-impact.fandom.com/wiki/Template:DIcon), Genshin Impact Wiki: the marks a dialogue choice is drawn with, a quest's and a story quest's among them.
- [NPC](https://genshin-impact.fandom.com/wiki/NPC), Genshin Impact Wiki: the world's characters, those met in the open world and those met only in quests.
- [AnimeGameData](https://github.com/DimbreathBot/AnimeGameData), the community's per-patch dump: the dialog table's roles, among them the black screen a narration is shown on.
