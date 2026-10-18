// The listed transport points the game hides from the map and the prompt list: a point a quest step names is hidden until
// That step is reached, and a point no step names is shown, since nothing could reveal it. A step names its point as the
// Target of its Interact objective, the way the quest data names a waypoint by its scene point
export const computeHiddenTransPointIds = (
  listedPointIds: readonly number[],
  namedTargetIds: ReadonlySet<string>,
  reachedTargetIds: ReadonlySet<string>,
): ReadonlySet<number> =>
  new Set(
    listedPointIds.filter((pointId) => {
      const targetId = String(pointId);
      return namedTargetIds.has(targetId) && !reachedTargetIds.has(targetId);
    }),
  );
