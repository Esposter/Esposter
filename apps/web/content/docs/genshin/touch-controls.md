---
title: Touch controls
description: The world's controls on a touch screen, as the game's mobile client splits the screen. A thumb on the left half holds a stick round where it landed that moves, a drag on the right half turns the look, and the HUD's touch layout puts the attack, jump and sprint buttons at the bottom right. They feed the same input the keys, mouse and gamepad do.
---

# Touch controls

A phone or a tablet has no keys or mouse to move and look with, so the game's mobile client draws its controls over the world. The world's touch controls are drawn the same way, as the bottom layer of the [HUD](/docs/genshin/hud), whenever the device's main pointer is a finger.

## How it works

```mermaid
flowchart LR
  DOWN["A finger lands"] --> HALF{"Which half?"}
  HALF -->|"left, no stick held"| STICK["A stick round where it landed"]
  HALF -->|"right, no drag held"| DRAG["A drag of the look"]
  STICK -->|"moves"| AXES["Its offset over its reach, at most a full push"]
  AXES --> SET["input.setTouchStick: read with the gamepad's left stick"]
  DRAG -->|"moves"| TURN["input.turn: added to the pointer's look"]
  JUMP["An action button of the HUD held: attack, aim, jump or sprint"] --> PRESS["input.press of its action's key, released on lifting"]
  SET --> READ["The frame's one read of the input"]
  TURN --> READ
  PRESS --> READ
```

- **One input for every device.** The touch controls write into the engine's `input` rather than moving the camera themselves: the stick's axes are added to the gamepad's left stick, a drag's turn to the pointer's look, and each of the HUD's action buttons holds its action's key code as a key would. So the character and its camera, and photo mode's camera, read one move and one look whatever drives them.
- **The left half is a stick, the right half a look.** A finger landing on the left half holds a stick round the point it landed on, drawn there while it is held; its offset over the stick's reach is the move, and a finger pushed past the reach holds the stick at its rim in its direction. A finger landing on the right half drags the look by how far it moves. One finger holds each, and lifting it lets go, the stick back at rest.
- **The action buttons are the HUD's.** The attack, the jump, the sprint and, for a bow's wielder, the aim stand in the HUD's own rect for its action buttons beside the skill and burst, measured off the mobile client's recording ([HUD](/docs/genshin/hud)). The jump is the character's jump, as Space is, and the tuning panel's free camera's rise.
- **Only on a touch screen.** The controls are drawn when the device's main pointer is coarse (`(pointer: coarse)`), which the world's session reads and hands to the HUD, so a computer's clicks still reach the world to lock the pointer. Hiding the HUD hides them, and they let go of whatever they held.

## Key files

| File                                                          | Role                                                               |
| :------------------------------------------------------------ | :----------------------------------------------------------------- |
| `packages/genshin-world/src/components/Hud/Touch/Index.vue`   | The stick and the look's drag                                      |
| `packages/genshin-world/src/components/Hud/Actions/Index.vue` | The attack, aim, jump and sprint buttons                           |
| `packages/genshin-world/src/services/hud/constants.ts`        | The stick's reach and the look's turn for a pixel of a drag        |
| `packages/genshin-engine/src/input/createInput.ts`            | `press`, `release`, `setTouchStick` and `turn`, read with the rest |

## Notes

- **The stick's reach is in CSS pixels.** A thumb's travel is a distance on the glass, which CSS pixels follow on a phone where the game's screen units would shrink it with the window. The reach, the look's turn and the stick's size are provisional until a recording of the mobile client's stick is measured ([roadmap](/docs/genshin/roadmap)).
- **The tuning panel's free camera rises by touch but does not fall.** The game's touch layout has no button to descend, so the free camera flown by touch climbs on the jump button and has no way back down.

## Sources

- [Controls](https://genshin-impact.fandom.com/wiki/Controls), Genshin Impact Wiki: the mobile client's every action done by touching the screen, the camera turned by touching and dragging it, and the jump that moves upward where the free camera flies.
- [Game accessibility guidelines](https://gameaccessibilityguidelines.com/full-list/): support for several input devices.
