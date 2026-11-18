/* The traced marks the Achievements screen draws where the game draws its own: the header's laurel, the category badge, the
   medal of each achievement, its finished stamp's ring, and the frame's corner ornaments and bottom tab */
export const AchievementMark = {
  CategoryBadge: "CategoryBadge",
  FrameCornerBottomLeft: "FrameCornerBottomLeft",
  FrameCornerBottomRight: "FrameCornerBottomRight",
  FrameCornerTopLeft: "FrameCornerTopLeft",
  FrameTab: "FrameTab",
  Laurel: "Laurel",
  Medal: "Medal",
  StampRing: "StampRing",
} as const;
export type AchievementMark = (typeof AchievementMark)[keyof typeof AchievementMark];
