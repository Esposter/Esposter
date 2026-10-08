import type { PoiseSettings } from "#src/models/enemy/PoiseSettings";

import { PoiseType } from "#src/models/enemy/PoiseType";

// Each poise type's bar, as the wiki tabulates it
export const PoiseTypeSettingsMap: Record<PoiseType, PoiseSettings> = {
  [PoiseType.Boss]: { endurance: 0.5, length: 2000, refillPerSecond: 100, resetSeconds: 0 },
  [PoiseType.FungusBattle]: { endurance: 1, length: 225, refillPerSecond: 40, resetSeconds: 1 },
  [PoiseType.HumanoidDemiboss]: { endurance: 1, length: 210, refillPerSecond: 20, resetSeconds: 2 },
  [PoiseType.HumanoidGrunt]: { endurance: 1, length: 100, refillPerSecond: 5, resetSeconds: 3 },
  [PoiseType.HumanoidWeeklyBoss]: { endurance: 1, length: 500, refillPerSecond: 0, resetSeconds: 99_999 },
  [PoiseType.Minion]: { endurance: 1.2, length: 60, refillPerSecond: 5, resetSeconds: 5 },
  [PoiseType.OtherDemiboss]: { endurance: 0.7, length: 280, refillPerSecond: 20, resetSeconds: 2 },
  [PoiseType.OtherGrunt]: { endurance: 0.8, length: 120, refillPerSecond: 5, resetSeconds: 3 },
  [PoiseType.Slime]: { endurance: 1.5, length: 30, refillPerSecond: 2, resetSeconds: 5 },
};
