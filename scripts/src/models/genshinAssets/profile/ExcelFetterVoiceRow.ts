import type { ExcelFetterCondition } from "#src/models/genshinAssets/profile/ExcelFetterStoryRow";

// One voice-over of a character's fetters in the dump's Fetters table: the character it belongs to, the conditions it opens
// On, whether the game hides it, and the text ids of its title and of the line it speaks
export interface ExcelFetterVoiceRow {
  avatarId: number;
  fetterId: number;
  isHiden: boolean;
  openConds: ExcelFetterCondition[];
  voiceFileTextTextMapHash: number;
  voiceTitleTextMapHash: number;
}
