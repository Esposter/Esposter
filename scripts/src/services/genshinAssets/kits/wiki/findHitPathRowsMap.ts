import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

import { findSharedLabelRows } from "#src/services/genshinAssets/kits/wiki/findSharedLabelRows";

// The index of a list entry at the end of an action's path, the `0.` of `plungeVariants.0.`
const LIST_ENTRY_INDEX_REGEX = /\.\d+\.$/u;
// A top-level list's hit, `hits.fieryRainArrows.0`, whose action is its list, as no path comes before its `hits.`
const TOP_LEVEL_LIST_HIT_REGEX = /^(?<list>hits\.[^.]+)\.\d+$/u;

// The rows each hit takes by its label, given as its path and label pairs. Hits sharing a label within one action take
// Their rows together, so `burst.hits.0` and `burst.hits.1` share theirs where both are labelled `Skill DMG`. A hit's
// Action is its path up to its last `hits.`, and a path with no `hits.`, a hit field's, is an action of its own. A
// Top-level list's hits are an action named by their list, `hits.fieryRainArrows`, and a list entry's index is dropped,
// So the plunge variants' leaps, `plungeVariants.0.hits.0` to `.2`, are one action
export const findHitPathRowsMap = (
  hitLabels: readonly (readonly [hitPath: string, label: string])[],
  properties: readonly WikiAdvancedProperty[],
): Map<string, WikiAdvancedProperty[]> => {
  const actionLabelGroupMap = new Map<string, { hitPaths: string[]; label: string }>();
  for (const [hitPath, label] of hitLabels) {
    const hitsIndex = hitPath.lastIndexOf("hits.");
    const action =
      TOP_LEVEL_LIST_HIT_REGEX.exec(hitPath)?.groups?.list ??
      (hitsIndex === -1 ? hitPath : hitPath.slice(0, hitsIndex).replace(LIST_ENTRY_INDEX_REGEX, "."));
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
