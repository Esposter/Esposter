# Controls

The world reads its controls the way the game binds them. Every action a player's buttons ask for, from jumping to opening the map, is an `InputAction` in `genshin-engine`'s `input` module (`packages/genshin-engine/src/models/input/InputAction.ts`), and `InputActionBindingMap` holds the game's default binding for each (`packages/genshin-engine/src/input/InputActionBindingMap.ts`), as the game's own controls list sets them out for a PC and an Xbox pad. The map is the one statement of what a key does: a screen, the camera and the HUD read actions, never a key of their own.

## A binding is chords

Each action's binding is a list of chords, and a chord is the codes held together, its last code the one whose press triggers it. Most chords are one code: `M` opens the map (`packages/genshin-engine/src/input/InputActionBindingMap.ts`), `Q` is the elemental burst (`{data-root}/genshin-parity/references/hud-world-keys.png`, the Q under the burst's icon), a pad's top face button is the burst too (`packages/genshin-engine/src/input/InputActionBindingMap.ts`; the wiki's Xbox Y and PlayStation Triangle, `{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext lines 66 and 67). A few are two: on a pad, the left bumper held with the right face button is the quick-use gadget, and with the directional pad's right the co-op screen (`{data-root}/cache/genshin-wiki/Page_Controls.json` wikitext lines 98 and 175); on a keyboard, Left Alt held with a number switches to that party member and uses its burst (`packages/genshin-engine/src/input/InputActionBindingMap.ts`, and the wiki's Left Alt row at `{data-root}/cache/genshin-wiki/Page_Controls.json` wikitext line 144 beside the party member keys at lines 123 to 139).

Keys, mouse buttons and gamepad buttons share one namespace of codes. A key is its physical code (`KeyM`), so a layout does not move it; a mouse button and a gamepad button are each an enum value spelt apart from every key code (`MouseButton`, `GamepadButton`), so one chord can name any of them (`packages/genshin-engine/src/models/input/MouseButton.ts`, `packages/genshin-engine/src/models/input/GamepadButton.ts`). A gamepad's buttons are read in the browser's standard layout and named by where they sit, so a PlayStation pad's cross and an Xbox pad's A are both `FaceBottom` (`packages/genshin-engine/src/models/input/GamepadButton.ts`, which names each button by where it sits).

## How a frame reads them

```mermaid
flowchart TD
  K["keydown, keyup"] --> FIELD{"Typed into a field?"}
  FIELD -->|"yes"| SKIP["The field's alone"]
  FIELD -->|"no"| HELD[Held and pressed codes]
  MB["mousedown, mouseup"] --> HELD
  PAD["The first gamepad's buttons, polled at the read"] --> HELD
  HELD --> READ["readInput, once a frame"]
  READ --> CHORD{"For each chord: last code pressed, the rest held?"}
  CHORD -->|"the longest chord of that code"| PRESSED["pressedActions"]
  HELD --> HELDA["heldActions: every code of a chord held"]
  PRESSED --> WS["The world screen: which screen is open"]
  HELDA --> WS
  READ --> MOVE["The move and the look, read off the keys and sticks apart"]
