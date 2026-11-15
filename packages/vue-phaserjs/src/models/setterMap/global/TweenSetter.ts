export const TweenSetter = { Tween: "tween", Tweenchain: "tweenchain" } as const;
export type TweenSetter = (typeof TweenSetter)[keyof typeof TweenSetter];
