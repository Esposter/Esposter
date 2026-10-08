import { FORGE_QUEUE_PLAYER_LEVELS } from "#src/services/forging/constants";

// How many queues a player of this Adventure Rank has open at the blacksmith: one for each level the rank has reached
export const computeForgeQueueCount = (adventureRank: number): number =>
  FORGE_QUEUE_PLAYER_LEVELS.filter((playerLevel) => adventureRank >= playerLevel).length;
