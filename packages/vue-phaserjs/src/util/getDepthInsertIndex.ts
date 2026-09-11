// The position in a container's child list that keeps it ordered by depth: the first child rendered above `depth`,
// Or -1 when nothing is, i.e. the game object belongs at the end. A non-numeric depth sorts to the end as well.
// A child is any object: `depth` is a Phaser component rather than a member of `GameObject`, so nothing narrower
// Than `object` would let the `in` check below say anything
export const getDepthInsertIndex = (list: readonly object[], depth: unknown): number =>
  typeof depth === "number"
    ? list.findIndex(
        (gameObject) => "depth" in gameObject && typeof gameObject.depth === "number" && gameObject.depth > depth,
      )
    : -1;
