import type { SpriteConfiguration } from "#src/models/configuration/SpriteConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { AnimationCompleteEventEmitsOptions } from "#src/models/emit/shared/AnimationCompleteEventEmitsOptions";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type SpriteEventEmitsOptions = AnimationCompleteEventEmitsOptions &
  EmitsOptionsFor<SpriteConfiguration> &
  GameObjectEventMapEmitsOptions;
