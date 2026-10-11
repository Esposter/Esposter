import { GameTextKey } from "genshin-text";

// The game's own unlock line for each feature a Reputation level opens, by the function id its level names
export const ReputationFunctionGameTextKeyMap: Record<number, GameTextKey> = {
  1001: GameTextKey.ReputationMondstadtOutcropSearch,
  1002: GameTextKey.ReputationMondstadtMerchantDiscounts,
};
