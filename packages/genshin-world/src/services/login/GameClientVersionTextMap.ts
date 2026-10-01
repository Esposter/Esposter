import { GameClient } from "#src/models/splash/GameClient";

// The build string each client prints at the foot of its login screen, for the current build: the global one's as the
// 1440 high recording and the installed game's own log show it, and mainland China's under its CNREL prefix with the
// Same revision numbers, since no source publishes the mainland build's own and its one recording is of 3.8
export const GameClientVersionTextMap: Record<GameClient, string> = {
  [GameClient.Global]: "OSRELWin7.1.0_R48379043_S48511369_D48533839",
  [GameClient.Mainland]: "CNRELWin7.1.0_R48379043_S48511369_D48533839",
};
