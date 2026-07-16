import { ClickerAchievementName } from "@/services/achievement/ClickerAchievementName";
import { DungeonsAchievementName } from "@/services/achievement/DungeonsAchievementName";
import { EmailAchievementName } from "@/services/achievement/EmailAchievementName";
import { FlowchartAchievementName } from "@/services/achievement/FlowchartAchievementName";
import { LikeAchievementName } from "@/services/achievement/LikeAchievementName";
import { MessageAchievementName } from "@/services/achievement/MessageAchievementName";
import { PostAchievementName } from "@/services/achievement/PostAchievementName";
import { RoomAchievementName } from "@/services/achievement/RoomAchievementName";
import { SpecialAchievementName } from "@/services/achievement/SpecialAchievementName";
import { SurveyAchievementName } from "@/services/achievement/SurveyAchievementName";
import { TableAchievementName } from "@/services/achievement/TableAchievementName";
import { WebpageAchievementName } from "@/services/achievement/WebpageAchievementName";
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
