import { type SetterMap } from "@/lib/phaser/models/SetterMap";
import { type GameObjects } from "phaser";

export const DepthSetterMap = {
  depth: (gameObject) => (value) => {
    gameObject.setDepth(value);
    if (!gameObject.parentContainer) return;

    const i = gameObject.parentContainer.list.findIndex(
      (obj) => "depth" in obj && typeof obj.depth === "number" && obj.depth > gameObject.depth,
    );
    i === -1
      ? gameObject.parentContainer.bringToTop(gameObject)
      : gameObject.parentContainer.moveTo(gameObject, Math.max(i - 1, 0));
  },
} satisfies SetterMap<GameObjects.Components.Depth, GameObjects.Components.Depth & GameObjects.GameObject>;
