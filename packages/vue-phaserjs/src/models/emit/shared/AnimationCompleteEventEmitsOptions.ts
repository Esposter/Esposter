import type { ANIMATION_COMPLETE_EVENT_PREFIX } from "#src/services/shared/constants";

// Phaser names each animation's completion event after the animation's key, so the names are open rather than a finite set
export type AnimationCompleteEventEmitsOptions = Record<`${typeof ANIMATION_COMPLETE_EVENT_PREFIX}${string}`, []>;