```

- **Held and pressed.** An action is held while every code of one of its chords is held, and pressed on the read after its chord's last code went down with the rest held. A key pressed and let go between two reads still presses its action once; a key held down presses it once, however long the browser repeats it (`packages/genshin-engine/src/input/createInput.ts`).
- **The longest chord wins.** When one press completes several chords, only the longest of them presses its action (`packages/genshin-engine/src/input/createInput.ts`). Holding the left bumper and pressing the right face button is the gadget alone, never the normal attack the face button is by itself, as the game's pad turns its face buttons into the shortcut wheel's while the bumper is held.
- **A move and a look are axes, not actions.** `W`, `A`, `S` and `D`, the sticks and the locked pointer are read into the same state as numbers, as the [free camera](../free-camera/design.md) describes (`packages/genshin-engine/src/input/createInput.ts`, `packages/genshin-engine/src/input/constants.ts`).
- **A blur lets every key go**, since the keys released while the page is away never reach it (`packages/genshin-engine/src/input/createInput.ts`, the `blur` listener).

## The browser's own keys

A bound key's default is prevented (`packages/genshin-engine/src/input/createInput.ts`), so `F5` opens the events screen rather than reloading the page, `F1` the handbook rather than the browser's help and `F3` the wish rather than its find bar (`packages/genshin-engine/src/input/InputActionBindingMap.ts`). `Enter`, `Space` and `Tab` keep their defaults (`packages/genshin-engine/src/input/constants.ts`): they are how a screen's buttons are pressed and walked through from the keyboard, so preventing them would leave a menu unreachable without a pointer.

A key typed into a field (an input, a text area, a select or anything editable) reaches no binding at all and keeps its default, so a letter typed into a chat or a console never opens a screen (`packages/genshin-engine/src/input/createInput.ts`, `FIELD_SELECTOR` in `packages/genshin-engine/src/input/constants.ts`).

## A pad walks a menu

A menu over the world is one of its held screens (`packages/genshin-world/src/services/screen/ScreenBehaviourMap.ts`, `isHeld`), and while one is open the pad moves through its controls as Tab moves them from the keyboard. Its directional pad, and the left stick past its dead zone, are read as a menu's direction (`menuDown` and `menuRight` in `packages/genshin-engine/src/models/input/InputState.ts`), and `packages/genshin-world/src/composables/useMenuNavigation.ts` moves the focus to the nearest control lying that way (`packages/genshin-world/src/services/menu/findMenuFocusTarget.ts`), where a control in line counts as nearer than one off it. A held direction repeats at a steady pace after a delay (`packages/genshin-world/src/services/menu/constants.ts`).

- **The east face button presses the focused control, and the south face button closes the menu.** The game binds Confirm to the Xbox B and the PlayStation circle, which is the east face, and Cancel to the Xbox A and the cross, the south face (`{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext lines 250 to 260). The map keeps those bindings (`packages/genshin-engine/src/input/InputActionBindingMap.ts`), so the press is Confirm's click and the close is Cancel's, and `CLOSING_INPUT_ACTIONS` already closes a screen on Cancel as it does on Escape (`packages/genshin-world/src/services/screen/constants.ts`). The press first sets `data-pressed` on the focused control for `INTERACTION_PRESS_MS` (`packages/genshin-interface/src/services/constants.ts`), so the control draws its pressed look before its click runs; a press is dropped if its menu closes in that time or its control is pressed already (`packages/genshin-world/src/composables/useMenuNavigation.ts`).
- **The bumpers step a list screen's tab.** They are read as tab steps (`menuTabSteps`) and dispatched as the step event the Q and E keys' handler also listens to (`packages/genshin-world/src/composables/useListScreenTabStep.ts`), so both steps land on the same tab and hold at the first and the last.
- **A menu takes the focus on its first control as it opens**, unless one of its controls has it already, and draws the focus ring only when the last input was a key or the pad, so a pointer user sees no ring (`packages/genshin-world/src/composables/useMenuNavigation.ts`). A frame that reads the pad's directions, a bumper, its Confirm or its Start makes the last input the pad's, as a key's keydown makes it a key's, so a menu the pad opens after a pointer's use still draws its ring.
- **The world takes no press while a menu holds.** The character reads its presses only while the screen is not held (`packages/genshin-world/src/components/World/Character/Index.vue`, the `isHeld` check beside `holdPresses`), so a pad's world button does nothing under a menu, as a key does not. The press that closes a menu gives no jump either: the frame reads it before the character's render, and the character still takes the menu's hold from its `isHeld` prop, which the close updates only after that render, so the closing frame skips `holdPresses` (`packages/genshin-world/src/components/World/Session/Index.vue`, the `before-loop` frame, and `packages/genshin-world/src/composables/useWorldFrame.ts`).

## Escape and the locked pointer

While the pointer is locked to turn the camera, the browser keeps `Escape` for itself: it lets the lock go and never passes the key on. So a lock lost while the world is in play, and not let go to show the cursor, opens the Paimon menu (`packages/genshin-world/src/composables/useWorldScreenBehaviour.ts`, the `pointerlockchange` listener), as `Escape` does with the pointer free (`packages/genshin-engine/src/input/InputActionBindingMap.ts`, [screens](../screens/design.md)); the wiki binds the PC's Paimon Menu to Esc (`{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext line 162). The lock is taken again by a click on the world (`packages/genshin-world/src/components/World/Character/Index.vue`), since the browser takes no lock from `Escape` itself.

The first pointer move after a lock is taken is dropped (`packages/genshin-engine/src/input/createInput.ts`), since Chromium reports one spurious, very large movement on it, and so is any single move larger than half a turn at the look's sensitivity (`MOUSE_LOOK_MAX_PIXELS_PER_EVENT`, `packages/genshin-engine/src/input/constants.ts`), which no hand makes between two reports.

## Decisions

