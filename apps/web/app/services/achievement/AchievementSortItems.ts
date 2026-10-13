import type { AchievementSort } from "@/models/achievement/AchievementSort";
import type { UiSelectItem } from "@/models/ui/UiSelectItem";

import { AchievementSorts } from "@/models/achievement/AchievementSort";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export const AchievementSortItems: UiSelectItem<AchievementSort>[] = Array.from(AchievementSorts, (sort) => ({
  meaning: UiIconMeaning.None,
  title: sort,
  value: sort,
}));
