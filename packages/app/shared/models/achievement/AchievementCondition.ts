import type { AndAchievementCondition } from "#shared/models/achievement/type/AndAchievementCondition";
import type { OrAchievementCondition } from "#shared/models/achievement/type/OrAchievementCondition";
import type { PropertyCondition } from "#shared/models/achievement/type/PropertyCondition";
import type { TimeAchievementCondition } from "#shared/models/achievement/type/TimeAchievementCondition";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";

export type AchievementCondition<TPath extends TRPCPaths> =
  | AndAchievementCondition<TPath>
  | OrAchievementCondition<TPath>
  | PropertyCondition<TPath>
  | TimeAchievementCondition;
