---
title: Dialogue
description: Genshin's dialogue as built. A talk is a graph of spoken lines and the Traveler's replies, each line's words named by the game's own text id. A pure runner advances it as a click, F or Space does, chooses a reply, and skips to the next reply or the end. The dialogue screen writes the line out in place under its speaker's name, offers the replies down the right, and carries auto-play and skip. A resident placed in a region's data names the talk F begins with them.
---

# Dialogue

In the game, a conversation is a run of lines on a band at the foot of the screen, each under its speaker's name and written out a character at a time. The Traveler never speaks a line aloud: their replies are offered down the right as choices, even when only one is on offer. The world holds a conversation the same way the game's data does, as a graph of lines, and runs it with a few pure functions. A screen draws it, and a host wires the clicks, keys and timers to it.

## How it works

```mermaid
flowchart TD
  START["A talk starts at its first line, unwritten"] --> WRITE{"Line written out whole?"}
  WRITE -->|"no: click, F or Space"| WHOLE["The line shown whole"]
  WRITE -->|"no: the reveal's time runs out"| WHOLE
  WHOLE --> OFFER{"Its next lines are replies?"}
  OFFER -->|"yes"| CHOOSE["Replies offered; a click, or F on the lit one, chooses"]
  CHOOSE --> FOLLOW{"The reply is followed by more replies?"}
  FOLLOW -->|"yes"| OWN["The reply stays on screen as the Traveler's line"]
  OWN --> CHOOSE
  FOLLOW -->|"no"| NEXT
  OFFER -->|"no: click, F, Space, or auto-play's hold"| NEXT{"Anything follows?"}
  NEXT -->|"yes: the first"| START2["The next line, unwritten"]
  START2 --> WRITE
  NEXT -->|"no"| END["The talk ends"]
  SKIP["Skip"] -.->|"runs on through spoken lines"| OFFER
```

### The talk graph

A `Talk` holds its lines and the id of the one it starts at. Each line has its own id, the ids of the lines that may follow it and its words' text id. There are two kinds of line:

- **A spoken line** names its speaker's name by text id, which is empty for a narration, and the voice-over the game files it under, which is empty for an unvoiced line.
- **A choice** is one of the Traveler's replies. It carries the mark the game draws beside it: a plain reply or chat, a choice that starts a quest, or one that starts a story quest. These are the names the wiki's transcripts use for the game's marks.

Both have Zod schemas, so a talk that is fetched or generated is checked before it runs. The words are never in the graph. A host hands the screen the talk's text map, its words by text id in the reader's language, as [game text](/docs/genshin/game-text) does for the interface's own words.

### The runner

Where a talk stands is a `TalkProgress`: the id of the line on screen, empty once the talk has ended, and whether its words are all written out. Four pure functions move it:

- **`advanceTalk`** is a click, F or Space. A line still being written out is shown whole. A whole line goes on to the first of its next lines, as the game would pick one by a quest's state. A line nothing follows ends the talk. A line that offers replies waits, and an ended talk stays ended.
- **`chooseTalkLine`** chooses one of the replies on offer, and refuses one that is not on offer. The talk goes on down the reply's branch, or ends where nothing follows it. A reply followed straight by more replies stays on screen as the Traveler's own line while the next ones are offered.
- **`skipTalk`** runs on to the next line that offers replies, written out whole, or to the end, so a skip never answers for the player. A talk whose spoken lines loop back without a reply between them is refused, since it would never get anywhere.
- **`getTalkChoices`** gives the replies a line offers: those of its next lines that are choices.

### On screen

`DialogueScreen` in `genshin-interface` draws a talk's state and nothing else. It shows the speaker's name over the line, which is laid out whole with its unwritten tail held in place unseen, so the line never rewraps as it is written. The replies run down the right, with the one F would choose lit. A screen reader hears the whole line once, not its characters one by one.

`DialogueTalk` in `genshin-world` runs a talk over the world:

- **The line is written out** a character at a time, at `TALK_REVEAL_MS_PER_CHARACTER`, and is then shown whole.
- **A click goes on, and so do F and Space.** These keys are read off the engine's own `InputActionBindingMap`, as its Interact and Jump, so they stay the game's default bindings. While replies are on offer, F chooses the lit one and the arrows move the light between them.
- **Auto-play** holds each whole line for `TALK_AUTO_PLAY_HOLD_MS` and then goes on, stopping at replies. Its button reads the game's own "Auto" and "Playing".
- **Skip** runs on to the next replies or to the end. Its button reads the game's own "Skip".
- **A reply's speaker is the Traveler**, named with the game's own title for them.

