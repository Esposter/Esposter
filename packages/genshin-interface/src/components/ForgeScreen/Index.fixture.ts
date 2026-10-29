import { ForgeQueueState } from "#src/models/ForgeQueueState";
import { ForgeTab } from "#src/models/ForgeTab";

// The Materials tab open on an Enhancement Ore with its amount at five, the Mystic Enhancement Ore not yet learned, and
// One queue forging with the Adventure Rank that opens the next one
export const props = {
  amount: 5,
  amountLabel: "Amount",
  amountMaximum: 19,
  closeLabel: "Back",
  coins: 375_527,
  materialCountLabel: "38 / 2",
  materialsBoxLabel: "Materials",
  materialsLabel: "Materials",
  obtainLabel: "Obtain",
  queueDetail: {
    forgedLabel: "Forged: 4/5",
    headingLabel: "Time Remaining: 2s",
    id: 1,
    isObtainable: true,
    progress: 1 / 3,
  },
  queues: [
    {
      id: 1,
      name: "Enhancement Ore",
      progressLabel: "Forging",
      readyLabel: "4 ready",
      state: ForgeQueueState.Forging,
      timeLabel: "",
    },
    { id: 2, name: "", progressLabel: "", readyLabel: "", state: ForgeQueueState.Idle, timeLabel: "" },
    {
      id: 3,
      name: "",
      progressLabel: "",
      readyLabel: "",
      state: ForgeQueueState.Locked,
      timeLabel: "Unlocked at Adventure Rank 15",
    },
  ],
  queuesLabel: "Forge Queues (1/3)",
  recipeId: 1,
  recipes: [
    { forgeTimeLabel: "Forge Time: 3s", id: 1, isOpen: true, name: "Enhancement Ore" },
    { forgeTimeLabel: "Forge Time: 6s", id: 2, isOpen: true, name: "Fine Enhancement Ore" },
    { forgeTimeLabel: "Forge Time: 3m", id: 3, isOpen: false, name: "Mystic Enhancement Ore" },
  ],
  refusalLabel: "",
  requiredCoins: 25,
  startLabel: "Start",
  supportLabel: "Support Character",
  tab: ForgeTab.Materials,
  title: "Forge",
  totalTimeLabel: "Total Forge Time: 15s",
  yieldCount: 1,
};
export const variants = {
  queues: { materialCountLabel: "28 / 2", tab: ForgeTab.Queues },
  refused: { refusalLabel: "Cannot forge any more Enhancement Ore today. Please wait till tomorrow." },
};
