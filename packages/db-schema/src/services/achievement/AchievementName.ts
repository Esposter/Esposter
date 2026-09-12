import { ClickerAchievementName } from "#src/models/achievement/ClickerAchievementName";
import { DungeonsAchievementName } from "#src/models/achievement/DungeonsAchievementName";
import { EmailAchievementName } from "#src/models/achievement/EmailAchievementName";
import { FlowchartAchievementName } from "#src/models/achievement/FlowchartAchievementName";
import { LikeAchievementName } from "#src/models/achievement/LikeAchievementName";
import { MessageAchievementName } from "#src/models/achievement/MessageAchievementName";
import { PostAchievementName } from "#src/models/achievement/PostAchievementName";
import { RoomAchievementName } from "#src/models/achievement/RoomAchievementName";
import { SpecialAchievementName } from "#src/models/achievement/SpecialAchievementName";
import { SurveyAchievementName } from "#src/models/achievement/SurveyAchievementName";
import { TableAchievementName } from "#src/models/achievement/TableAchievementName";
import { WebpageAchievementName } from "#src/models/achievement/WebpageAchievementName";
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
