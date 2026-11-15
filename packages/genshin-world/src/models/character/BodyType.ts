// The body a character is built on, as the community names the game's five: its value is the game's own id for it
export const BodyType = {
  MediumFemale: "BODY_GIRL",
  MediumMale: "BODY_BOY",
  ShortFemale: "BODY_LOLI",
  TallFemale: "BODY_LADY",
  TallMale: "BODY_MALE",
} as const;
export type BodyType = (typeof BodyType)[keyof typeof BodyType];
