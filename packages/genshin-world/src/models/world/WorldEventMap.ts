import type { AchievementEvent } from "#src/models/achievement/AchievementEvent";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { ClearedCamp } from "#src/models/exploration/ClearedCamp";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestEvent } from "#src/models/quest/QuestEvent";
import type { QuestProgress } from "#src/models/quest/QuestProgress";
import type { Tip } from "#src/models/tip/Tip";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

// Every reaction one world system has to another, by its name, with the payload its listeners are handed. A system emits
// What it did, and each system that reads it listens, so none calls another's state directly
export interface WorldEventMap {
  achievementEvents: [AchievementEvent[]];
  bagChange: [Inventory];
  // A camp whose last enemy is defeated, with the point it stands at, which the save keeps as cleared
  campCleared: [camp: ClearedCamp];
  chestOpened: [];
  defeatEnemy: [Enemy];
  // A quest's progress moving from its progress before to the one that finishes it, emitted once on that move
  finishQuest: [quest: Quest, progress: QuestProgress, nextProgress: QuestProgress];
  parentQuestFinish: [];
  pickUpMora: [];
  questEvent: [QuestEvent];
  // The player jumping to a waypoint, a landmark or a map point, with the pose the character is placed at
  teleport: [pose: WorldJumpPose];
  // A tip the world shows for the first time in the save, with the tip it shows
  tipShown: [tip: Tip];
  // The World Level the player reaches, once for each level a rank or an ascension quest moves the World Level past
  worldLevelUp: [worldLevel: number];
}
