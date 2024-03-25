import type { DepthConfiguration } from "@/lib/phaser/models/configuration/components/DepthConfiguration";
import type { DepthEventEmitsOptions } from "@/lib/phaser/models/emit/components/DepthEventEmitsOptions";
import type { SetterMap } from "@/lib/phaser/models/setterMap/SetterMap";
import type { GameObjects } from "phaser";

export const DepthSetterMap = {
  depth: (gameObject) => (value) => {
    if (value === undefined) return;

    gameObject.setDepth(value);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!gameObject.parentContainer) return;

    const i = gameObject.parentContainer.list.findIndex(
      (obj) => "depth" in obj && typeof obj.depth === "number" && obj.depth > gameObject.depth,
    );
    i === -1
      ? gameObject.parentContainer.bringToTop(gameObject)
      : gameObject.parentContainer.moveTo(gameObject, Math.max(i - 1, 0));
  },
} as const satisfies SetterMap<
  DepthConfiguration,
  GameObjects.Components.Depth & GameObjects.GameObject,
  DepthEventEmitsOptions
>;
