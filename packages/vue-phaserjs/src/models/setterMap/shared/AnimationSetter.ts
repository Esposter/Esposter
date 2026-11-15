export const AnimationSetter = { Animations: "animations", PlayAnimationKey: "playAnimationKey" } as const;
export type AnimationSetter = (typeof AnimationSetter)[keyof typeof AnimationSetter];
