# Interaction

In the game, whatever the character can act on shows as a row of prompts beside it: an item to pick up, a chest to open, a character to talk to, a notice to read, a waypoint to activate (`{data-root}/genshin-parity/references/interaction-prompts-pickup.png`). One row is selected, F acts on it, and with several things in reach the mouse wheel moves the selection through the rows. The world package holds the rules as pure functions over the things near the body, places the drops and the residents in the world as those things (`packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts`), and `genshin-interface` draws the rows over it (`packages/genshin-interface/src/components/InteractionPrompts/Index.vue`).

## How it works

The rules are `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts`, `stepInteractionSelection.ts` and `getHeldPickUp.ts`, read by `packages/genshin-world/src/composables/useInteraction.ts`.

```mermaid
flowchart TD
  T["Interactables: the drops, the residents with a talk and the jump landmarks"] --> R{"Within reach of the body?"}
  R -->|"no"| X["Not shown"]
  R -->|"yes"| O["Rows: nearest first, then by id"]
  S["Last frame's selected id and window"] --> K{"Selected thing still in the rows?"}
  O --> K
  K -->|"yes"| SEL["It stays selected"]
  K -->|"no"| FIRST["The first row is selected"]
  SEL --> WIN["The window keeps its first row unless the selection left it"]
  FIRST --> WIN
  W["Mouse wheel"] -->|"more than one row: a row a notch"| S
  W -->|"one row or none"| CAM["The camera zooms"]
  F{"F"} -->|"press"| ACT{"The selected row"}
  ACT -->|"a drop"| PICK["A currency into the wallet, an item into the bag, the rest left on the ground"]
  ACT -->|"a resident"| TALK["Their talk begins"]
  F -->|"held, each repeat interval"| REP["Pick up the selected item, or the first item"]
  P["A row pressed: a tap, or a click with the cursor shown"] -->|"selects its thing, taps Interact"| F
```

- **Eight kinds.** `InteractionKind` is what acting on a thing does, and so its row's icon: `PickUp` takes an item into the [inventory](../inventory/design.md), `Open` opens a chest, `Dig` digs up the ground over a buried chest, `Talk` starts a character's dialogue, `Read` shows a book, a notice or a sign, `Activate` unlocks a waypoint for the map, `Claim` collects a blossom from an outcrop or a trounced boss, and `Use` acts on an object of its own, such as the [crafting](../crafting/design.md) bench or a fishing spot. A row's words are the thing's own name in the reader's language. The kind lives in `genshin-interface` beside the prompt list that draws it (`packages/genshin-interface/src/models/InteractionKind.ts`), and an `Interactable` in the world is an `InteractionPrompt` with a place (`packages/genshin-world/src/models/interaction/Interactable.ts`).
- **In reach is a distance from the body.** `computeInteractionPrompts` keeps every thing within `INTERACTION_REACH` of the body's position, the same reach for every kind (`packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts`).
- **Nearest first, and still from frame to frame.** The rows run from the nearest thing to the farthest, two at one distance ordered by id, so the list never swaps two rows between frames (`packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts`).
- **The selection follows its thing.** The selection is the selected thing's id, never a row's index, so it stays on the same chest as rows come and go around it. When that thing leaves reach, the first row is selected (`packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts`).
- **The window scrolls only as far as it must.** The list shows `INTERACTION_WINDOW_SIZE` rows. Each frame the window keeps the last frame's first row unless the selection has moved out of it, and then scrolls just far enough to show it again, never past the last row (`packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts`).
- **The wheel steps the rows while more than one shows.** `stepInteractionSelection` moves the selection a row down the list for each notch of a positive step and up for a negative one, stopping at either end without wrapping (`packages/genshin-world/src/services/interaction/stepInteractionSelection.ts`). `useInteraction` takes the wheel's notches that way and spends them, so the camera does not zoom; with one row or none the wheel zooms the camera as before (`packages/genshin-world/src/composables/useInteraction.ts`). The window follows in the same frame.
- **A press acts on the selected row.** F acts once on the selected row: a drop is picked up, and a resident's row begins their talk, which the world opens as a screen over itself ([dialogue](../dialogue/design.md)) (`packages/genshin-world/src/components/World/Session/Index.vue`, `packages/genshin-world/src/services/interaction/pickUpDroppedItem.ts`).
- **A row presses itself.** Each row's pill is a button: a tap on a touch screen, or a click once Left Alt shows the cursor ([follow camera](../follow-camera/design.md)), selects its thing (`selectInteractable`) and taps Interact (`tapActionKey`), so it acts as F on that row would, in the same frame's read of the input (`packages/genshin-world/src/composables/useInteraction.ts`). A touch screen has no key, so its rows carry no cap and none is drawn selected: each pill stands in the cap's place, 52 high on a 74 pitch, as the English mobile client's pickup in `hud-world-pickup` measures (`packages/genshin-interface/src/components/InteractionPrompts/Index.vue`).
- **A held F repeats its pick up.** While Interact stays held after its press, `getHeldPickUp` is picked up once each `INTERACTION_HELD_REPEAT_SECONDS`: the selected row when it is an item, else the first item in the list (`packages/genshin-world/src/services/interaction/getHeldPickUp.ts`, `packages/genshin-world/src/services/interaction/constants.ts`). A repeat never opens, talks, reads or activates, since each of those leaves the world for a screen.
- **F is the input's.** Pick Up and Interact are `InputAction.Interact` in the engine's `InputActionBindingMap`, on F, X on an Xbox controller and Square on a PlayStation one, as the game's defaults have them (`packages/genshin-engine/src/input/InputActionBindingMap.ts`). Nothing listens for the key itself.
- **The list is drawn over the world.** `Interaction/PromptList` draws the window's slice through `genshin-interface`'s `InteractionPrompts`, in the HUD's `prompts` slot, so it hides wherever the HUD does (`packages/genshin-world/src/components/Hud/Screen/Index.vue`, `packages/genshin-world/src/components/Interaction/PromptList/Index.vue`). The composable hands its prompts on only when their rows, selection or window changed, so a still player re-renders nothing (`packages/genshin-world/src/composables/useInteraction.ts`).

