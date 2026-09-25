---
title: Crisp pixel art
description: Proposal — the dungeons game's pixel-grid sprites and tilesets scale without smoothing, while its painted backgrounds and Kenney's smooth UI keep theirs.
model: claude-opus-5-5
---

# Crisp Pixel Art

The agent console's world already renders at half the device's pixels scaled up unsmoothed, so its voxels read as pixels. The dungeons game does not: Phaser fits its fixed stage to the window and smooths every texture as it scales, so a character sheet or a tileset drawn on a pixel grid blurs at any size but its own. Phaser's `pixelArt` setting is not the answer, because the game also holds painted backgrounds at the stage's size and Kenney's UI pack, which smoothing is right for, and the setting turns smoothing off for every texture at once.

## Scope

- **Nearest-neighbour filtering per texture.** Each texture drawn on a pixel grid — the characters, the monsters, the attack sprites, the world's tilesets — is filtered nearest once it loads, and every other texture keeps linear filtering.
- **Which textures those are is decided by looking.** The sources mix pixel art with painted and vector art, sometimes within one source, so each sheet is checked by eye at a scale above one before it joins the pixel set, and the set is written beside the loaders that name the keys.
- **Positions round to whole pixels** where a pixel sprite moves, so a sprite never lands between two and smears across both.

## Key files

| File                                     | Role after the change                                          |
| :--------------------------------------- | :------------------------------------------------------------- |
| `apps/web/app/services/dungeons/loader/` | Its loaders mark the pixel-grid keys filtered nearest on load  |
| `apps/web/app/pages/dungeons.vue`        | The game's configuration, which keeps smoothing as its default |

## Sources

- [Image rendering](https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering), MDN: pixelated scaling for pixel art.
