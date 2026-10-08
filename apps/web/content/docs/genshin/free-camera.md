---
title: Free camera
description: The camera the world screen flies over the continent, with the keyboard, the mouse and a gamepad's sticks. Its input is read once a frame and its look turns once a frame, its motion runs in fixed steps registered ahead of the floating origin's shift, and it is held above the ground and the water's surface.
---

# Free camera

The world screen's camera is a free camera: the player flies it over Windrise and beyond. It replaces the orbit controls the screen first drew around the oak. The camera is built from three engine modules, `input`, `simulation` and `camera`, and reads the ground through `collision`, all in `genshin-engine` and knowing no place by name. The world screen wires them to its own origin and its own height function.

```mermaid
sequenceDiagram
  participant WS as World screen (TresJS beforeLoop)
  participant F as Frame (TresJS onBeforeRender)
  participant FC as World free camera
  participant IN as input
  participant SIM as simulation
  participant CAM as camera
  participant CL as collision
  participant FO as floating origin
  WS->>IN: readInput(delta), the frame's move, look and actions
  F->>FC: the frame begins, registered before the origin's shift
  FC->>CAM: look(input), once a frame, unless a screen holds the world
  FC->>SIM: advance(delta), in steps of a sixtieth of a second
  loop at most five steps a frame
    SIM->>CAM: step(input, step)
    CAM->>CL: the ground under the camera
    CL-->>CAM: height the camera is held above
  end
  F->>FO: the origin's shift reads where the camera now stands
```

The order is the reason for the registration. The floating origin reads the camera to decide whether to shift the world back under it, and the terrain and grass read the camera for their tiles, so both must see where it has been moved to. The free camera registers its frame callback in the world screen's child that comes before the scene, so it runs first.

## The controls

- **Keyboard**: `W` and `S` move forward and back over the ground, `A` and `D` move left and right, `Space` rises and `Shift` falls. A pair held against each other cancels.
- **Mouse**: a click on the canvas locks the pointer, and while it is locked the pointer turns the look.
- **Gamepad**: the first connected gamepad's left stick moves over the ground, and its right stick turns the look at a rate of 2.5 radians a second. Both have a deadzone at the stick's centre.

The camera's motion is per second, so a key held for the same time moves it the same distance at any frame rate. The look is not: the mouse turns it by a fixed angle for each pixel the pointer moves, and only the gamepad's right stick turns it per second. The world screen reads the input once a frame, ahead of every frame callback, and hands the camera the state it read: its look turns the camera once, before the frame's steps, and the steps of that frame all use its move, so no pointer movement is lost or repeated at any frame rate. While a screen holds the world ([screens](/docs/genshin/screens)), the camera neither looks nor steps. Losing focus clears the keys held, since their releases never reach the page. The input's listeners and the canvas's click are released when the component holding them unmounts, so a remount does not stack them.

## The motion

A move goes along the view on the ground, and straight up or down. Its speed grows with the camera's height above the ground, so a crossing takes seconds and a slow pass over grass stays slow; the speed's base and its growth live in `packages/genshin-engine/src/camera/constants.ts`. The look turns the yaw and tilts the pitch, which is clamped short of straight up or down so the view never flips.

The camera is never held under the ground or the water's surface: after each step its height is raised to the higher of the ground's height at its place and the water's level, plus a clearance, which the same constants file holds.

## The ground

`collision` answers the ground's height and normal at a point from the height function the terrain is built from. The world screen passes it `getWindriseHeight` read at the scene's origin plus the camera's own place, on the main thread, so the answer is the one the terrain draws, never a read back from a worker's tile. The normal is read from the same function's slopes across a tenth of a metre. The sample object is reused by every query, so a frame reads the ground allocating nothing.

## Key files

| File                                                               | Its role                                                                                    |
| :----------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| `packages/genshin-engine/src/input/createInput.ts`                 | keys, locked pointer and the gamepad's sticks, read once a frame; a blur releases every key |
| `packages/genshin-engine/src/simulation/createFixedStepLoop.ts`    | runs whole steps from an accumulator, at most five a frame                                  |
| `packages/genshin-engine/src/camera/createFreeCamera.ts`           | the flight: look, move by height, and the clamp above the ground                            |
| `packages/genshin-engine/src/collision/createGroundQuery.ts`       | the ground's height and normal at a point, and the water's level                            |
| `packages/genshin-world/src/components/World/FreeCamera/Index.vue` | the world's wiring: the loop run before the origin's shift, on the scene's ground           |
| `packages/genshin-world/src/components/World/Screen/Index.vue`     | reads the input once a frame, owns the origin and mounts the free camera                    |
| `packages/genshin-world/src/services/constants.ts`                 | the fixed step's length                                                                     |

## Notes

- **The free camera is replaced, not extended, once a character walks.** The [follow camera](/docs/proposals/genshin/follow-camera) then follows the [character controller](/docs/proposals/genshin/character-controller)'s body, and the free camera stays as the photo mode.

## Sources

- [Fix your timestep!](https://gafferongames.com/post/fix_your_timestep/), Glenn Fiedler: simulation in fixed steps from an accumulator, which the simulation module follows.
