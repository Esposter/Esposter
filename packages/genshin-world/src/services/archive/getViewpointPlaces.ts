import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { SceneGroups } from "#src/models/sceneGroup/SceneGroups";

import { SceneGroupMemberKind } from "#src/models/sceneGroup/SceneGroupMemberKind";

// The place each viewpoint stands at, as the scene group record gives it: the gadget its group files under the
// Viewpoint's config id, where that gadget has a place. A viewpoint the record leaves without one has no entry
export const getViewpointPlaces = (
  { groups }: SceneGroups,
  viewpoints: readonly ArchiveViewpoint[],
): Map<number, SceneGroupPlace> =>
  new Map(
    viewpoints.flatMap(({ configId, groupId, id }) => {
      const place = groups[String(groupId)]?.find(
        (member) => member.kind === SceneGroupMemberKind.Gadget && member.configId === configId,
      )?.place;
      return place ? [[id, place]] : [];
    }),
  );
