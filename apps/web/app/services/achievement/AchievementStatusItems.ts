import type { AchievementStatus } from "@/models/achievement/AchievementStatus";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { AchievementStatuses } from "@/models/achievement/AchievementStatus";

export const AchievementStatusItems: UiMenuItem<AchievementStatus>[] = Array.from(AchievementStatuses, (status) => ({
  title: status,
  value: status,
}));
