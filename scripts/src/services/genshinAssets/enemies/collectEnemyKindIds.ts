interface RegionCampsData {
  enemyCamps: { members: { enemyKindId: number }[] }[];
}

// The kinds the regions' camps place, each once, in ascending order of its id. The enemies dataset publishes them
export const collectEnemyKindIds = (regionDatas: readonly RegionCampsData[]): number[] =>
  [
    ...new Set(
      regionDatas.flatMap(({ enemyCamps }) =>
        enemyCamps.flatMap(({ members }) => members.map(({ enemyKindId }) => enemyKindId)),
      ),
    ),
  ].toSorted((firstId, secondId) => firstId - secondId);
