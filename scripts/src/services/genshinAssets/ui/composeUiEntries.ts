import type { DumpedGameObject } from "#src/models/genshinAssets/shared/DumpedGameObject";
import type { UiCanvasScaler } from "#src/models/genshinAssets/ui/UiCanvasScaler";
import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";
import type { UiRectTransformRead } from "#src/models/genshinAssets/ui/UiRectTransformRead";

import { toGameObjectComponentsMap } from "#src/services/genshinAssets/shared/toGameObjectComponentsMap";
import { toGameObjectTransformIdMap } from "#src/services/genshinAssets/shared/toGameObjectTransformIdMap";
import { getUiPath } from "#src/services/genshinAssets/ui/getUiPath";
import { toUiObjectKey } from "#src/services/genshinAssets/ui/toUiObjectKey";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A block's UI index entries: each RectTransform joined to its GameObject's dump and the canvas scaler its GameObject
// holds, keyed by block, container and GameObject path ID. A repeated key is refused rather than kept twice
export const composeUiEntries = (
  block: string,
  rectTransforms: readonly UiRectTransformRead[],
  gameObjects: readonly DumpedGameObject[],
  canvases: ReadonlyMap<string, UiCanvasScaler>,
): UiIndexEntry[] => {
  const transformIdMap = toGameObjectTransformIdMap(gameObjects);
  const componentsMap = toGameObjectComponentsMap(gameObjects);
  const transformIdNameMap = new Map(
    rectTransforms.flatMap(({ fatherId, gameObjectId, name }) => {
      const transformId = transformIdMap.get(gameObjectId);
      return transformId ? [[transformId, { fatherId, name }] as const] : [];
    }),
  );
  const keys = new Set<string>();
  return rectTransforms.map((rectTransform) => {
    const { childIds, container, fatherId, gameObjectId, layout, name, scale } = rectTransform;
    const key = toUiObjectKey(block, container, gameObjectId);
    if (keys.has(key))
      throw new InvalidOperationError(Operation.Create, key, "two RectTransforms of one container name one GameObject");
    keys.add(key);
    const canvas = canvases.get(gameObjectId);
    return {
      block,
      ...(canvas ? { canvas } : {}),
      childIds,
      components: componentsMap.get(gameObjectId) ?? [],
      container,
      fatherId,
      name,
      path: getUiPath(fatherId, transformIdNameMap),
      pathId: gameObjectId,
      rect: layout,
      scale,
      transformId: transformIdMap.get(gameObjectId) ?? "",
    };
  });
};
