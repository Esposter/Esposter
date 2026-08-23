import type { SpriteConfiguration } from "#src/models/configuration/SpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "#src/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { EmitsOptionsFor } from "#src/util/types/EmitsOptionsFor";

export type SpriteEventEmitsOptions = EmitsOptionsFor<SpriteConfiguration> & GameObjectEventMapEmitsOptions;