## The drops and the residents

- **A defeated enemy's drops lie where it fell.** The enemy's defeat reaches the world screen through Windrise, and `getEnemyDroppedItems` gives what it leaves, its Mora as one pile under item id `MORA_ITEM_ID` and each material piece on its own (`packages/genshin-world/src/services/enemy/getEnemyDroppedItems.ts`, `packages/genshin-world/src/composables/useWorldCombat.ts`), which `placeWorldDrops` lays at its ground point. Every source drops through it, an enemy, a broken ore and an offering's rewards the bag has no room for, each item a drop at the source's point (`placeDroppedItems`, `packages/genshin-world/src/services/interaction/placeDroppedItems.ts`). A drop's id is its source's and the count of drops the page has placed, so no two share one (`packages/genshin-world/src/services/interaction/placeDroppedItems.ts`). Drops last the page's life (`packages/genshin-world/src/components/World/Session/Index.vue`, see Open).
- **A pick up takes it into the wallet or the bag.** `pickUpDroppedItem` puts a currency into the wallet, by the currency `getWalletCurrency` files its item under, and any other item into the bag through `addInventoryItem` by its definition, which `getItemDefinition` reads from the world's materials table ([inventory](../inventory/design.md)) (`packages/genshin-world/src/services/interaction/pickUpDroppedItem.ts`, `packages/genshin-world/src/services/inventory/getItemDefinition.ts`). What the bag has no room for stays where it lay as a smaller drop.
- **A resident is a talk in reach.** Every resident of the regions in reach whose talk the world holds is a `Talk` row, named from the world's names. A resident whose talk is not held is a row for the first quest talk open to them, and one with neither is neither drawn nor offered a prompt, since F on it would have no talk to open (`packages/genshin-world/src/composables/useWorldTalks.ts`).
- **A statue is an activation in reach.** Each Statue of The Seven whose landmark is unlocked is an `Activate` row named by the `StatueWorship` text (`packages/genshin-world/src/services/statue/computeStatueInteractables.ts`, 14-17; `packages/genshin-world/src/components/World/Session/Index.vue`, 1390), and F on a resonated one opens the Worship screen (`packages/genshin-world/src/components/World/Session/Index.vue`, 686-694 and 1843-1847), where an unresonated one is resonated on the key instead (`packages/genshin-world/src/components/World/Session/Index.vue`, 1886-1888). The game reaches that screen from a menu of Worship Statue, Statue's Blessing and Leave (`{data-root}/genshin-parity/captures/statue-blessing.mkv`, at 76 and 82 seconds), but the build has no menu screen between F and the Worship screen (`packages/genshin-world/src/models/screen/ScreenKind.ts`, 3-43). A locked one is an `Activate` row too, named by the `StatueOfTheSeven` text, from the jump landmarks the map has yet to unlock (`packages/genshin-world/src/composables/useWorldMap.ts`, 125-132; `packages/genshin-world/src/components/World/Session/Index.vue`, 1373-1379 and 1391-1393; `packages/genshin-world/src/services/map/computeJumpLandmarkTextKey.ts`, 10), and F on it unlocks and resonates it (`packages/genshin-world/src/components/World/Session/Index.vue`, 1886-1888; `packages/genshin-world/src/composables/useWorldMap.ts`, 227-229) ([map unlocking](../map-unlocking/design.md)). Once unlocked it has its row like any statue, Windrise's included, since `getStatueRegionId` maps it to Mondstadt (`packages/genshin-world/src/services/statue/getStatueRegionId.ts`, 4-5; `packages/genshin-world/src/services/statue/RegionIdStatueLandmarkIdMap.ts`, 7).
- **The stand-ins.** `World/Interactables` draws each drop as a small sphere and each resident as the locomotion capsule every body stands in as until its own is measured, one instanced mesh per kind rewritten only when the list changes (`packages/genshin-world/src/components/World/Interactables/Index.vue`). A witness render draws none (see Open).
- **The held F repeats every 0.45 seconds.** The interval is read off three pick-ups 27 frames apart in `{data-root}/genshin-parity/captures/world-pickup.mkv` from 38.5 to 39.6 seconds; a held F rather than a tap there would confirm it (`packages/genshin-world/src/services/interaction/constants.ts`, see Open).
- **The list's row count and reach are best estimates.** No published source shows either: a pile of more things than the list has rows shows that many rows, and a thing's prompt first shows at the reach from the body. Both values live in `packages/genshin-world/src/services/interaction/constants.ts`.

