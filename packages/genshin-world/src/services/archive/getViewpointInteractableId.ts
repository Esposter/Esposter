import { VIEWPOINT_INTERACTABLE_ID_PREFIX } from "#src/services/archive/constants";

// The id of a viewpoint's prompt in the world, by the viewpoint's codex id
export const getViewpointInteractableId = (viewpointId: number): string =>
  `${VIEWPOINT_INTERACTABLE_ID_PREFIX}${viewpointId}`;
