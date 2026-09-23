import type { AchievementStatus } from "@/models/achievement/AchievementStatus";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { AchievementStatuses } from "@/models/achievement/AchievementStatus";

export const AchievementStatusItems: UiMenuItem<AchievementStatus>[] = [...AchievementStatuses].map((status) => ({
  title: status,
  value: status,
}));
