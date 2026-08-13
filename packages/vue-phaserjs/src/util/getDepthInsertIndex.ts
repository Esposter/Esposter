import type { GameObjects } from "phaser";
// The position in a container's child list that keeps it ordered by depth: the first child rendered above `depth`,
// Or -1 when nothing is, i.e. the game object belongs at the end. A non-numeric depth sorts to the end as well.
export const getDepthInsertIndex = (list: GameObjects.GameObject[], depth: unknown): number =>
  typeof depth === "number"
    ? list.findIndex(
        (gameObject) => "depth" in gameObject && typeof gameObject.depth === "number" && gameObject.depth > depth,
      )
    : -1;
