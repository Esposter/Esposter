import type { AchievementView } from "@/models/achievement/AchievementView";
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { AchievementViews } from "@/models/achievement/AchievementView";

export const AchievementViewItems: UiMenuItem<AchievementView>[] = [...AchievementViews].map((view) => ({
  title: view,
  value: view,
}));
