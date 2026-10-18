# Persona accent and status line

The two surfaces that carry the session's character's colour.

## The accent

The character's colour reaches the screen as the [genshin mods](../../genshin-mods/README.md)' accent: the one colour the official art hangs on them — a hair, a coat, a signature accent — read off the card art into `CharacterColorMap`, so a Hu Tao day reads plum and a Nahida day mint at a glance, across the whole spectrum rather than the one band per element a roster this size would share out. Where the colour misses WCAG AA on dusk's background, the dark surface a terminal mostly is — the deep reds and blues, such as Hu Tao's plum — it is lightened in OKLab until it passes, keeping the hue and chroma so a red stays a red rather than washing out to pink. The game publishes no colour per character, so every row is a read of the art, and the element's colour stands in for a character with no row yet: a new patch is a dependency bump and a row here. The colour is a static module keyed by the English name, and the state files carry the element beside the name for the fallback, so neither costs a lookup.

## The status line

The status line is a settings command a plugin cannot set, so the plugin ships one a person names in their own settings: the status-line script reads the same record the status script does, by the session id Claude Code hands it on stdin, and prints the nameplate: the name in the character's colour on a badge of that colour's tone, a tonal fill over dusk's background with the name lightened in OKLab until it reads on the badge. The badge carries its own contrast because a status line's output is piped, so the command has no terminal to ask for its background. A character with neither a colour nor an element of their own is named plain. It reads the state directory under the home folder, so it needs none of the plugin's environment and runs from wherever the settings name it. This repository names it in its checked-in project settings, resolving the path from the checkout's root so a session started in a subfolder or a worktree finds it; a person who has their own status line keeps it in their local settings, which outrank the project's.

## Key files

| File                                                           | Role                                                                                               |
| :------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `packages/genshin-persona/scripts/statusLine.ts`               | The status line a person names in their settings: the session's nameplate                          |
| `packages/genshin-persona/src/services/formatNameplate.ts`     | The nameplate: the name in the character's colour on a tonal badge that carries its own contrast   |
| `packages/genshin-persona/src/services/getNameplateColor.ts`   | The character's own colour, else the element's — the one lookup the accent and the nameplate share |
| `packages/genshin-persona/src/services/getPersonaCharacter.ts` | The character's colour, else the element's, made readable on a dark terminal                       |
| `packages/genshin-persona/src/services/CharacterColorMap.ts`   | The one colour the official art hangs on each character, read off the card art                     |
