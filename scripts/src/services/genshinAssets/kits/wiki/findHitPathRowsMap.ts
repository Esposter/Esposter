import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findSharedLabelRows } from "#src/services/genshinAssets/kits/wiki/findSharedLabelRows";

// The index of a list entry at the end of an action's path, the `0.` of `plungeVariants.0.`
const LIST_ENTRY_INDEX_REGEX = /\.\d+\.$/u;

// The rows each hit takes by its label, given as its path and label pairs. Hits sharing a label within one action take
// Their rows together, so `burst.hits.0` and `burst.hits.1` share theirs where both are labelled `Skill DMG`. A hit's
// Action is its path up to its last `hits.`, with a list entry's index dropped, so the plunge variants' leaps,
// `plungeVariants.0.hits.0` to `.2`, are one action. A path with no `hits.`, a hit field's, is an action of its own
export const findHitPathRowsMap = (
  hitLabels: readonly (readonly [hitPath: string, label: string])[],
  properties: readonly WikiAdvancedProperty[],
): Map<string, WikiAdvancedProperty[]> => {
  const actionLabelGroupMap = new Map<string, { hitPaths: string[]; label: string }>();
  for (const [hitPath, label] of hitLabels) {
    const hitsIndex = hitPath.lastIndexOf("hits.");
    const action = hitsIndex === -1 ? hitPath : hitPath.slice(0, hitsIndex).replace(LIST_ENTRY_INDEX_REGEX, ".");
    const key = JSON.stringify([action, label]);
    const group = actionLabelGroupMap.get(key) ?? { hitPaths: [], label };
    group.hitPaths.push(hitPath);
    actionLabelGroupMap.set(key, group);
  }
  const hitPathRowsMap = new Map<string, WikiAdvancedProperty[]>();
  for (const { hitPaths, label } of actionLabelGroupMap.values())
    for (const [hitPath, rows] of findSharedLabelRows(label, properties, hitPaths)) hitPathRowsMap.set(hitPath, rows);
  return hitPathRowsMap;
};
