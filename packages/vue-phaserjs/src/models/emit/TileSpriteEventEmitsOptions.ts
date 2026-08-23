import type { TileSpriteConfiguration } from "#src/models/configuration/TileSpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type TileSpriteEventEmitsOptions = EmitsOptionsFor<TileSpriteConfiguration> &
  GameObjectEventMapEmitsOptions &
  Record<string, unknown[]>;
