---
title: HUD
description: Proposal — what the heads-up display still lacks past its shell and its built pieces: each piece placed by the HUD's own RectTransform tree, its places and looks measured against a recording of the English PC client, and Paimon's mark traced onto its button.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches:
  [
    "packages/genshin-world/src/components/Hud/**",
    "packages/genshin-world/src/data/hud/**",
    "scripts/src/models/genshinAssets/shared/**",
    "scripts/src/services/genshinAssets/fit/**",
  ]
---

# HUD

The [HUD](/docs/genshin/hud) is built with its stamina meter, its quest tracker, the deployed team's portraits, the member on the field's health and its skill and burst buttons, beside the Paimon button, the [minimap](/docs/genshin/minimap) and the [touch controls](/docs/genshin/touch-controls). Every place, size and colour of those is provisional: the pieces stand where the shell puts them until the game's own layout is read. This page keeps what is still unbuilt. It builds on [interface layout](/docs/genshin/interface-layout), which places every screen by the game's own rect tree.

## Decisions

- **Laid out by the game's own tree.** Each piece sits in the `GameRect` of its place in the HUD's RectTransform tree, as the login's interface does. Finding the HUD's block is named work: its entry in `DerivedAssetComponentMap` comes first, then `genshin:assets interface` over it and the fit that writes its rects. Each piece rides in its game parent, so the screen holds on any window shape.
- **Measured like the login.** Each piece's size, colour and place come from a recording of the English PC client's world at 1080 high (showing the Paimon button, the minimap turning as the camera turns, the party down the right through a switch, the stamina meter draining to empty and refilling, a quest navigated on its tracker, and a fight with the HP bar falling, the skill on its cooldown and the burst filling, used and cooling), published ones searched first, named in `ParityReferenceMap`. The screen is compared over that recording's own frame with the scene behind it, then shot bare and approved in the visual suite, with its fixture and reference beside it.
- **The HUD's block is the in-level page's block.** The asset index holds no GameObject, so the block is found by an indexed asset beside the page, as the login's is. The page's GameObject, `InLevelMainPage`, is in `00/04803507.blk`, and its clips (`Ani_InLevelMainPage_FadeIn`, `_FadeOut` in `00/03931010.blk`, `_VirtualDial_Show` and `_Hide` in `00/13058112.blk`) are named for it, as `LoginMainPage`'s are the login's. The anchor is `TeamBtn_MP`, the party button's Animator, which only `00/04803507.blk` holds among the game's blocks, where `GrpMainPage` is in four. Its root is `InLevelMainPage`: its tree holds `GrpMiniMap`, `BtnPlayerProfile`, `SPBar`, `TeamBtnContainer` and `GrpActionBtn`, the minimap, Paimon's button, the stamina meter, the party and the skill buttons.
- **Paimon's mark is traced.** Built: the Paimon button draws the face traced from the game's own frame (`hud-world-pickup`, the 90 pixel box at 100, 10) as a path of our own, as every glyph is ([interface library](/docs/genshin/interface-library)). Its ink is the whole head as the trace splits it, with the tracer's default share, so its place and fill are provisional until measured.

## How it works

```mermaid
flowchart TD
  TREE["The HUD's RectTransform tree, fitted to its interfaceRects.json"] --> SCR["Hud/Screen: a GameRect per piece"]
  SCR --> PB["Paimon button, its mark traced"]
  SCR --> MM["Minimap"]
  SCR --> PIECES["The built pieces, each in its fitted place"]
```

## Scope and order

**Today:** every piece stands in its fitted rect of the game's tree, its looks still provisional: the stamina meter, the quest tracker, the party's portraits, the member's health and the skill and burst buttons.

**This adds, in order:**

1. **The looks.** Each piece's look is replaced with the game's, read off the copied captures and `hud-world-pickup`. Paimon's mark is built (traced from the same frame, as the Decisions say). `world-hud-hidden.mkv` re-measures the composite later; it gates nothing.

The HUD's block is exported and fitted, and each piece is placed by its fitted rect, both built ([as-built page](/docs/genshin/hud)). The quest tracker has no rect in the HUD's tree and stays at its provisional place until one is found.

## What this does not propose

- **The pieces of features the world lacks**: the chat and the top right's shortcuts.
- **The agent console's bar.** The console is hidden from the game until it is rebuilt in the game's style, which is its own page's.

## Key files

| File                                                                    | Role after the change                |
| :---------------------------------------------------------------------- | :----------------------------------- |
| `packages/genshin-world/src/components/Hud/Screen/Index.vue`            | Places each piece in its fitted rect |
| `scripts/src/services/genshinAssets/shared/DerivedAssetComponentMap.ts` | Gains the HUD's block and its roots  |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`       | Gains the HUD's recordings           |

New files:

```text
scripts/src/services/genshinAssets/fit/fitHud.ts
packages/genshin-world/src/components/Hud/Screen/Index.fixture.ts
packages/genshin-world/src/components/Hud/Screen/Index.reference.ts
packages/genshin-world/src/data/hud/interfaceRects.json
```

## Sources

- [Paimon Menu](https://genshin-impact.fandom.com/wiki/Paimon_Menu), Genshin Impact Wiki, for the top-left Paimon button, which opens the menu as Escape does.
