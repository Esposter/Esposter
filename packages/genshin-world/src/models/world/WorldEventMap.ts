import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { QuestEvent } from "#src/models/quest/QuestEvent";

// Every reaction one world system has to another, by its name, with the payload its listeners are handed. A system emits
// What it did, and each system that reads it listens, so none calls another's state directly
export interface WorldEventMap {
  achievementEvents: [AchievementEvent[]];
  bagChange: [Inventory];
  defeatEnemy: [Enemy];
  parentQuestFinish: [];
  questEvent: [QuestEvent];
}
