import { ForgeQueueState, ForgeTab } from "genshin-interface";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The Materials tab open on an Enhancement Ore with its amount at five, the Mystic Enhancement Ore not yet learned, and one
// Queue forging with the Adventure Rank that opens the next one
export const props = {
  amount: 5,
  amountLabel: "Amount",
  amountMaximum: 19,
  closeLabel: "Back",
  coins: 375_527,
  gameText: ENGLISH_GAME_TEXT,
  materialsLabel: "Materials",
  obtainLabel: "Obtain",
  queues: [
    { forged: 0, id: 1, name: "Enhancement Ore", remainingSeconds: 2, state: ForgeQueueState.Forging, unlockRank: 0 },
    { forged: 0, id: 2, name: "", remainingSeconds: 0, state: ForgeQueueState.Idle, unlockRank: 0 },
    { forged: 0, id: 3, name: "", remainingSeconds: 0, state: ForgeQueueState.Locked, unlockRank: 15 },
  ],
  recipeId: 1,
  recipes: [
    { forgeSeconds: 3, id: 1, isLearned: true, name: "Enhancement Ore" },
    { forgeSeconds: 6, id: 2, isLearned: true, name: "Fine Enhancement Ore" },
    { forgeSeconds: 180, id: 3, isLearned: false, name: "Mystic Enhancement Ore" },
  ],
  requiredCoins: 25,
  startLabel: "Start",
  tab: ForgeTab.Materials,
  totalSeconds: 15,
};
