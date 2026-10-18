interface RegionCampsData {
  enemyCamps: { members: { enemyKindId: number }[] }[];
}

// The kinds the regions' camps place and the bounties hunt, each once, in ascending order of its id. The enemies dataset
// Publishes them
export const collectEnemyKindIds = (
  regionDatas: readonly RegionCampsData[],
  bountyKindIds: readonly number[],
): number[] =>
  [
    ...new Set([
      ...regionDatas.flatMap(({ enemyCamps }) =>
        enemyCamps.flatMap(({ members }) => members.map(({ enemyKindId }) => enemyKindId)),
      ),
      ...bountyKindIds,
    ]),
  ].toSorted((firstId, secondId) => firstId - secondId);