- **The game's defaults, and only them.** No binding is remapped (`packages/genshin-engine/src/input/InputActionBindingMap.ts`): the game's controls fix most of its defaults, and the ones a player can change are left at the game's own until a Settings row backs a change.
- **Left Control is the walk switch.** The game's own Left Ctrl row is its walk and run switch, which crouches only in some modes (`{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext lines 50 and 51). The free camera falls on left Shift (`packages/genshin-engine/src/input/constants.ts`, `KEY_CODE_DOWN`), which is the game's sprint key (`{data-root}/cache/genshin-wiki/Page_Controls.json` wikitext line 70), not on Control (`packages/genshin-engine/src/input/InputActionBindingMap.ts`, `SwitchWalkRun` on `ControlLeft`), since a held Control with `W` is the browser's close-tab shortcut.
- **The pad's Back opens the chat.** A PlayStation pad's touchpad, the game's chat button there, is no button in the browser's standard layout, so the button left of centre (an Xbox pad's View, a PlayStation pad's Share) carries it on every pad (`packages/genshin-engine/src/input/InputActionBindingMap.ts`, `OpenChat` on `GamepadButton.Back`).
- **Bindings with nothing behind them are kept.** Every action the game binds stays in the map even where no screen acts on it yet, so each feature that lands finds its action already bound as the game binds it. The elemental skill is already read, by `packages/genshin-world/src/components/World/Character/Index.vue` (`isSkillPressed`).

## Not bound

The bindings of places and modes the world does not have are left out (`packages/genshin-engine/src/input/InputActionBindingMap.ts` binds no `F6`, `F7` or `F8`, and no fifth party member): the Serenitea Pot's and the Cat's Tail's screens (`F6`, `F7`), Stellar Reunion (`F8`), a fifth party member, a challenge's abandon, the tutorial, notification and special environment pop-ups, and every Miliastra Wonderland control.

## Key files

| File                                                              | Its role                                                                                                           |
| :---------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `packages/genshin-engine/src/models/input/InputAction.ts`         | every action a player's buttons ask for                                                                            |
| `packages/genshin-engine/src/input/InputActionBindingMap.ts`      | the game's default chords for each action, on a PC and a pad                                                       |
| `packages/genshin-engine/src/models/input/GamepadButton.ts`       | a pad's buttons in the standard layout, named by where they sit                                                    |
| `packages/genshin-engine/src/models/input/MouseButton.ts`         | a mouse's buttons, spelt apart from every key                                                                      |
| `packages/genshin-engine/src/input/createInput.ts`                | the listeners, the gamepad's poll and the once-a-frame read into held and pressed actions, and a menu's directions |
| `packages/genshin-engine/src/input/constants.ts`                  | the focus keys, the field selector and the standard layout's button order                                          |
| `packages/genshin-world/src/composables/useMenuNavigation.ts`     | the pad's walk of a menu: its focus, its press, its tab steps and the focus a menu opens on                        |
| `packages/genshin-world/src/services/menu/findMenuFocusTarget.ts` | the nearest control lying in a direction from another                                                              |

## Sources

- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: the default PC, Xbox and PlayStation binding of every action and menu, the ones a player cannot change, and the bumper's combinations on a pad. Read from `{data-root}/cache/genshin-wiki/Page_Controls.json` for the bindings the bullets cite; its mobile and Wonderland tables are not used (see Open).
- `{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext lines 23 to 262, grounding "Every bound action keeps the game's default controls".
- `{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext lines 188, 193 and 197, grounding "Keys of places and modes the world does not have stay unbound".
- [Standard Gamepad](https://w3c.github.io/gamepad/#remapping), W3C Gamepad: the standard layout's button order, which `GAMEPAD_BUTTONS` follows.
- [Pointer Lock 2.0](https://w3c.github.io/pointerlock/), W3C: the user agent leaving the lock on `Escape`.
- [User activation](https://html.spec.whatwg.org/multipage/interaction.html#activation-triggering-input-event), WHATWG HTML: `Escape` gives no activation, so no lock can be requested from it.

## Open

The open items the spec's requirements carry (the default keys, the pad's bumper, Escape's lock, the spurious move and the F6 to F8 keys) are recorded once in [the spec](spec.md).

- [ ] **The browser's standard gamepad layout puts a PlayStation cross and an Xbox A at the same index** — no source yet: the W3C Gamepad spec, cited in Sources, is not on this PC, so its button order is unread here; the installed packages and the cache hold no button table, and that spec's table settles it.
- [ ] **Control is the game's crouch key, and a held Control with W is the browser's close-tab shortcut** — contradicted by `{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext line 50: Left Ctrl is "Switch to Walk/Run", crouching only in specific modes; the close-tab half is unread, as no browser shortcut list is on this PC.
- [ ] **The pad's touchpad is no button in the standard layout, and the View and Share buttons carry the chat on every pad** — no source yet for the standard layout: the W3C spec would settle the touchpad; the game's PlayStation chat is the touchpad (`{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext line 214).
- [ ] **The game's defaults are the only ones, and the player-changeable keys are left at the game's own** — no source yet: the game's list of changeable keys; the `settings-controls` frames are a browser walkthrough, not the controls screen, and the cached wiki's changeable table covers its mobile section only (`{data-root}/cache/genshin-wiki/Page_Controls.json`, wikitext lines 717 to 728).
