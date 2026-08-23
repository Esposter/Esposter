import { ClickerAchievementName } from "#src/services/achievement/ClickerAchievementName";
import { DungeonsAchievementName } from "#src/services/achievement/DungeonsAchievementName";
import { EmailAchievementName } from "#src/services/achievement/EmailAchievementName";
import { FlowchartAchievementName } from "#src/services/achievement/FlowchartAchievementName";
import { LikeAchievementName } from "#src/services/achievement/LikeAchievementName";
import { MessageAchievementName } from "#src/services/achievement/MessageAchievementName";
import { PostAchievementName } from "#src/services/achievement/PostAchievementName";
import { RoomAchievementName } from "#src/services/achievement/RoomAchievementName";
import { SpecialAchievementName } from "#src/services/achievement/SpecialAchievementName";
import { SurveyAchievementName } from "#src/services/achievement/SurveyAchievementName";
import { TableAchievementName } from "#src/services/achievement/TableAchievementName";
import { WebpageAchievementName } from "#src/services/achievement/WebpageAchievementName";
import { mergeObjectsStrict } from "@esposter/shared";

export const AchievementName = mergeObjectsStrict(
  ClickerAchievementName,
  DungeonsAchievementName,
  EmailAchievementName,
  FlowchartAchievementName,
  LikeAchievementName,
  MessageAchievementName,
  PostAchievementName,
  RoomAchievementName,
  SpecialAchievementName,
  SurveyAchievementName,
  TableAchievementName,
  WebpageAchievementName,
);
export type AchievementName =
  | ClickerAchievementName
  | DungeonsAchievementName
  | EmailAchievementName
  | FlowchartAchievementName
  | LikeAchievementName
  | MessageAchievementName
  | PostAchievementName
  | RoomAchievementName
  | SpecialAchievementName
  | SurveyAchievementName
  | TableAchievementName
  | WebpageAchievementName;

export const AchievementNames: ReadonlySet<AchievementName> = new Set(Object.values(AchievementName));
