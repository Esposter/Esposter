interface RegionCampsData {
  enemyCamps: { members: { enemyKindId: number }[] }[];
}

// The kinds the regions' camps place and the kinds the Spiral Abyss fights, each once, in ascending order of its id. The
// Enemies dataset publishes them
export const collectEnemyKindIds = (
  regionDatas: readonly RegionCampsData[],
  abyssEnemyKindIds: readonly number[] = [],
): number[] =>
  [
    ...new Set([
      ...regionDatas.flatMap(({ enemyCamps }) =>
        enemyCamps.flatMap(({ members }) => members.map(({ enemyKindId }) => enemyKindId)),
      ),
      ...abyssEnemyKindIds,
    ]),
  ].toSorted((firstId, secondId) => firstId - secondId);
