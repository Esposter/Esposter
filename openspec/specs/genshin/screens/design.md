# Screens

In the game, a key or the Paimon menu opens a screen over the world: the map, the character screen, the inventory, the wish and the rest. The world screen does the same. What is open is a `ScreenKind`, either `World`, the world in play with nothing over it, or one of the screens the game opens from it. The world screen keeps it, reads the frame's pressed actions into it once a frame, and draws the open screen over the canvas (`packages/genshin-world/src/components/World/Session/Index.vue`, `packages/genshin-world/src/models/screen/ScreenKind.ts`).

## Moving between screens

```mermaid
stateDiagram-v2
  World --> PaimonMenu: Escape, a pad's Start, or the pointer's lock lost
  World --> Screen: its shortcut
  PaimonMenu --> Screen: an enabled entry
  PaimonMenu --> World: Back, Escape or Start
  Screen --> World: its own shortcut, Escape, Start, a pad's cancel, or its way back
  World --> Talk: F on a resident
  Talk --> World: its end, the only key that closes it
  PaimonMenu --> QuitPrompt: Quit Game
  QuitPrompt --> PaimonMenu: Cancel
  QuitPrompt --> [*]: Confirm, to the app's home
```

`getNextScreenKind` is the rule, a pure function of what is open and the frame's pressed actions:

- **From the world, a shortcut opens its screen.** `InputActionScreenKindMap` names the screen each opening action opens (`packages/genshin-world/src/services/screen/InputActionScreenKindMap.ts`); `Escape` and a pad's `Start` open the Paimon menu, as the game's controls bind them ([controls](../controls/design.md)). Each key is the one `packages/genshin-engine/src/input/InputActionBindingMap.ts` binds in its `InputAction.OpenAdventurerHandbook` through `InputAction.OpenWish` entries, and the Menus rows of "Page_Controls.json" give every screen the same key (B, C, Escape, M, F1 to F5, J, L, O and Enter).
- **Over a screen, the way back is to the world.** `Escape`, `Start` and a pad's cancel close any screen, and a screen's own shortcut closes it again, as `M` closes the map it opened (`packages/genshin-world/src/services/screen/getNextScreenKind.ts`).
- **One screen at a time.** Over a screen, every other screen's shortcut waits; the Paimon menu's entries are the one way from a screen to another, and they replace the menu with the screen chosen (`packages/genshin-world/src/services/screen/getNextScreenKind.ts`).
- **A talk stays open.** Over a talk, every key waits, Escape and a pad's Start among them; only the talk's own end sets the world back (`packages/genshin-world/src/services/screen/getNextScreenKind.ts`). A talk is begun from the world by F on a resident, as the [dialogue](../dialogue/design.md) page describes.

The rule is read only while the world is shown (`packages/genshin-world/src/composables/useWorldFrame.ts`, which calls it only while the world is not paused), so nothing opens under the opening that covers it.

## One way in for each screen kind

`ScreenKindOpenerMap` gives every screen kind the one way the player opens it (`packages/genshin-world/src/services/screen/ScreenKindOpenerMap.ts`). The way is one of the `ScreenKindOpener` values (`packages/genshin-world/src/models/screen/ScreenKindOpener.ts`): the Paimon menu, when its contents or its side bar list the kind; a shortcut, when an input action or a wheel entry opens it and the menu does not; an interaction, when the world opens it from an NPC, a world object, a statue, a domain's entrance or the party falling outside a domain; or the world itself. A kind that both a menu entry and a shortcut open is the menu's. The map is typed over every kind, so a kind added to `ScreenKind` cannot go without its way in.

`findUnreachableScreenKinds` (`packages/genshin-world/src/services/screen/findUnreachableScreenKinds.ts`) is the check that each claimed way holds. It reads the menu's contents and side bar, the input actions' map and the wheel's entries, and names each kind whose Paimon menu or shortcut claim none of them supports. An interaction or the world claims nothing to read, so it always holds. The test runs the check over the real tables, and the one kind it names today is recorded below.

## What a screen does to the world

`ScreenBehaviourMap` answers for each kind (`packages/genshin-world/src/services/screen/ScreenBehaviourMap.ts`):

| Field               | When true                                                                             |
| :------------------ | :------------------------------------------------------------------------------------ |
| `isHeld`            | the world's fixed-step loops and its clock stand still, while the world keeps drawing |
| `isHudHidden`       | the heads-up display is hidden                                                        |
| `isPointerReleased` | the pointer's lock is let go, for the screen's own cursor                             |

Every menu answers true to all three (`packages/genshin-world/src/services/screen/constants.ts`, `MENU_SCREEN_BEHAVIOUR`), as the game's single-player menus pause its simulation and its time while its music and particles carry on. The fishing point holds the world alone, keeping its HUD and its pointer (`packages/genshin-world/src/services/screen/ScreenBehaviourMap.ts`). Photo mode and a talk do not stand the world still: their clock runs with the HUD hidden, photo mode's camera orbits the character and its pointer still turns it, while a talk lets the pointer go for its replies. The world in play answers false to all three.

