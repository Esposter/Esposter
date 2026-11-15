export const WikiTitlePath = {
  HighPlunge: "High Plunge",
  LowPlunge: "Low Plunge",
  PlungingAttackCollision: "Plunging Attack Collision",
} as const;
export type WikiTitlePath = (typeof WikiTitlePath)[keyof typeof WikiTitlePath];
