import type { SpritesheetKey } from "#shared/models/dungeons/keys/spritesheet/SpritesheetKey";

import { Animations } from "phaser";

// The event Phaser emits once the animation registered under `spritesheetKey` finishes: the shared completion
// Prefix followed by the animation's own key.
export const getAnimationCompleteEventKey = (spritesheetKey: SpritesheetKey): string =>
  `${Animations.Events.ANIMATION_COMPLETE_KEY}${spritesheetKey}`;
