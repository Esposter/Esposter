import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findSharedLabelRows } from "#src/services/genshinAssets/kits/wiki/findSharedLabelRows";

// The rows each hit takes by its label, given as its path and label pairs. Hits sharing a label within one action take
// Their rows together, so `burst.hits.0` and `burst.hits.1` share theirs where both are labelled `Skill DMG`. A hit's
// Action is its path up to its last `hits.`
export const findHitPathRowsMap = (
  hitLabels: readonly (readonly [hitPath: string, label: string])[],
  properties: readonly WikiAdvancedProperty[],
): Map<string, WikiAdvancedProperty[]> => {
  const actionLabelGroupMap = new Map<string, { hitPaths: string[]; label: string }>();
  for (const [hitPath, label] of hitLabels) {
    const key = JSON.stringify([hitPath.slice(0, hitPath.lastIndexOf("hits.")), label]);
    const group = actionLabelGroupMap.get(key) ?? { hitPaths: [], label };
    group.hitPaths.push(hitPath);
    actionLabelGroupMap.set(key, group);
  }
  return new Map(
    [...actionLabelGroupMap.values()].flatMap(({ hitPaths, label }) => [
      ...findSharedLabelRows(label, properties, hitPaths),
    ]),
  );
};
