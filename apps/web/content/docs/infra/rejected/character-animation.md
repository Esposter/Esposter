---
title: Character animation
description: Playing the session character's burst, attacks or idle animation in the terminal beside the persona plugin's welcome — rejected after three renderings were tried and none read.
---

# Character animation

The [persona plugin](/docs/infra/claude-interface/persona-plugin) opens a session with a three-line welcome naming the character. The idea was to show them too: the character's elemental burst, and later each attack, the skill and the two character-screen idles as their own loops, one chosen per session and pinnable — played in a pane the start hook opens beside the welcome, or ideally inside it. The community wiki hosts every clip as an animated file per talent and per idle, at the game's own size, so the footage was never the problem.

**Why not:** Three probes, each answering the next.

- **The tool's frame cannot hold a picture.** The welcome is one static string with a cap a single small frame overruns tenfold; the escape sequences a hook may emit are allow-listed to window titles and notifications, so nothing moves a cursor; the status line re-runs on message events, never a clock. Whatever plays, plays in a second window beside the tool — which is already not the feature.
- **Mapping the footage does not survive a terminal's resolution.** Half-block cells, sixel, an ASCII luminance ramp and an edge-directed ramp were each rendered from the clips at a hundred columns. The pixel rungs play a small video in a terminal, which is not the tool's look; the glyph rungs paint the desert dense and the figure as a smudge or as noise, and read as neither.
- **Drawing it by hand does not scale.** A chibi in parts — one head, a torso per arm pose, effects on their own tinted layer, a handful of keyframes per clip — is the one rendering that matches the aesthetic, and it took a session for one character, was judged unacceptable at the end of it, and would be owed a hundred times over for the roster.

The nameplate in the element's colour, which the status line already paints, is as much of the character as the terminal shows.
