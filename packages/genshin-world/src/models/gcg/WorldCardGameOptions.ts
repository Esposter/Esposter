import type { Resident } from "#src/models/world/Resident";

// What the card game's reward is paid from: the card game's EXP and the games already paid as the save holds them, and
// The residents a week game is read off. The bag and wallet the reward is paid into are the session store's
export interface WorldCardGameOptions {
  getResidents: () => Resident[];
  savedCardGameExp: number;
  savedRewardedGameIds: number[];
}
