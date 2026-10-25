import type { FlatInteractiveMapLabel } from "#src/services/genshinAssets/points/flattenLabelTree";

import { CATEGORY_RESPAWN_MAP, LABEL_RESPAWN_MAP } from "#src/services/genshinAssets/gathering/constants";

// How a label's points come back once picked or broken: by its own rule where it has one, else by its category
export const getLabelRespawn = ({ categoryId, id }: FlatInteractiveMapLabel) =>
  LABEL_RESPAWN_MAP[id] ?? CATEGORY_RESPAWN_MAP[categoryId];
