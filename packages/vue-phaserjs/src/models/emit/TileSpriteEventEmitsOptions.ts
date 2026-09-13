import type { TileSpriteConfiguration } from "#src/models/configuration/TileSpriteConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type TileSpriteEventEmitsOptions = EmitsOptionsFor<TileSpriteConfiguration> & GameObjectEventMapEmitsOptions;
