# Themes

## Why

The console has a theme registry holding the default theme and the Genshin theme, and it already sets a theme's avatar, palette and reactions. The parts a theme may still add, the scene and the voice, are not yet built for the Genshin theme. Without them the console's look cannot be dressed by a character, and the spoken replies have no voice on the console.

## What Changes

A theme may add a palette, a scene, reactions and a voice to the console, and the Genshin theme is the first to add them. A theme never removes a part of the console that terminal parity needs.

- The Genshin theme's palette comes from the session character's element.
- The Genshin theme's voice comes from the resident synthesizer, which speaks each spoken line in a reply once.
- The Genshin theme's scene and reactions are built in their own changes: the wish banner, the element ambience, and spatial chat as an option.
- Each session keeps the look of the theme whose plugin began it, so a Genshin session and a default session can run side by side.
- Notifications when the tab is hidden are shown under every theme.

## Capabilities

- **infra/agent-console/themes** (new)

## Waiting on

None.

## Impact

- The theme interface gains a voice part and a scene part, each added with the first theme that sets it.
- The console's Genshin theme speaks replies through the resident voice.
- Each session resolves its own theme and palette.