## Parity

The list is scored against the English PC client at 1080 high in its pickup: a public tutorial's recording at 9 seconds, drawn as its clean plate behind the list (`interaction-prompts-pickup`, `isBackdrop`), over the list's own box (`scripts/src/services/genshinParity/shared/ParityReferenceMap.ts`, `{data-root}/genshin-parity/references/interaction-prompts-pickup.png`). Measured off that frame (see Open):

- Three rows of 59 on a 72 pitch, the stack centred on the screen's middle, its cap's left edge 139 right of the centre.
- The cap 40 wide and 33 high, its pointer 8 by 15 at 45 from the cap's left, the pill 290 wide from 60 past the cap's left, its name's cap height 22 in a face of 31 with letter-spacing to the game's line width, the icon 34 across at 12 inside the pill.

Scored over the clean plate, with its name's place, its width and the icon's inset set, the list does not yet meet the two-percent bar on mean difference; the parity suite holds its scores. What is left:

- **The item icons.** Three icons of 34 across are the game's own item art, which nothing ships, so a disc stands in (`packages/genshin-interface/src/components/InteractionPrompts/Index.vue`). They are the largest term in the difference grid.
- **The pill's fill and rim.** The plate fills the game's pill from its surroundings, so the fill and the rim are scored against the scene where the game's pill was, and the rim sits a pixel off.

Provisional and unmeasured: the pill's right end (290 units, since the rock behind it is not separable on the frame), its fill, the kinds' icons (Talk, Open, Read, Activate and Use have no reference), and the selection's move, which the list does not animate: in the clip's stretch at 13 seconds the cap changes row within a frame or two. The clip is a captioned tutorial with a camera inset, so it gives the first row's state but no clean scroll; the clean clips are on the [roadmap](../../../changes/genshin-roadmap/tasks.md)'s References sought list. No visual-suite image is approved, since the compare is over its bar.

## Key files

| File                                                                           | Role                                                                                |
| :----------------------------------------------------------------------------- | :---------------------------------------------------------------------------------- |
| `packages/genshin-world/src/services/interaction/computeInteractionPrompts.ts` | The rows in reach, the selection kept by id, and the scrolled window                |
| `packages/genshin-world/src/services/interaction/stepInteractionSelection.ts`  | The mouse wheel's step through the rows                                             |
| `packages/genshin-world/src/services/interaction/getHeldPickUp.ts`             | What each repeat of a held F picks up                                               |
| `packages/genshin-world/src/services/interaction/placeDroppedItems.ts`         | The items a source drops, laid at its point                                         |
| `packages/genshin-world/src/services/enemy/getEnemyDroppedItems.ts`            | What a defeat leaves: its Mora as one pile and each material piece                  |
| `packages/genshin-world/src/services/interaction/pickUpDroppedItem.ts`         | A pick up into the wallet or the bag, and what the bag leaves behind                |
| `packages/genshin-world/src/services/interaction/constants.ts`                 | The reach, the window's rows, the held F's interval and the stand-ins               |
| `packages/genshin-world/src/composables/useInteraction.ts`                     | The prompts read each frame, a press and a held F's repeat                          |
| `packages/genshin-world/src/models/interaction/Interactable.ts`                | A thing the character can act on: its prompt and its place                          |
| `packages/genshin-world/src/models/world/WorldDrop.ts`                         | A drop lying on the ground: its item, count, id and point                           |
| `packages/genshin-world/src/components/World/Session/Index.vue`                | Holds the drops, the residents and the jump landmarks, and acts on the selected row |
| `packages/genshin-world/src/components/World/Interactables/Index.vue`          | The drops' and the residents' stand-ins                                             |
| `packages/genshin-world/src/components/Interaction/PromptList/Index.vue`       | The window's rows, drawn in the HUD 138 units right of the centre                   |
| `packages/genshin-world/src/components/Hud/Screen/Index.vue`                   | The `prompts` slot the list is drawn in                                             |
| `packages/genshin-interface/src/models/InteractionKind.ts`                     | The eight kinds of interaction                                                      |
| `packages/genshin-interface/src/components/InteractionPrompts/Index.vue`       | The rows as buttons, F's cap on the selected one, and none on touch                 |

