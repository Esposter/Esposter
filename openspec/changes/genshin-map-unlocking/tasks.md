## 1. The pointer to a near locked jump landmark

- [x] 1.1 Point the HUD to the nearest locked jump landmark within 30 metres, holding it until 40 metres or unlock. Verify: `findPointedLandmark.test.ts` asserting the scenarios "A locked waypoint 29 metres away is pointed to", "A locked waypoint 31 metres away is not pointed to", "The pointer holds until the player passes 40 metres" and "The pointer goes past 40 metres", and `useWorldMap.test.ts` asserting "An unlocked waypoint is never pointed to", written first and seen failing.
- [x] 1.2 Draw the pointed landmark's mark at its screen point, held at the screen's edge with its arrow turned toward it when out of view. Verify: a test named after the scenario "A pointed landmark out of view sits at the screen's edge", written first and seen failing.
- [x] 1.3 Take the pointer's look from the public clip `ay49p0gLFT8` into the waypoint-pointer references, and queue its comparison for the user's eyes. Verify: the reference frame is written under the waypoint-pointer references folder, and the comparison is listed for the user's eye check.

## 2. Teleport Waypoints and domains unlocked

- [ ] 2.1 Unlock Teleport Waypoints and domain entrances by interaction or by their quest step, once exploring places the waypoints in region data and the prompt list offers them. Verify: tests named after the scenarios "Interacting with a locked waypoint unlocks it" and "A waypoint unlocked by a quest step opens with that step", written first and seen failing.
  - Built: the interaction scenario, and "Interacting with a locked domain entrance unlocks it" for the domain entrances the region data places. Blocked: the quest-step scenario. Its step is an Interact objective on the waypoint's point id (`QUEST_CONTENT_UNLOCK_TRANS_POINT`), and an activation emits the landmark id, so the step never completes from the unlock; which steps unlock a waypoint outright is not in the data.
- [ ] 2.2 Keep a waypoint the game hides out of the map and prompt list until its step. Verify: a test named after the scenario "A hidden waypoint is not offered before its step", written first and seen failing.
  - Blocked: no record names the hidden waypoints or their step. The dump's `TransPointUnlockConfigData` lists twelve scene 3 points, one of them Mondstadt's point 1884, with no step or meaning in its fields.
- [x] 2.3 Offer each unlocked waypoint as a jump and as a place to revive. Verify: tests named after the scenarios "An unlocked waypoint is offered as a jump" and "A locked waypoint is not offered as a place to revive", written first and seen failing.

## 3. First-unlock rewards

- [x] 3.1 Match each waypoint to its reward row by its point id and pay its Adventure EXP and Primogems on the first unlock only. Verify: tests named after the scenarios "The first unlock pays the waypoint's reward" and "A later unlock pays nothing again", written first and seen failing.
