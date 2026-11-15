import type { AchievementView } from "#src/models/achievement/AchievementView";
import type { UiMenuItem } from "#src/models/ui/UiMenuItem";

import { AchievementViews } from "#src/models/achievement/AchievementView";

export const AchievementViewItems: UiMenuItem<AchievementView>[] = Array.from(AchievementViews, (view) => ({
  title: view,
  value: view,
}));