### Residents

A region's data lists its residents beside its landmarks. Each resident has the game's own id, a name by text id, the spot they idle at and the way they face there, their catalogue area, and the talk F begins with them. The [quests](/docs/genshin/quests) page's navigation finds a resident by their id or by their talk's id.

## Key files

| File                                                                 | Role                                                                  |
| :------------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `packages/genshin-world/src/models/dialogue/Talk.ts`                 | A talk: its lines and where it starts, with its schema                |
| `packages/genshin-world/src/models/dialogue/TalkLine.ts`             | A line: spoken, with its speaker and voice, or one of the replies     |
| `packages/genshin-world/src/services/dialogue/advanceTalk.ts`        | A click, F or Space: written out whole, on to the next, or the end    |
| `packages/genshin-world/src/services/dialogue/chooseTalkLine.ts`     | A reply chosen, and the branch it leads down                          |
| `packages/genshin-world/src/services/dialogue/skipTalk.ts`           | On to the next replies or the end                                     |
| `packages/genshin-world/src/services/dialogue/constants.test.ts`     | The hand-written sample talk every runner suite walks                 |
| `packages/genshin-world/src/services/dialogue/constants.ts`          | The provisional reveal and auto-play timings                          |
| `packages/genshin-world/src/components/Dialogue/Talk/Index.vue`      | A talk run over the world: reveal, keys, auto-play and skip           |
| `packages/genshin-interface/src/components/DialogueScreen/Index.vue` | The speaker's name, the line written out in place, and the replies    |
| `packages/genshin-interface/src/models/DialogueChoiceIcon.ts`        | The marks a reply is drawn beside                                     |
| `packages/genshin-world/src/models/world/Resident.ts`                | A resident placed in a region's data, and the talk F begins with them |

## Notes

- **The reveal is not visible in the published recording.** An English-language public recording of the dialogue choices, at 30 frames a second and 1280 by 720, shows each line whole in its first frame: two lines measured in full, the text's ink filling in one frame and not character by character. So `TALK_REVEAL_MS_PER_CHARACTER` stays provisional, and the next line is timed off a 60 frames a second recording of a line being written out, which is owed.
- **The auto-play hold is not measured.** `TALK_AUTO_PLAY_HOLD_MS` waits on the same recording as the reveal, since no published clip found shows auto-play on.
- **The screen's place and colour are read off one frame.** The speaker's name is gold `#ffc700`, the brightest saturated pixel of its letters. The replies are dark pills 45 high and 15 apart, the first at 1275 by 698 of 1920 by 1080. Its score is not taken: the frame draws the game's own line and replies in the backdrop, so `compare` cannot isolate the overlay from it, and a backdrop with its dialogue off is owed.
- **The speaker's role is not drawn.** The recording sets a role under the name, as "Waitress, Good Hunter" does under Sara, from the dialog table's title text id, which the talk's schema does not hold yet.
- **The Confirm prompt is not drawn.** The frame shows a controller's X mark and the word Confirm bottom right. The keyboard client's key for it is the reader's call.
- **The selected reply's look is not settled.** Both replies in the frame are the same dark pill, and the first is marked by a controller's X prompt, which the keyboard client does not show. The screen still lights the selected reply white, which no frame shows.
- **No voice plays.** A line carries the id of its voice-over, but nothing of the game's audio ships, so the voice-over is never played.
- **The replies' marks are not drawn yet.** Each reply carries its mark, and its place beside the reply is kept, until the game's marks are traced into paths of our own.

## Sources

- [Template:DIcon](https://genshin-impact.fandom.com/wiki/Template:DIcon), Genshin Impact Wiki: the marks the game draws beside a dialogue choice, a plain reply or chat, a quest and a story quest among them.
- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: F as Pick Up/Interact and Space as Jump, the keys a talk goes on with.
- [Genshin Impact dialogue choices](https://www.youtube.com/watch?v=nWBqOXWZuFg), an English-language public recording of the dialogue choices at 720 high, with controller prompts: the reply frame the screen is placed by, and the line frames the reveal was read off.
- [AnimeGameData](https://gitlab.com/Dimbreath/AnimeGameData), the community's per-patch dump: the dialog table's lines, each naming the ones that follow it and its speaker's role, with the Traveler's lines offered as choices.
