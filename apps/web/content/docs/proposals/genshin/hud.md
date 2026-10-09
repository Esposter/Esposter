---
title: HUD
description: Proposal — what the heads-up display still lacks past its built pieces, each but the quest tracker already placed by the HUD's own RectTransform tree: their looks measured against a recording of the English PC client.
model: claude-opus-5-5
needs: [game-install, game-exports]
touches:
  [
    "packages/genshin-world/src/components/Hud/**",
    "scripts/src/services/genshinParity/shared/**",
  ]
---

# HUD

The [HUD](/docs/genshin/hud) is built with its stamina meter, its quest tracker, the deployed team's portraits, the member on the field's health and its skill and burst buttons, beside the Paimon button, the [minimap](/docs/genshin/minimap) and the [touch controls](/docs/genshin/touch-controls). Each piece but the quest tracker stands in its fitted rect of the game's own tree, the tracker having no rect there and staying at its provisional place, and every size and colour of those is provisional. This page keeps what is still unbuilt. It builds on [interface layout](/docs/genshin/interface-layout), which places every screen by the game's own rect tree.

## Decisions

- **Laid out by the game's own tree.** Each piece with a place in the HUD's RectTransform tree sits in that place's `GameRect`, as the login's interface does; the quest tracker has none, so it stays provisionally placed. Built: the HUD's block has its entry in `DerivedAssetComponentMap`, `genshin:assets interface` exports it and `fitHud` publishes its rects. Each piece rides in its game parent, so the screen holds on any window shape.
- **Measured like the login.** Each piece's size and colour come from a recording of the English PC client's world at 1080 high (showing the Paimon button, the minimap turning as the camera turns, the party down the right through a switch, the stamina meter draining to empty and refilling, a quest navigated on its tracker, and a fight with the HP bar falling, the skill on its cooldown and the burst filling, used and cooling), published ones searched first, named in `ParityReferenceMap`. The screen is compared over that recording's own frame with the scene behind it, then shot bare and approved in the visual suite, with its fixture and reference beside it.
- **The HUD's block is the in-level page's block.** The asset index holds no GameObject, so the block is found by an indexed asset beside the page, as the login's is. The page's GameObject, `InLevelMainPage`, is in `00/04803507.blk`, and its clips (`Ani_InLevelMainPage_FadeIn`, `_FadeOut` in `00/03931010.blk`, `_VirtualDial_Show` and `_Hide` in `00/13058112.blk`) are named for it, as `LoginMainPage`'s are the login's. The anchor is `TeamBtn_MP`, the party button's Animator, which only `00/04803507.blk` holds among the game's blocks, where `GrpMainPage` is in four. Its root is `InLevelMainPage`: its tree holds `GrpMiniMap`, `BtnPlayerProfile`, `SPBar`, `TeamBtnContainer` and `GrpActionBtn`, the pieces [HUD](/docs/genshin/hud) lists.
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

**Today:** the HUD's block is exported and fitted, and every piece but the quest tracker stands in its fitted rect of the game's tree ([as-built page](/docs/genshin/hud)), the stamina meter on the screen beside the character; the touch layout's buttons and the meter's arc are measured, and the rest of the looks are still provisional: the party's portraits, the member's health and the keys' skill and burst buttons. The quest tracker has no rect in the HUD's tree and stays at its provisional place until one is found.

**This adds, in order:**

1. **The looks.** Each piece's look is replaced with the game's, read off the copied captures and `hud-world-pickup`. Paimon's mark is built (traced from the same frame, as the Decisions say). `world-hud-hidden.mkv` re-measures the composite later; it gates nothing. The party, health and skill buttons are built first, each measured with `genshin:parity compare hud-world-pickup` before and after, and the stamina meter with `hud-stamina-climb`; the quest tracker's altitude line ("Higher 1540m") comes last, since it waits on the navigated objective's height, which no region data carries until a height is extracted and published by the Mac.

The looks, as built so far (`hud-world-pickup`, head 3ee1c42c1f: mean 10.34%, shape 0.220, tone 9.50%, FLIP 0.4321): the party's rows are built, each name right of its HP bar and left of its portrait, with no slot number (mean 10.34%, shape 0.237, FLIP 0.4319). The health bar was tried with the level before the bar and the numbers over it, and was reverted: its mean rose to 10.35%.

`hud-world-pickup` turned out to be the mobile client: the recording says so as it reaches the frame, and its three discs are the touch layout's sprint, attack and jump. So the touch layout is built ([HUD](/docs/genshin/hud)): the attack, aim, jump and sprint buttons beside the skill and burst, each disc placed from `GrpActionBtn`'s corner, its glyph traced from the game's icon, and the fixture draws it with Venti, the bow's wielder the frame shows, on the field. Baselines re-taken on 2026-10-10 read the same on the Mac as on the PC: mean 10.34%, shape 0.237, tone 9.50%, FLIP 0.4319. Built: mean 10.06%, shape 0.341, tone 9.20%, FLIP 0.4285 on the Mac.

The stamina meter is measured on `hud-stamina-climb`, the PC client's meter part drained on a public climb (the capture `yt-hRR2yoP3uY0-world-stamina.mp4`): an arc of radius 104.5 round the pivot, 54 degrees long and 7 wide, a yellow fill over a dark red track, flashing under an eighth. The meter had stood inside its tree rect at the screen's middle, offset off the screen by the pivot; it now stands on the screen. Before, mean 3.25%, shape 0.018, tone 3.68%, FLIP 0.1764 (the meter off the region); built, mean 1.97%, shape 0.724, tone 2.17%, FLIP 0.1411, both on the Mac, the reference new with this pass.

Left of the looks: each character's own skill and burst icons on their discs and the burst's fill in the element's colour, which no dataset carries yet; the keys' layout of the skill and burst, whose reference is the same recording's PC frames before the mobile part (its E, Q and Z caps at about 4 seconds); the meter's section ticks, its flash and its fades (`world-stamina.mkv`); whether the mobile client drops the field member's row, since the recording lists three rows with Venti on the field; and the tracker's altitude line.

## What this does not propose

- **The pieces of features the world lacks**: the chat and the top right's shortcuts.
- **The agent console's bar.** The console is hidden from the game until it is rebuilt in the game's style, which is its own page's.

## Key files

| File                                                              | Role after the change                 |
| :---------------------------------------------------------------- | :------------------------------------ |
| `packages/genshin-world/src/components/Hud/Screen/Index.vue`      | Draws each piece with the game's look |
| `scripts/src/services/genshinParity/shared/ParityReferenceMap.ts` | Gains the HUD's recordings            |

New files:

```text
packages/genshin-world/src/components/Hud/Screen/Index.reference.ts
```

## Sources

- [Paimon Menu](https://genshin-impact.fandom.com/wiki/Paimon_Menu), Genshin Impact Wiki, for the top-left Paimon button, which opens the menu as Escape does.
