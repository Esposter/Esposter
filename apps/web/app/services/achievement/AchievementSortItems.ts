import type { AchievementSort } from "#src/models/achievement/AchievementSort";
import type { UiSelectItem } from "#src/models/ui/UiSelectItem";

import { AchievementSorts } from "#src/models/achievement/AchievementSort";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";

export const AchievementSortItems: UiSelectItem<AchievementSort>[] = Array.from(AchievementSorts, (sort) => ({
  meaning: UiIconMeaning.None,
  title: sort,
  value: sort,
}));