- **Held.** Under a menu and the fishing point, the character on the field and its body neither step, and the world's fixed-step loops and its clock stand still; under a menu, Windrise's clock and its clouds stand still too. Photo mode and a talk hold the character: it neither steps nor takes input, while the follow camera still looks, orbiting it in photo mode. Drawing goes on, so the world stays behind the screen (`packages/genshin-world/src/services/screen/ScreenBehaviourMap.ts`). This is a different thing from the world screen's `isPaused`, which stops drawing altogether while the opening covers the world.
- **Pointer.** A screen that lets the pointer go releases the lock when it opens. Closing it does not take the lock back, since the browser grants one only to a click; a click on the world takes it, as it did the first time (`packages/genshin-world/src/components/World/Session/Index.vue`, the pointer release a screen asks for).
- **A press that closes a screen is spent.** When the screen returns to the world, the world reads the input once more, so the key or click that closed it never reaches the world in play as an interact, a jump or an attack (`packages/genshin-world/src/components/World/Session/Index.vue`).
- **A lock lost in play opens the menu.** The browser keeps `Escape` for itself while the pointer is locked, so a lock lost with the world in play opens the Paimon menu as the key would have (`packages/genshin-world/src/components/World/Session/Index.vue`, the `pointerlockchange` listener).

## Drawing the open screen

`MenuScreen` draws what is open over the canvas:

- the [Paimon menu](../paimon-menu/design.md);
- a built screen, which is a slot of `MenuScreen` named by its kind, filled by the world screen with what that screen needs and closed by setting the world back;
- or, for a screen nobody has built yet, a placeholder: its title in the game's words (`ScreenKindGameTextKeyMap`) over a veil, and a way back (`packages/genshin-world/src/components/Menu/Placeholder/Index.vue`). Every shortcut therefore opens something, and closes it again, before its screen exists.

The Paimon menu and a placeholder are dialogs that take focus as they open, so the keyboard reaches them without a pointer (`packages/genshin-world/src/components/Menu/Paimon/Index.vue`, which focuses the Back button in `packages/genshin-world/src/components/Menu/Paimon/Back/Index.vue`, and `packages/genshin-world/src/components/Menu/Placeholder/Index.vue`).

A talk is none of these: `MenuScreen` draws nothing for it, and the world screen mounts the talk's host over the world while the talk is open ([dialogue](../dialogue/design.md)).

- **The world runs on behind a talk, as a best estimate.** The clock, the sky and the residents go on behind the speaker until a recording shows the game holding them still.

## Key files

| File                                                                       | Its role                                                                                                                                                      |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `packages/genshin-world/src/models/screen/ScreenKind.ts`                   | the world and every screen opened over it                                                                                                                     |
| `packages/genshin-world/src/services/screen/ScreenBehaviourMap.ts`         | what each screen does to the world under it                                                                                                                   |
| `packages/genshin-world/src/services/screen/InputActionScreenKindMap.ts`   | the screen each shortcut opens                                                                                                                                |
| `packages/genshin-world/src/models/screen/ScreenKindOpener.ts`             | the ways a screen kind is opened                                                                                                                              |
| `packages/genshin-world/src/services/screen/ScreenKindOpenerMap.ts`        | the one way in for each screen kind                                                                                                                           |
| `packages/genshin-world/src/services/screen/findUnreachableScreenKinds.ts` | the check that each claimed way in holds against the menus, the input actions and the wheel                                                                   |
| `packages/genshin-world/src/services/screen/getNextScreenKind.ts`          | the rule moving between screens on a frame's pressed actions                                                                                                  |
| `packages/genshin-world/src/services/screen/ScreenKindGameTextKeyMap.ts`   | each screen's title in the game's words                                                                                                                       |
| `packages/genshin-world/src/components/World/Session/Index.vue`            | keeps what is open, holds the world, lets the pointer go, and draws the overlays itself, the HUD, menu, game-over, shop, statue and domain screens among them |
| `packages/genshin-world/src/composables/useWorldFrame.ts`                  | reads the input once a frame and picks the screen it moves to                                                                                                 |
| `packages/genshin-world/src/components/Menu/Screen/Index.vue`              | draws the open screen: the Paimon menu, a built screen's slot or a placeholder                                                                                |
| `packages/genshin-world/src/components/Menu/Settings/Index.vue`            | the settings: their tabs and the Graphics and Audio tabs' rows, held until the world opens them                                                               |
| `packages/genshin-world/src/components/Menu/Settings/Tabs/Index.vue`       | the settings' tabs, each named in the game's words                                                                                                            |
| `packages/genshin-world/src/components/Menu/Settings/Row/Index.vue`        | one settings row: its label, the slider or choice it draws, and its options list when open                                                                    |
| `packages/genshin-world/src/components/Menu/Placeholder/Index.vue`         | an unbuilt screen's title and way back                                                                                                                        |

## Sources

- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: the shortcut of each screen.
- [Time](https://genshin-impact.fandom.com/wiki/Time), Genshin Impact Wiki: the clock paused in the menu and running in photo mode.

## Open

- [ ] **The menus pause the world's simulation while their music and particles run on** — no source yet: the "Time" wiki page (cached as "Page_Time.json", section "Pausing Time") pauses the in-game clock under the Paimon Menu and its screens in single player, except Photo Mode, while gadget cooldowns and bounty clocks keep ticking; it names no music or particle, so a recording of a menu with its music and particles would settle it.
- [ ] **Windrise's clock and clouds stand still under a menu and run on under a talk and in photo mode** — no source yet: a recording of Windrise's clock under each screen; `{data-root}/genshin-parity/captures/` lists no Windrise recording.
- [ ] **The Training Guide has no opener in the code** — no code opens its screen, and its claimed opener is the Paimon menu, from the wiki's list of the menu's contents (`{data-root}/cache/genshin-wiki/Page_Paimon_Menu.json`, line 47), which the menu leaves out as the [Paimon menu](../paimon-menu/design.md) page's open item records; the reachability test names it until the menu or the screen is settled.
