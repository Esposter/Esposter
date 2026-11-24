// How many queues a player of this Adventure Rank has open at the blacksmith.
// There is one for each of the queues' levels the rank has reached.
export const computeForgeQueueCount = (adventureRank: number, forgeQueuePlayerLevels: readonly number[]): number =>
  forgeQueuePlayerLevels.filter((playerLevel) => adventureRank >= playerLevel).length;
