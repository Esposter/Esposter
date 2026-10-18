import type { Interactable } from "#src/models/interaction/Interactable";
import type { Landmark } from "#src/models/world/Landmark";

import { STATUE_BLESSING_SUFFIX, STATUE_WORSHIP_SUFFIX } from "#src/services/statue/constants";
import { getStatueRegionId } from "#src/services/statue/getStatueRegionId";
import { InteractionKind } from "genshin-interface";

// The resonated Statues of The Seven, each offering two F prompts named as the game names them: the Worship Statue and the
// Statue's Blessing. The two prompts share the statue's place, and each id is the statue's landmark id with its suffix
export const computeStatueInteractables = (
  unlockedLandmarks: Landmark[],
  names: { blessing: string; worship: string },
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  unlockedLandmarks.flatMap(({ id, position: { x, z } }) => {
    if (getStatueRegionId(id) === undefined) return [];
    const position = { x, y: getGroundHeight(x, z), z };
    return [
      { id: `${id}${STATUE_WORSHIP_SUFFIX}`, kind: InteractionKind.Activate, name: names.worship, position },
      { id: `${id}${STATUE_BLESSING_SUFFIX}`, kind: InteractionKind.Activate, name: names.blessing, position },
    ];
  });

// A statue's F prompt's landmark id, which the prompt's suffix follows
export const getStatuePromptLandmarkId = (promptId: string): string => promptId.slice(0, promptId.lastIndexOf("/"));
