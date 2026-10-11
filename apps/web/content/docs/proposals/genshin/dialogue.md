---
title: Dialogue
description: Proposal — Genshin's dialogue, still to come. Auto-play's hold timed off a public recording, a resident's standing talk offered beside the quest talks open to them, and the rest of the screen's look measured. The talk graph, its runner, the dialogue screen, a talk begun by F and its words, the line written out at the game's rate, the player filled in, the speaker's title, narration and the replies' marks are built, as the dialogue page describes.
model: claude-opus-5-5
touches: ["packages/genshin-world/src/components/Dialogue/Talk/**"]
---

# Dialogue

A talk runs over the world from F on a resident, with its words written out at the game's rate, the player filled into them, the speaker's title, narration on black and the replies' traced marks: see [dialogue](/docs/genshin/dialogue). What remains times auto-play's hold against the game, offers a resident's own talk beside the quest talks open to them, and measures what is left of the screen's look.

## Decisions

- **A resident offers every talk open to them, each with its mark.** In the game, a character with a quest to give or advance offers it as a reply beside their own chat, drawn with the mark of a quest or a story quest. The first line of a resident's standing talk offers each open quest talk as a reply with that mark, beside the reply that goes on with their own chat.
- **A voiced line is timed as an unvoiced one.** Nothing of the game's audio ships, so auto-play holds every whole line for the same `TALK_AUTO_PLAY_HOLD_MS`, the hold the game gives a line with no voice-over.

## Still to build

1. **Auto-play's hold off a public clip with auto-play on.** The frames from a line with no voice-over being whole to the next line's first character give `TALK_AUTO_PLAY_HOLD_MS`, written as a constant naming the clip, read the way the reveal was (`genshin:parity frames`, then the line's darkness frame by frame). Xinyan's talk at 60 frames a second waits between lines for a click, with auto-play off, so it shows no hold.
2. **A resident's standing talk offered beside their quest talks**, once residents hold standing talks. None does yet (`components/World/Session/Index.vue` merges an empty `standingTalkMap`), so this waits on the [scene group](/docs/proposals/genshin/scene-groups) export, the residents' own talks being read from the scene groups the other machine is exporting.

## Measures owed

These need a recording of the English PC client's dialogue at 1080 high, found among published recordings first ([parity](/docs/genshin/parity)):

- **Whether the world runs on around a talk**: the sky, the clouds and the residents behind the speaker moving or still, read by eye.
- **Auto-play's hold**, read off the line's darkness frame by frame, into `TALK_AUTO_PLAY_HOLD_MS`.
- **The band's gradient, the selected reply's look and the fades**: the speaker's name, the line and the replies are sized and placed off one published frame, and their fades are not yet read.
- **A narration's place on its black screen**, which no published frame read so far shows, so the line's centre on the screen is an estimate.
- **The marks' inner glyphs and colour**: the quest's exclamation mark inside its ring and the story quest's nested diamonds, split from the silhouettes the trace keeps, with the game's gold, and the auto-play and skip buttons' glyphs.

## Key files

| File                                                                 | Role after the change                                                              |
| :------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `packages/genshin-world/src/components/Dialogue/Talk/Index.vue`      | Offers the open quest talks on a standing talk's first line                        |
| `packages/genshin-world/src/components/World/Session/Index.vue`      | Merges the residents' standing talks with the quests' talks                        |
| `packages/genshin-world/src/services/dialogue/constants.ts`          | The auto-play hold, once measured                                                  |
| `packages/genshin-interface/src/components/DialogueScreen/Index.vue` | The measured look: the band, the selected reply, the fades and a narration's place |

## Sources

- [NPC](https://genshin-impact.fandom.com/wiki/NPC), Genshin Impact Wiki: the world's characters, those met in the open world and those met only in quests.
