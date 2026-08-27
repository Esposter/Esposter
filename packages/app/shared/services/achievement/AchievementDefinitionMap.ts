import { ClickerAchievementDefinitionMap } from "#shared/services/achievement/definitions/ClickerAchievementDefinitionMap";
import { DungeonsAchievementDefinitionMap } from "#shared/services/achievement/definitions/DungeonsAchievementDefinitionMap";
import { EmailAchievementDefinitionMap } from "#shared/services/achievement/definitions/EmailAchievementDefinitionMap";
import { FlowchartAchievementDefinitionMap } from "#shared/services/achievement/definitions/FlowchartAchievementDefinitionMap";
import { LikeAchievementDefinitionMap } from "#shared/services/achievement/definitions/LikeAchievementDefinitionMap";
import { MessageAchievementDefinitionMap } from "#shared/services/achievement/definitions/MessageAchievementDefinitionMap";
import { PostAchievementDefinitionMap } from "#shared/services/achievement/definitions/PostAchievementDefinitionMap";
import { RoomAchievementDefinitionMap } from "#shared/services/achievement/definitions/RoomAchievementDefinitionMap";
import { SheetAchievementDefinitionMap } from "#shared/services/achievement/definitions/SheetAchievementDefinitionMap";
import { SpecialAchievementDefinitionMap } from "#shared/services/achievement/definitions/SpecialAchievementDefinitionMap";
import { SurveyAchievementDefinitionMap } from "#shared/services/achievement/definitions/SurveyAchievementDefinitionMap";
import { WebpageAchievementDefinitionMap } from "#shared/services/achievement/definitions/WebpageAchievementDefinitionMap";

export const AchievementDefinitionMap = {
  ...ClickerAchievementDefinitionMap,
  ...DungeonsAchievementDefinitionMap,
  ...EmailAchievementDefinitionMap,
  ...FlowchartAchievementDefinitionMap,
  ...LikeAchievementDefinitionMap,
  ...MessageAchievementDefinitionMap,
  ...PostAchievementDefinitionMap,
  ...RoomAchievementDefinitionMap,
  ...SheetAchievementDefinitionMap,
  ...SpecialAchievementDefinitionMap,
  ...SurveyAchievementDefinitionMap,
  ...WebpageAchievementDefinitionMap,
} as const;
