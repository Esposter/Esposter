import { ForgeQueueState } from "#src/models/ForgeQueueState";
import { ForgeTab } from "#src/models/ForgeTab";

// The Materials tab open on an Enhancement Ore with its amount at five, the Mystic Enhancement Ore not yet learned, and
// One queue forging with the Adventure Rank that opens the next one
export const props = {
  amount: 5,
  amountLabel: "Amount",
  amountMaximum: 19,
  coins: 375_527,
  materialsLabel: "Materials",
  obtainLabel: "Obtain",
  queues: [
    {
      id: 1,
      name: "Enhancement Ore",
      progressLabel: "Forging",
      state: ForgeQueueState.Forging,
      timeLabel: "Time Remaining: 2s",
    },
    { id: 2, name: "", progressLabel: "", state: ForgeQueueState.Idle, timeLabel: "" },
    { id: 3, name: "", progressLabel: "", state: ForgeQueueState.Locked, timeLabel: "Unlocked at Adventure Rank 15" },
  ],
  queuesLabel: "Forge Queues (1/3)",
  recipeId: 1,
  recipes: [
    { forgeTimeLabel: "Forge Time: 3s", id: 1, isLearned: true, name: "Enhancement Ore" },
    { forgeTimeLabel: "Forge Time: 6s", id: 2, isLearned: true, name: "Fine Enhancement Ore" },
    { forgeTimeLabel: "Forge Time: 3m", id: 3, isLearned: false, name: "Mystic Enhancement Ore" },
  ],
  requiredCoins: 25,
  startLabel: "Start",
  tab: ForgeTab.Materials,
  title: "Forge",
  totalTimeLabel: "Total Forge Time: 15s",
};
export const variants = { queues: { tab: ForgeTab.Queues } };
