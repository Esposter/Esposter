import type { DepthConfiguration } from "#src/models/configuration/components/DepthConfiguration";
import type { DepthEventEmitsOptions } from "#src/models/emit/components/DepthEventEmitsOptions";
import type { SetterMap } from "#src/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

import { getDepthInsertIndex } from "#src/util/getDepthInsertIndex";

export const DepthSetterMap = {
  depth: (gameObject) => (value) => {
    if (value === undefined) return;

    gameObject.setDepth(value);
    if (!(gameObject.parentContainer as GameObjects.Container | null)) return;
    const i = getDepthInsertIndex(gameObject.parentContainer.list, gameObject.depth);
    if (i === -1) gameObject.parentContainer.bringToTop(gameObject);
    else gameObject.parentContainer.moveTo(gameObject, Math.max(i - 1, 0));
  },
} as const satisfies SetterMap<
  DepthConfiguration,
  GameObjects.Components.Depth & GameObjects.GameObject,
  DepthEventEmitsOptions
>;
