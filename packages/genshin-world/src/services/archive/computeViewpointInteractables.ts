import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";
import type { Interactable } from "#src/models/interaction/Interactable";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { getViewpointInteractableId } from "#src/services/archive/getViewpointInteractableId";
import { InteractionKind } from "genshin-interface";

// The offered viewpoints as activations on the ground beneath their places, each named by its own name in the reader's
// Language. A viewpoint with no place in the map has no prompt. Provisional: the prompt is named by the viewpoint itself,
// Until the game's own prompt text for a viewpoint is read
export const computeViewpointInteractables = (
  viewpoints: readonly ArchiveViewpoint[],
  placeMap: ReadonlyMap<number, SceneGroupPlace>,
  textMap: Readonly<Record<string, string>>,
  getGroundHeight: (x: number, z: number) => number,
): Interactable[] =>
  viewpoints.flatMap(({ id, nameTextId }) => {
    const place = placeMap.get(id);
    if (!place) return [];
    const { x, z } = place.position;
    return [
      {
        id: getViewpointInteractableId(id),
        kind: InteractionKind.Activate,
        name: textMap[nameTextId] || "",
        position: { x, y: getGroundHeight(x, z), z },
      },
    ];
  });
