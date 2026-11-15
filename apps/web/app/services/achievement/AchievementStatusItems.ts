import type { AchievementStatus } from "#src/models/achievement/AchievementStatus";
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";

import { AchievementStatuses } from "#src/models/achievement/AchievementStatus";

export const AchievementStatusItems: UiMenuItem<AchievementStatus>[] = Array.from(AchievementStatuses, (status) => ({
  title: status,
  value: status,
}));
