import type { SpriteConfiguration } from "#src/models/configuration/SpriteConfiguration";
import type { EmitsOptionsFor } from "#src/models/emit/EmitsOptionsFor";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";

export type SpriteEventEmitsOptions = EmitsOptionsFor<SpriteConfiguration> & GameObjectEventMapEmitsOptions;
