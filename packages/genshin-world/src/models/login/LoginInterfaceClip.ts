// The game's login interface clips a screen plays, by their names in its blocks
export const LoginInterfaceClip = {
  FadeIn: "Ani_LoginMainPage_FadeIn",
  FadeOut: "Ani_LoginMainPage_FadeOut",
  StartFadeIn: "Ani_LoginMainPage_Start_FadeIn",
  StartFadeOut: "Ani_LoginMainPage_Start_FadeOut",
  WhiteCurtain: "Ani_LoginMainPage_WhiteCurtain",
} as const;
export type LoginInterfaceClip = (typeof LoginInterfaceClip)[keyof typeof LoginInterfaceClip];
