interface RegionCampsData {
  enemyCamps: { members: { enemyKindId: number }[] }[];
}

// The kinds the regions' camps place and the extra kinds given, the bounties', the weekly bosses' and the Spiral Abyss's,
// each once, in ascending order of its id. The enemies dataset publishes them
export const collectEnemyKindIds = (
  regionDatas: readonly RegionCampsData[],
  extraKindIds: readonly number[],
): number[] =>
  [
    ...new Set([
      ...regionDatas.flatMap(({ enemyCamps }) =>
        enemyCamps.flatMap(({ members }) => members.map(({ enemyKindId }) => enemyKindId)),
      ),
      ...extraKindIds,
    ]),
  ].toSorted((firstId, secondId) => firstId - secondId);