## Notes

- **Three values wait on the roadmap.** All three are on the [roadmap](../../../changes/genshin-roadmap/tasks.md)'s Manual verification list, and the clips that would measure the last two stay on its References sought list.
- **The order, the held F and the drops' stand-ins are this page's reading of the game.** The wiki documents neither how the game orders several prompts nor whether a held F repeats. Nearest first, a held F that repeats its pick up and spheres for drops are the readings closest to play; the tips clip's evenly spaced pick ups bear out the repeat, and the Manual verification confirms or replaces the rest.

## Sources

- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: Pick Up and Interact on F, X on an Xbox controller and Square on a PlayStation one.
- [Faster item pick up](https://gamestegy.com/post/genshin-impact/322/faster-item-pick-up), GameStegy: a player's tip that the scroll wheel and F work together on the prompts.

## Reference

- `interaction-reach.mkv` — a slow walk of about ten metres onto one gathering point beside Windrise's statue, with the view held behind the character, under 15 seconds; the reach is the body's distance to the point when its prompt first shows, solved on Windrise's fitted layout ([interaction](design.md)). On the wiki and YouTube, none found (searched 2026-10-11).
- `prompt-kinds.mkv` — a chest, a notice to read, a waypoint and a resident with a talk, each in reach one at a time, their rows' icons in view at 1080 high, 30 seconds at most. On the wiki and YouTube, none found (searched 2026-10-11).
- `pickup-scroll.mkv` — a pile of at least eight dropped items, the list opened and F held until all are taken, the list in view throughout, under 15 seconds. Its stills give the window size (the most rows drawn while the pile holds more) and the held F's pick-up interval, read by `genshin:parity frames` at 60 a second. Partly found 2026-10-11: the held F's interval is read off `{data-root}/genshin-parity/captures/world-pickup.mkv`, a published PC tips clip, but its piles hold three things at most; still sought: a pile of more things than the list shows, for the window's rows.
- `prompt-select.mkv` — the selection moved one row by the wheel, the rows and the F cap in view at 1080 high and 60 frames a second, 2 seconds at most. On the wiki and YouTube, none found (searched 2026-10-11).

## Open

- [ ] **The wheel moves the selection through the rows** — no source yet: the still's caption says the mouse scroll speeds looting but shows no wheel step, the GameStegy tip is a player's note, and the pickup-scroll clip is still sought.
- [ ] **Pick Up and Interact are X on Xbox and Square on PlayStation, as the game's defaults** — no source yet: no cached Controls page is in `{data-root}/cache/genshin-wiki/`, and the binding in `packages/genshin-engine/src/input/InputActionBindingMap.ts` names `GamepadButton.FaceLeft`, not the buttons.
- [ ] **The held F's 27-frame spacing** — no source yet: the frames of `{data-root}/genshin-parity/captures/world-pickup.mkv` between 38.5 and 39.6 seconds were not extracted and counted here.
- [ ] **The list's and the touch pill's measured pixels** — no source yet: no saved measurement record exists; the still is cited for the frame, and the component's comment reads the pill 63 high on a 72 pitch with its left edge 59 past the cap, where this page reads rows of 59 on a 72 pitch.
- [ ] **A defeat's drops reach the world screen through Windrise** — no source yet: the drop path found is `packages/genshin-world/src/composables/useWorldCombat.ts`, and no Windrise step in it was found.
- [ ] **A witness render draws none of the stand-ins** — no source yet: `packages/genshin-world/src/components/World/Interactables/Index.vue` has no witness check.
- [ ] **Drops last the page's life** — no source yet: `packages/genshin-world/src/components/World/Session/Index.vue` holds the drops, but no check ties their lifetime to the page's state.
- [ ] **The item icons are drawn as discs, since the game's item art ships nowhere** — no source yet: whether the game's item art is in `{data-root}/genshin-parity/extracted/`, not yet checked.
- [ ] **F unlocks a locked statue, and Windrise's then has its Worship row** — no source yet: a recording of F at Windrise's own statue while it is locked; `{data-root}/genshin-parity/captures/statue-resonance.mkv` is White Birch Snowgrave's, not Windrise's, per `openspec/changes/genshin-roadmap/tasks.md`.
