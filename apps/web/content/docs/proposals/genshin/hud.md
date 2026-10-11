---
title: HUD
description: Proposal — what the heads-up display still lacks past its built pieces and looks: the quest tracker's altitude line and its rect, the other characters' skill and burst icons, the stamina meter's section ticks, and the shares and re-measures the roadmap holds for manual verification.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches:
  [
    "packages/genshin-world/src/components/Hud/**",
    "scripts/src/services/genshinParity/shared/**",
  ]
---

# HUD

The [HUD](/docs/genshin/hud) is built with its pieces and their looks, each but the quest tracker standing in its fitted rect of the game's own tree ([interface layout](/docs/genshin/interface-layout) places every screen by that tree). This page keeps what is still unbuilt.

## Decisions

- **The quest tracker has no rect, so it stays provisionally placed** until the game's tree gives it one. It is the one piece the fitted layout does not place.
- **Its altitude line waits on a height.** The tracker's "Higher 1540m" reads the navigated objective's height, which no region data carries until a height is extracted and published by the Mac.
- **The other characters' icons are hosted data.** Each pair of skill and burst icons is some 13 KB of paths, so the roster's icons come from hosted game data rather than committed source.
- **The judgements the roadmap holds stay there.** The stamina flash's share under an eighth, the uncharged burst in the keys' layout and the gold decided against for the burst fill wait on the roadmap's manual verification, and this page does not restate them.

## Scope and order

**Today:** the HUD's block is exported and fitted, every piece but the quest tracker stands in its fitted rect, and each piece's look is built from the recordings it is measured on, as the [as-built page](/docs/genshin/hud) records.

**This adds, in order:**

1. **The quest tracker's altitude line**, once a region's height is published and the navigated objective's height reads from it.
2. **The other characters' skill and burst icons**, from the hosted game data, each pair traced onto its disc as Venti's and Chongyun's are.
3. **The stamina meter's section ticks**, a line about 2 wide at each 100 of the pool, which wait on a pool past 100 that nothing raises yet.
4. **The re-measure of the composite**: `world-hud-hidden.mkv` re-measures the composite later and gates nothing.
5. **Paimon's mark's place and fill**, provisional until measured, since its ink is the whole head as the trace splits it.

## What this does not propose

- **The pieces of features the world lacks**: the chat and the top right's shortcuts.
- **The agent console's bar.** The console is hidden from the game until it is rebuilt in the game's style, which is its own page's.

## Key files

| File                                                         | Role                                  |
| :----------------------------------------------------------- | :------------------------------------ |
| `packages/genshin-world/src/components/Hud/Screen/Index.vue` | Draws each piece with the game's look |

## Sources

- [Paimon Menu](https://genshin-impact.fandom.com/wiki/Paimon_Menu), Genshin Impact Wiki, for the top-left Paimon button, which opens the menu as Escape does.

## Reference

- `world-hud.mkv` — standing still in the open world, the whole HUD on screen, then the minimap turning as the view turns. On the wiki and YouTube, none found (searched 2026-10-11).
- `world-hud-hidden.mkv` — the same standing shot as `world-hud.mkv`, the backslash pressed to hide the HUD and pressed again to show it, so the bare scene scores the HUD alone; the composite compare of the HUD draws over a recording that already shows its HUD. On the wiki and YouTube, none found (searched 2026-10-11).
- `world-stamina.mkv` — a sprint until the stamina meter appears beside the character, then resting until it refills and fades out, the meter in view throughout, 30 seconds at most; its drain, arc and colours are read off a public climb already (`hud-stamina-climb`), so this clip answers the refill, the flash's pace and the fade. On the wiki and YouTube, none found (searched 2026-10-11).
